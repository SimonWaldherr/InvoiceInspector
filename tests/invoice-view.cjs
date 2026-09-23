// Current-invoice navigation and source availability (Playwright + Chrome/Edge).
const {chromium}=require('playwright');
const {readFileSync,mkdirSync}=require('node:fs');
const {join}=require('node:path');
const assert=require('node:assert/strict');
const html=readFileSync(join(__dirname,'../index.html'),'utf8')
  .replace(/<script src="[^\"]*"[^>]*><\/script>/g,'')
  .replace('  // PDF.js worker','  window.invoiceViewTest={renderInvoiceFromSaved};\n  // PDF.js worker');
const invoice={header:{number:'RE-2026-041',dueDate:'2026-09-30',typeCode:'380'},seller:{name:'Nordlicht Design GmbH'},buyer:{name:'Atelier Weber'},payment:{currency:'EUR',netAmount:100,taxAmount:19,grossAmount:119,dueAmount:0},lineItems:[{position:'1',productName:'Beratung',quantity:2,unit:'Stunden',unitPrice:50,lineNet:100,taxRate:19,lineGross:119}]};
const xml=`<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"><cbc:ID>XML-42</cbc:ID><cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode><cac:LegalMonetaryTotal><cbc:TaxExclusiveAmount>100</cbc:TaxExclusiveAmount><cbc:TaxInclusiveAmount>119</cbc:TaxInclusiveAmount><cbc:PayableAmount>0</cbc:PayableAmount></cac:LegalMonetaryTotal></Invoice>`;
(async()=>{
 for(const channel of (process.env.BROWSER_CHANNELS||'chrome,msedge').split(',')){
  const browser=await chromium.launch({channel,headless:true});
  try{
   const page=await browser.newPage({locale:'de-DE',viewport:{width:1440,height:1000}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',route=>route.request().url()==='http://invoice.test/'?route.fulfill({contentType:'text/html',body:html}):route.abort());
   await page.goto('http://invoice.test/');
   assert.equal(await page.locator('#invoiceOverview').isVisible(),false);
   await page.evaluate(inv=>invoiceViewTest.renderInvoiceFromSaved(inv),invoice);
   assert.equal(await page.evaluate(()=>document.activeElement.id),'invoiceOverview');
   assert.equal(await page.locator('#currentInvoiceNumber').innerText(),invoice.header.number);
   assert.equal(await page.locator('#overviewDue').innerText(),'0,00 EUR');
   assert.equal(await page.locator('#overviewGross').innerText(),'119,00 EUR');
   assert.equal(await page.locator('#overviewDueDate').innerText(),'2026-09-30');
   assert.equal(await page.locator('#btnXml').isDisabled(),true);
   assert.equal(await page.locator('#btnPdf').isDisabled(),true);
   assert.equal(await page.locator('#btnCsv').isEnabled(),true);
   assert.equal(await page.locator('#jumpCollection').isVisible(),false);
   await page.locator('#jumpLineItems').click();
   assert.equal(await page.evaluate(()=>document.activeElement.id),'lineItemsSection');
   await page.locator('#collectionEnabled').check();
   await page.locator('#collectionSearch').fill('unchanged filter');
   await page.locator('#jumpCollection').click();
   assert.equal(await page.evaluate(()=>document.activeElement.id),'collectionSection');
   for(const [button,label] of [['De','Geöffnete Rechnung'],['En','Current invoice'],['Fr','Facture ouverte'],['It','Fattura aperta'],['Es','Factura abierta']]){
    await page.locator('#lang'+button).click();
    assert.equal(await page.locator('.invoice-eyebrow').innerText(),label);
    assert.ok(!(await page.locator('#sourceAvailability').innerText()).includes('undefined'));
    assert.equal(await page.locator('#currentInvoiceNumber').innerText(),invoice.header.number);
   }
   await page.locator('#langDe').click();
   await page.locator('#lineItemsSearch').fill('Beratung');
   await page.locator('#langEn').click();
   assert.equal(await page.locator('#lineItemsSearch').inputValue(),'Beratung');
   assert.equal(await page.locator('#lineItemsTable tbody tr:visible').count(),1);
   await page.locator('#langDe').click();
   await page.emulateMedia({media:'print'});
   assert.equal(await page.locator('#invoiceOverview').isVisible(),true);
   assert.equal(await page.locator('#invoiceNavigation').isVisible(),false);
   assert.equal(await page.locator('#downloadButtons').isVisible(),false);
   await page.emulateMedia({media:'screen'});
   if(process.env.SCREENSHOT_DIR) mkdirSync(process.env.SCREENSHOT_DIR,{recursive:true});
   for(const width of [1440,390]){
    await page.setViewportSize({width,height:1000});
    for(const theme of ['light','dark']){
     if(await page.locator('html').getAttribute('data-theme')!==theme) await page.locator('#themeToggle').click();
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
     if(process.env.SCREENSHOT_DIR) await page.locator('#invoiceOverview').screenshot({path:join(process.env.SCREENSHOT_DIR,`invoice-${channel}-${width}-${theme}.png`)});
    }
   }
   await page.locator('#closeInvoice').click();
   assert.equal(await page.locator('#invoiceOverview').isVisible(),false);
   assert.equal(await page.locator('#headerSection').isVisible(),false);
   assert.equal(await page.evaluate(()=>document.activeElement.id),'collectionSection');
   assert.equal(await page.locator('#collectionSearch').inputValue(),'unchanged filter');
   await page.locator('#restoreLastInvoice').click();
   assert.equal(await page.locator('#currentInvoiceNumber').innerText(),invoice.header.number);
   await page.locator('#collectionEnabled').uncheck();
   await page.locator('#closeInvoice').click();
   assert.equal(await page.evaluate(()=>document.activeElement.id),'dropZone');
   // Import a real XML File, then reopen saved data to ensure source availability resets.
   await page.locator('#fileInput').setInputFiles({name:'invoice.xml',mimeType:'application/xml',buffer:Buffer.from(xml)});
   await page.waitForFunction(()=>document.activeElement.id==='invoiceOverview');
   assert.equal(await page.locator('#currentInvoiceNumber').innerText(),'XML-42');
   assert.equal(await page.locator('#btnXml').isEnabled(),true);
   assert.equal(await page.locator('#btnPdf').isDisabled(),true);
   assert.equal(await page.locator('#btnCsv').isDisabled(),true);
   assert.equal(await page.locator('#jumpLineItems').isVisible(),false);
   assert.equal(await page.locator('#overviewDue').innerText(),'0,00 EUR');
   const download=page.waitForEvent('download');await page.locator('#btnXml').click();
   assert.equal(readFileSync(await (await download).path(),'utf8'),xml);
   await page.locator('#restoreLastInvoice').click();
   assert.equal(await page.locator('#btnXml').isDisabled(),true);
   await page.evaluate(()=>invoiceViewTest.renderInvoiceFromSaved({header:{number:'<img src=x onerror=alert(1)>'},payment:{},lineItems:[{productName:'Missing quantity'}]}));
   assert.equal(await page.locator('#currentInvoiceNumber img').count(),0);
   for(const id of ['overviewNet','overviewGross','overviewDue','overviewDueDate']) assert.equal(await page.locator('#'+id).innerText(),'—');
   assert.equal(await page.locator('#lineItemsTable tbody tr').count(),1);
   await page.locator('#fileInput').setInputFiles({name:'broken.xml',mimeType:'application/xml',buffer:Buffer.from('<broken>')});
   await page.waitForFunction(()=>!document.querySelector('#error').classList.contains('hidden'));
   assert.equal(await page.locator('#invoiceOverview').isVisible(),false);
   assert.deepEqual(errors,[]);
   console.log(`${channel}: invoice summary, zero/missing amounts, focus navigation, source downloads, close/restore, languages and responsive/print layouts passed`);
  }finally{await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
