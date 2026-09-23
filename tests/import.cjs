// Batch-import regression tests. Requires Playwright and installed Chrome/Edge.
const {chromium}=require('playwright');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const assert=require('node:assert/strict');
const html=readFileSync(join(__dirname,'../index.html'),'utf8')
  .replace(/<script src="[^\"]*"[^>]*><\/script>/g,'')
  .replace('  // PDF.js worker','  window.importTest={handleFiles,allInvoices,extractXmlFromPdf,dbPut,restoreCollection};\n  // PDF.js worker');

function invoice(number='IMPORT-42',currency='EUR',credit=false){
  const root=credit?'CreditNote':'Invoice';
  return `<${root} xmlns="urn:oasis:names:specification:ubl:schema:xsd:${root}-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"><cbc:ID>${number}</cbc:ID><cbc:IssueDate>2026-09-01</cbc:IssueDate><cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode><cac:AccountingSupplierParty><cac:Party><cac:PartyName><cbc:Name>Import Supplier</cbc:Name></cac:PartyName></cac:Party></cac:AccountingSupplierParty><cac:LegalMonetaryTotal><cbc:TaxExclusiveAmount>100</cbc:TaxExclusiveAmount><cbc:TaxInclusiveAmount>119</cbc:TaxInclusiveAmount><cbc:PayableAmount>119</cbc:PayableAmount></cac:LegalMonetaryTotal></${root}>`;
}
const cii=`<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"><rsm:ExchangedDocument><ram:ID>CII-IMPORT</ram:ID><ram:TypeCode>380</ram:TypeCode></rsm:ExchangedDocument></rsm:CrossIndustryInvoice>`;
const xmlFile=(name,content)=>({name,type:'application/xml',content});
const runBatch=(page,files)=>page.evaluate(async files=>{
  await importTest.handleFiles(files.map(f=>new File([f.content],f.name,{type:f.type})));
  // The handleFiles promise must cover persistence, without a polling grace period.
  return importTest.allInvoices();
},files);

