// Workflow regression tests. Requires Playwright and installed Chrome/Edge.
const {chromium}=require('playwright');
const {readFileSync,mkdirSync}=require('node:fs');
const {join}=require('node:path');
const assert=require('node:assert/strict');
const html=readFileSync(join(__dirname,'../index.html'),'utf8')
  .replace(/<script src="[^\"]*"[^>]*><\/script>/g,'')
  .replace('  // PDF.js worker','  window.workspaceTest={dbPut,allInvoices,renderCollection,failBulkWrite:()=>{dbPutMany=async()=>false;}};\n  // PDF.js worker');
(async()=>{
  for(const channel of (process.env.BROWSER_CHANNELS||'chrome,msedge').split(',')){
    const browser=await chromium.launch({channel,headless:true});
    try{
      const page=await browser.newPage({locale:'de-DE',viewport:{width:1440,height:1000}});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',route=>route.request().url()==='http://invoice.test/'?route.fulfill({contentType:'text/html',body:html}):route.abort());
      await page.goto('http://invoice.test/');
      assert.equal(await page.locator('#selectionTools').isVisible(),false);
      await page.locator('#collectionEnabled').check();
      await page.evaluate(async()=>{
        const date=offset=>{const d=new Date();d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
        for(let i=0;i<23;i++) await workspaceTest.dbPut({id:`INV-${i}`,header:{number:`RE-2026-${String(i).padStart(3,'0')}`,date:date(-5),dueDate:date(i<12?-1:3),typeCode:'380'},seller:{name:i%2?'Nordlicht Design GmbH':'Atelier Weber'},buyer:{name:'Beispiel GmbH'},payment:{currency:'EUR',netAmount:100,taxAmount:19,grossAmount:119,dueAmount:119},meta:{loadedAt:new Date().toISOString(),filename:'test.xml'},user:{status:'open',comment:`Notiz ${i}`},lineItems:[]});
        await workspaceTest.renderCollection();
      });
      // Opening from the collection must move keyboard focus to the current invoice.
      await page.locator('#collectionTable .ac button').first().click();
      assert.equal(await page.evaluate(()=>document.activeElement.id),'invoiceOverview');
      assert.equal(await page.locator('#btnXml').isDisabled(),true);
      await page.locator('#closeInvoice').click();
      assert.equal(await page.evaluate(()=>document.activeElement.id),'collectionSection');
      await page.locator('#collectionPageSize').selectOption('10');
      await page.waitForFunction(()=>document.querySelectorAll('#collectionTable tbody tr').length===10);
      const rows=page.locator('#collectionTable input[data-invoice-id]');
      const firstId=await rows.first().getAttribute('data-invoice-id');
      await rows.first().check();
      assert.equal(await page.locator('#selectPage').evaluate(el=>el.indeterminate),true);
      await page.locator('#selectPage').check();
      assert.match(await page.locator('#selectionCount').innerText(),/10 von 23/);
      await page.locator('#collectionNextPage').click();
      await page.waitForFunction(()=>document.querySelector('#collectionPageInfo').textContent.includes('2'));
      await rows.first().check();
      assert.match(await page.locator('#selectionCount').innerText(),/11 von 23/);
      const download=async id=>{
        const event=page.waitForEvent('download');await page.locator(id).click();
        return readFileSync(await (await event).path(),'utf8');
      };
      const exported=JSON.parse(await download('#exportSelectedJson'));
      assert.equal(exported.length,11);assert.ok(exported.some(inv=>inv.id===firstId));
      const journal=await download('#exportSelectedRegister');
      assert.equal(journal.trim().split('\n').length,12);
      assert.ok(journal.includes(exported[0].header.number));
      await page.locator('#bulkStatus').selectOption('checked');
      await page.locator('#applyBulkStatus').click();
      await page.waitForFunction(async()=> (await workspaceTest.allInvoices()).filter(inv=>inv.user.status==='checked').length===11);
      const records=await page.evaluate(()=>workspaceTest.allInvoices());
      const ids=new Set(exported.map(inv=>inv.id));
      records.forEach(inv=>{
        assert.equal(inv.user.status,ids.has(inv.id)?'checked':'open');
        assert.equal(inv.user.comment,`Notiz ${inv.id.split('-')[1]}`);
      });
      await page.reload();
      await page.waitForFunction(()=>document.querySelectorAll('#collectionTable tbody tr').length===10);
      assert.equal(await page.locator('#selectionTools').isVisible(),false);
      assert.equal((await page.evaluate(()=>workspaceTest.allInvoices())).filter(inv=>inv.user.status==='checked').length,11);
      await page.locator('[data-quick-filter="overdue"]').click();
      await page.waitForFunction(()=>document.querySelector('#collectionDueFilter').value==='overdue' && document.querySelectorAll('#collectionTable tbody tr').length===10);
      await page.locator('#selectPage').check();
      await page.locator('#selectAllMatches').click();
      assert.match(await page.locator('#selectionCount').innerText(),/12 von 12/);
      assert.equal(JSON.parse(await download('#exportSelectedJson')).length,12);
      await page.locator('[data-quick-filter="week"]').click();
      await page.waitForFunction(()=>document.querySelector('#selectionTools').classList.contains('hidden'));
      assert.equal(await page.locator('#selectPage').isChecked(),false);
      await page.locator('#selectPage').check();
      await page.locator('#selectAllMatches').click();
      await page.locator('#bulkStatus').selectOption('paid');
      await page.locator('#applyBulkStatus').click();
      await page.waitForFunction(()=>!document.querySelector('#collectionEmpty').classList.contains('hidden'));
      assert.match(await page.locator('#collectionEmpty').innerText(),/Keine Treffer/);
      assert.equal(await page.locator('#selectionTools').isVisible(),false);
      await page.locator('[data-quick-filter="all"]').click();
      await page.waitForFunction(()=>document.querySelectorAll('#collectionTable tbody tr').length===10);
      await page.locator('#collectionSearch').fill('Nordlicht');
      await page.waitForFunction(()=>document.querySelector('[data-quick-filter="all"]').getAttribute('aria-pressed')==='false');
      await page.locator('#collectionResetFilters').click();
      await page.locator('#selectPage').check();
      for(const [lang,button] of [['de','De'],['en','En'],['fr','Fr'],['it','It'],['es','Es']]){
        await page.locator('#lang'+button).click();
        assert.equal(await page.locator('html').getAttribute('lang'),lang);
        assert.ok(!(await page.locator('#selectionTools').innerText()).includes('undefined'));
        assert.ok((await page.locator('#selectionCount').innerText()).includes('10'));
      }
      await page.locator('#langDe').click();
      await page.locator('#clearSelection').click();
      await page.locator('#advancedFilters summary').click();
      await page.locator('#collectionGrossMin').fill('50');
      await page.reload();
      assert.equal(await page.locator('#advancedFilters').evaluate(el=>el.open),true);
      await page.locator('#collectionResetFilters').click();
      await page.locator('#advancedFilters summary').click();
      if(process.env.SCREENSHOT_DIR) mkdirSync(process.env.SCREENSHOT_DIR,{recursive:true});
      for(const theme of ['light','dark']){
        if(await page.locator('html').getAttribute('data-theme')!==theme) await page.locator('#themeToggle').click();
        for(const width of [1440,390]){
          await page.setViewportSize({width,height:1000});
          assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,`${channel}: no page overflow at ${width} (${theme})`);
          if(process.env.SCREENSHOT_DIR) await page.screenshot({path:join(process.env.SCREENSHOT_DIR,`workspace-${channel}-${theme}-${width}.png`),fullPage:true});
        }
      }
      // A failed IndexedDB transaction must not silently succeed in LocalStorage.
      await page.locator('#selectPage').check();
      await page.evaluate(()=>workspaceTest.failBulkWrite());
      await page.locator('#bulkStatus').selectOption('cancelled');
      await page.locator('#applyBulkStatus').click();
      await page.waitForFunction(()=>!document.querySelector('#error').classList.contains('hidden'));
      assert.equal((await page.evaluate(()=>workspaceTest.allInvoices())).some(inv=>inv.user.status==='cancelled'),false);
      assert.equal(await page.evaluate(()=>localStorage.getItem('invoiceInspector.legacyInvoices')),null);
      assert.deepEqual(errors,[]);
      console.log(`${channel}: page-spanning selection, selected exports, bulk status persistence, filter pruning, quick filters, five languages and responsive themes passed`);
    }finally{await browser.close();}
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
