// Optional browser tests: node tests/business.cjs (Playwright + Chrome/Edge).
const {chromium}=require('playwright');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const assert=require('node:assert/strict');
const html=readFileSync(join(__dirname,'../index.html'),'utf8')
 .replace(/<script src="[^\"]*"[^>]*><\/script>/g,'')
 .replace('  // PDF.js worker','  window.businessTest={dbPut,renderCollection,matchesDueFilter,invoiceDateKey,outstandingAmount,sumPending,csvCell,buildInvoiceRegisterCsv};\n  // PDF.js worker');
// Parse quoted CSV including separators, embedded newlines and escaped quotes.
function parseCsv(text,sep=';'){
 const rows=[];let row=[],cell='',quoted=false;
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
  else if(!quoted&&c===sep){row.push(cell);cell='';}
  else if(!quoted&&c==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}
  else cell+=c;
 }
 if(cell||row.length){row.push(cell);rows.push(row);}return rows;
}
(async()=>{
 for(const channel of (process.env.BROWSER_CHANNELS||'chrome,msedge').split(',')){
  const browser=await chromium.launch({channel,headless:true});
  try{
   const page=await browser.newPage({locale:'de-DE'});const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>r.request().url()==='http://invoice.test/'?r.fulfill({contentType:'text/html',body:html}):r.abort());
   await page.goto('http://invoice.test/');
   await page.locator('#collectionEnabled').check();
   await page.evaluate(async()=>{
    const date=offset=>{const d=new Date();d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
    const record=(id,overrides={})=>({id,header:{number:id,date:date(-10),dueDate:date(-1),typeCode:'380',orderNumber:'PO-42'},seller:{name:'Büro; "Müller"'},buyer:{name:'Kunde'},payment:{currency:'EUR',grossAmount:119,dueAmount:50,netAmount:100,taxAmount:19,iban:'DE89370400440532013000'},user:{status:'open',comment:'=1+1\nNotiz'},meta:{loadedAt:new Date().toISOString(),filename:'invoice.xml'},lineItems:[{productName:'A'},{productName:'B'}],...overrides});
    const items=[record('EUR-PARTIAL'),record('USD-OPEN',{payment:{currency:'USD',dueAmount:20}}),record('ZERO',{payment:{currency:'EUR',grossAmount:119,dueAmount:0}}),record('PAID',{user:{status:'paid'}}),record('CREDIT',{header:{number:'CREDIT',typeCode:'381',dueDate:date(-1)}}),record('DUPLICATE',{duplicateOf:'EUR-PARTIAL'}),record('MISSING',{header:{number:'MISSING',dueDate:'31.02.2026'}}),record('TODAY',{header:{number:'TODAY',dueDate:date(0)}}),record('WEEK',{header:{number:'WEEK',dueDate:date(7)}}),record('LATER',{header:{number:'LATER',dueDate:date(8)}})];
    for(let i=0;i<12;i++) items.push(record(`DONE-${i}`,{user:{status:'done'}}));
    for(const inv of items) await businessTest.dbPut(inv);
    await businessTest.renderCollection();
   });
   assert.match(await page.locator('#statPending').innerText(),/250,00 EUR/);
   assert.match(await page.locator('#statPending').innerText(),/20,00 USD/);
   assert.match(await page.locator('#statOverdue').innerText(),/50,00 EUR/);
   await page.locator('#collectionDueFilter').selectOption('overdue');
   await page.waitForFunction(()=>document.querySelectorAll('#collectionTable tbody tr').length===2);
   await page.locator('#collectionCurrency').selectOption('EUR');
   await page.waitForFunction(()=>document.querySelectorAll('#collectionTable tbody tr').length===1);
   const download=async id=>{
    const pending=page.waitForEvent('download');await page.locator(id).click();
    const file=await pending;return readFileSync(await file.path(),'utf8');
   };
   const register=parseCsv(await download('#exportRegisterCsv'));
   assert.equal(register.length,2);
   const values=Object.fromEntries(register[0].map((h,i)=>[h,register[1][i]]));
   assert.equal(values.invoice_number,'EUR-PARTIAL');assert.equal(values.due_amount,'50');
   assert.equal(values.seller,'Büro; "Müller"');assert.equal(values.comment,"'=1+1\nNotiz");
   assert.equal(values.overdue,'true');assert.equal(values.invoice_type,'380');
   const itemCsv=parseCsv(await download('#exportFilteredCsv'));
   assert.ok(itemCsv.every(row=>row.length===itemCsv[0].length));
   assert.ok(itemCsv[0].includes("price_base_quantity"));
   assert.equal(itemCsv.length,3); // two positions, one invoice
   assert.equal(JSON.parse(await download('#exportFilteredJson')).length,1);
   await page.reload();
   await page.waitForFunction(()=>document.querySelectorAll('#collectionTable tbody tr').length===1);
   assert.equal(await page.locator('#collectionDueFilter').inputValue(),'overdue');
   assert.equal(await page.locator('#collectionCurrency').inputValue(),'EUR');
   await page.locator('#collectionDueFilter').selectOption('week');
   await page.waitForFunction(()=>document.querySelectorAll('#collectionTable tbody tr').length===2);
   await page.locator('#collectionDueFilter').selectOption('missing');
   await page.waitForFunction(()=>document.querySelectorAll('#collectionTable tbody tr').length===1);
   assert.match(await page.locator('#collectionTable tbody').innerText(),/MISSING/);
   await page.locator('#collectionResetFilters').click();
   await page.locator('#collectionPageSize').selectOption('10');
   await page.waitForFunction(()=>document.querySelectorAll('#collectionTable tbody tr').length===10);
   assert.equal(parseCsv(await download('#exportRegisterCsv')).length,23);
   await page.locator('#collectionSearch').fill('PO-42');
   assert.equal(JSON.parse(await download('#exportFilteredJson')).length,17);
   await page.locator('#collectionSearch').fill('nonexistent');
   await page.waitForFunction(()=>document.querySelector('#statPending').textContent==='—');
   await page.locator('#exportRegisterCsv').click();
   await page.waitForFunction(()=>document.querySelector('#error').textContent.includes('Keine passenden'));
   assert.match(await page.locator('#error').innerText(),/Keine passenden/);
   await page.locator('#collectionResetFilters').click();
   await page.locator('#collectionSort').selectOption('due_asc');
   await page.locator('#collectionPageSize').selectOption('100');
   await page.waitForFunction(()=>document.querySelectorAll('#collectionTable tbody tr').length===22);
   assert.match(await page.locator('#collectionTable tbody tr').last().innerText(),/MISSING/);
   for(const [lang,id,label] of [['de','De','Fälligkeit'],['en','En','Due date'],['fr','Fr','Échéance'],['it','It','Scadenza'],['es','Es','Vencimiento']]){
    await page.locator('#lang'+id).click();
    assert.equal(await page.locator('label[for="collectionDueFilter"]').innerText(),label);
    assert.ok(!(await page.locator('#collectionDueFilter').innerText()).includes('undefined'));
   }
   const checks=await page.evaluate(()=>{
    const b=businessTest, inv={header:{dueDate:'2026-03-30'},payment:{dueAmount:1}};
    return [b.invoiceDateKey('29.02.2024'),b.invoiceDateKey('29.02.2025'),b.matchesDueFilter(inv,'week',new Date(2026,2,23,12)),b.matchesDueFilter(inv,'overdue',new Date(2026,2,30,12)),b.csvCell('-1,25'),b.csvCell('  =1+1'),b.csvCell('@SUM(A1)'),b.csvCell('\tvalue')];
   });
   assert.deepEqual(checks,['2024-02-29','',true,false,'"-1,25"','"\'  =1+1"','"\'@SUM(A1)"','"\'\tvalue"']);
   await page.locator('#langDe').click();
   if(process.env.SCREENSHOT_DIR){
    await page.screenshot({path:join(process.env.SCREENSHOT_DIR,`business-${channel}.png`),fullPage:true});
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:join(process.env.SCREENSHOT_DIR,`business-${channel}-mobile.png`),fullPage:true});
   }
   assert.deepEqual(errors,[]);
   console.log(`${channel}: currency totals, due filters, persistence, sorting, CSV/JSON exports, pagination, formula escaping and translations passed`);
  }finally{await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