async function withPage(browser,callback){
  const page=await browser.newPage({locale:'de-DE'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.route('**/*',route=>route.request().url()==='http://invoice.test/'?route.fulfill({contentType:'text/html',body:html}):route.abort());
    await page.goto('http://invoice.test/');
    await page.locator('#collectionEnabled').check();
    await callback(page);
    assert.deepEqual(errors,[]);
  }finally{await page.close();}
}

(async()=>{
  for(const channel of (process.env.BROWSER_CHANNELS||'chrome,msedge').split(',')){
    const browser=await chromium.launch({channel,headless:true});
    try{
      await withPage(browser,async page=>{
        const valid=invoice(),files=[xmlFile('valid.xml',valid),xmlFile('cii.xml',cii),xmlFile('broken.xml','<broken>'),xmlFile('foreign.xml','<Invoice><ID>NOT-UBL</ID></Invoice>'),{name:'notes.txt',type:'text/plain',content:'Not an invoice'}];
        const records=await runBatch(page,files);
        assert.deepEqual(records.map(x=>x.header.number).sort(),['CII-IMPORT','IMPORT-42']);
        assert.equal(await page.locator('#importReport').isVisible(),true);
        const rows=page.locator('#importResults tbody tr');
        assert.equal(await rows.count(),files.length);
        for(const file of files) assert.ok((await rows.allTextContents()).some(text=>text.includes(file.name)),file.name);
        assert.ok((await page.locator('#importSummary').innerText()).trim());
        // A failure later in this batch must preserve the last successfully opened source.
        assert.equal(await page.locator('#invoiceOverview').isVisible(),true);
        assert.equal(await page.locator('#currentInvoiceNumber').innerText(),'CII-IMPORT');
        assert.equal(await page.locator('#btnXml').isEnabled(),true);
        const download=page.waitForEvent('download');await page.locator('#btnXml').click();
        assert.equal(readFileSync(await (await download).path(),'utf8'),cii);
        const deReport=await page.locator('#importReport').innerText();
        for(const language of ['En','Fr','It','Es','De']){
          await page.locator('#lang'+language).click();
          const report=await page.locator('#importReport').innerText();
          assert.ok(!report.includes('undefined'));
          assert.ok(!report.includes('[object Object]'));
          assert.equal(await rows.count(),files.length);
          for(const file of files) assert.ok(report.includes(file.name));
          if(language==='En') assert.notEqual(report,deReport);
        }
        // Reload verifies that completion meant durable records, not just an updated view.
        await page.reload();
        assert.deepEqual((await page.evaluate(()=>importTest.allInvoices())).map(x=>x.header.number).sort(),['CII-IMPORT','IMPORT-42']);
      });

      await withPage(browser,async page=>{
        const records=await runBatch(page,[xmlFile('first.xml',invoice()),xmlFile('again.xml',invoice()),xmlFile('dollars.xml',invoice('IMPORT-42','USD')),xmlFile('credit.xml',invoice('IMPORT-42','EUR',true))]);
        assert.equal(records.length,4);
        const duplicates=records.filter(x=>x.duplicateOf);
        assert.equal(duplicates.length,1);
        assert.equal(duplicates[0].meta.filename,'again.xml');
        assert.equal(duplicates[0].duplicateOf,records.find(x=>x.meta.filename==='first.xml').id);
        assert.ok(records.filter(x=>['dollars.xml','credit.xml'].includes(x.meta.filename)).every(x=>!x.duplicateOf));
        const statuses=await page.locator('#importResults tbody tr').allTextContents();
        assert.equal(statuses.length,4);
        assert.ok(statuses.find(x=>x.includes('again.xml')).trim());
      });

      await withPage(browser,async page=>{
        const records=await page.evaluate(async()=>{
          const original={id:'legacy-origin',header:{number:'LEGACY-42',date:'01.09.2026',typeCode:'380'},seller:{name:'Legacy Supplier'},payment:{currency:'EUR',grossAmount:119,dueAmount:119},user:{status:'open'},meta:{loadedAt:new Date().toISOString()},lineItems:[],dedupeKey:'legacy-42|legacy supplier|01.09.2026|119'};
          await importTest.dbPut(original);
          await importTest.restoreCollection({format:'InvoiceInspector collection backup',version:1,invoices:[{...original,id:'restored-copy',header:{...original.header,date:'2026-09-01'}}]});
          return importTest.allInvoices();
        });
        assert.equal(records.length,2);
        assert.equal(records.find(x=>x.id==='restored-copy').duplicateOf,'legacy-origin');
        assert.ok(!records.find(x=>x.id==='legacy-origin').duplicateOf);
      });

      for(const failure of ['write-only','write-aborted','indexeddb-unavailable','indexeddb-throws','both-unavailable']){
        await withPage(browser,async page=>{
          await page.evaluate(failure=>{
            if(failure==='write-only' || failure==='write-aborted'){
              const transaction=IDBDatabase.prototype.transaction;
              IDBDatabase.prototype.transaction=function(names,mode,...args){
                if(mode==='readwrite' && failure==='write-only') throw new DOMException('Test quota exhausted','QuotaExceededError');
                const tx=transaction.call(this,names,mode,...args);
                if(mode==='readwrite') queueMicrotask(()=>tx.abort());
                return tx;
              };
            }else{
              // A failed open request represents an unavailable IndexedDB backend.
              Object.defineProperty(window,'indexedDB',{configurable:true,value:{open(){
                if(failure==='indexeddb-throws') throw new DOMException('Test storage blocked','SecurityError');
                const request={};queueMicrotask(()=>request.onerror?.());return request;
              }}});
            }
            if(failure==='both-unavailable'){
              const setItem=Storage.prototype.setItem;
              Storage.prototype.setItem=function(key,value){
                if(key==='invoiceInspector.legacyInvoices') throw new DOMException('Test quota exhausted','QuotaExceededError');
                return setItem.call(this,key,value);
              };
            }
          },failure);
          const records=await runBatch(page,[xmlFile('storage.xml',invoice('STORAGE'))]);
          const fallback=await page.evaluate(()=>JSON.parse(localStorage.getItem('invoiceInspector.legacyInvoices')||'[]'));
          const stored=['indexeddb-unavailable','indexeddb-throws'].includes(failure);
          assert.equal(records.length,stored?1:0,failure);
          assert.equal(fallback.length,stored?1:0,failure);
          assert.equal(await page.locator('#importResults tbody tr.import-error').count(),stored?0:1,failure);
          assert.equal(await page.locator('#error').isVisible(),!stored,failure);
          assert.equal(await page.locator('#success').isVisible(),false,failure);
          assert.equal(await page.locator('#currentInvoiceNumber').innerText(),'STORAGE');
          assert.equal(await page.locator('#btnXml').isEnabled(),true);
          assert.equal(await page.locator('#fileInput').isEnabled(),true);
        });
      }

      await withPage(browser,async page=>{
        const payload={name:'repeat.xml',mimeType:'application/xml',buffer:Buffer.from(invoice('REPEAT'))};
        for(let count=1;count<=2;count++){
          await page.locator('#fileInput').setInputFiles(payload);
          await page.waitForFunction(async count=>(await importTest.allInvoices()).length===count,count);
          await page.waitForFunction(()=>!document.querySelector('#fileInput').disabled);
          assert.equal(await page.locator('#fileInput').inputValue(),'');
        }
        const records=await page.evaluate(()=>importTest.allInvoices());
        assert.equal(records.filter(x=>x.duplicateOf).length,1);
        await runBatch(page,[xmlFile('only-broken.xml','<broken>')]);
        assert.equal(await page.locator('#error').isVisible(),true);
        assert.ok((await page.locator('#error').innerText()).trim());
        assert.equal(await page.locator('#invoiceOverview').isVisible(),false);
        assert.equal(await page.locator('#importResults tbody tr').count(),1);
        assert.equal((await page.evaluate(()=>importTest.allInvoices())).length,2);
      });

      await withPage(browser,async page=>{
        await page.evaluate(xml=>{
          window.readFiles=[];
          const slow=new File([xml],'slow.xml',{type:'application/xml'});
          slow.text=()=>new Promise(resolve=>{readFiles.push('slow.xml');window.releaseSlow=()=>resolve(xml);});
          const skipped=new File([xml],'skipped.xml',{type:'application/xml'});
          skipped.text=async()=>{readFiles.push('skipped.xml');return xml;};
          window.slowBatch=importTest.handleFiles([slow,skipped]);
        },invoice('SLOW'));
        await page.waitForFunction(()=>typeof window.releaseSlow==='function');
        assert.equal(await page.locator('#importCancel').isVisible(),true);
        // A second request while busy must not mutate or enter the active batch.
        await page.evaluate(async xml=>{
          const overlap=new File([xml],'overlap.xml',{type:'application/xml'});
          overlap.text=async()=>{readFiles.push('overlap.xml');return xml;};
          await importTest.handleFiles([overlap]);
        },invoice('OVERLAP'));
        assert.deepEqual(await page.evaluate(()=>readFiles),['slow.xml']);
        assert.ok(!(await page.locator('#importResults').innerText()).includes('overlap.xml'));
        await page.locator('#importCancel').click();
        const records=await page.evaluate(async()=>{releaseSlow();await slowBatch;return importTest.allInvoices();});
        assert.deepEqual(await page.evaluate(()=>readFiles),['slow.xml']);
        assert.equal(records.length,1);
        assert.equal(records[0].header.number,'SLOW');
        assert.equal(await page.locator('#importResults tbody tr').count(),2);
        assert.ok((await page.locator('#importResults').innerText()).includes('skipped.xml'));
        assert.equal(await page.locator('#fileInput').isEnabled(),true);
        // Cancellation must release the importer for the next explicitly started batch.
        assert.equal((await runBatch(page,[xmlFile('after.xml',invoice('AFTER'))])).length,2);
      });

      await withPage(browser,async page=>{
        const result=await page.evaluate(async xml=>{
          let destroyed=0;
          const bytes=text=>new TextEncoder().encode(text);
          const pdf={getAttachments:async()=>({'metadata.xml':{filename:'metadata.xml',content:bytes('<metadata/>')},'factur-x.xml':{filename:'factur-x.xml',content:bytes(xml)}}),destroy:async()=>{destroyed++;}};
          window.pdfjsLib={getDocument:()=>({promise:Promise.resolve(pdf),destroy:async()=>{destroyed++;}})};
          const extracted=await importTest.extractXmlFromPdf(new File(['%PDF-1.7'],'invoice.pdf',{type:'application/pdf'}));
          const releasedAfterSuccess=destroyed;
          pdf.getAttachments=async()=>{throw new Error('broken attachments');};
          let rejected=false;
          try{await importTest.extractXmlFromPdf(new File(['%PDF-1.7'],'broken.pdf',{type:'application/pdf'}));}catch(_){rejected=true;}
          return {extracted,releasedAfterSuccess,rejected,releasedAfterFailure:destroyed};
        },invoice('PDF-IMPORT'));
        assert.equal(result.extracted,invoice('PDF-IMPORT'));
        assert.ok(result.releasedAfterSuccess>0,'PDF resources must be released after extraction');
        assert.equal(result.rejected,true);
        assert.ok(result.releasedAfterFailure>result.releasedAfterSuccess,'PDF resources must also be released on extraction failure');
      });
      console.log(`${channel}: batch validation, durable persistence, duplicate identity, storage failures/fallback, failure report, source preservation, repeated selection, translations, cancellation, busy protection and PDF extraction passed`);
    }finally{await browser.close();}
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
