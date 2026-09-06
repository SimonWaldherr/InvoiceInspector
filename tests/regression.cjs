// Run with: node tests/regression.cjs (requires Playwright and installed browsers).
const { chromium } = require('playwright');
const { readFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const html = readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8')
  .replace(/<script src="[^\"]*"[^>]*><\/script>/g, '')
  .replace('  // PDF.js worker', '  window.testInvoice = {parseXml, resetView, setLang, parseAmount, getData:()=>invoiceData, getWarnings:()=>warnings};\n  // PDF.js worker');
const cii = (amount = '<ram:LineTotalAmount>17</ram:LineTotalAmount>') => `<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"><rsm:ExchangedDocument><ram:ID>CII-TEST</ram:ID></rsm:ExchangedDocument><rsm:SupplyChainTradeTransaction><ram:IncludedSupplyChainTradeLineItem><ram:SpecifiedTradeProduct><ram:Name>Consulting</ram:Name></ram:SpecifiedTradeProduct><ram:SpecifiedLineTradeAgreement><ram:NetPriceProductTradePrice><ram:ChargeAmount>10.1234</ram:ChargeAmount><ram:BasisQuantity>100</ram:BasisQuantity></ram:NetPriceProductTradePrice></ram:SpecifiedLineTradeAgreement><ram:SpecifiedLineTradeDelivery><ram:BilledQuantity unitCode="H87">200</ram:BilledQuantity></ram:SpecifiedLineTradeDelivery><ram:SpecifiedLineTradeSettlement><ram:SpecifiedTradeSettlementLineMonetarySummation>${amount}</ram:SpecifiedTradeSettlementLineMonetarySummation></ram:SpecifiedLineTradeSettlement></ram:IncludedSupplyChainTradeLineItem><ram:ApplicableHeaderTradeSettlement><ram:SpecifiedTradeSettlementHeaderMonetarySummation><ram:LineTotalAmount>17</ram:LineTotalAmount><ram:TaxBasisTotalAmount>15</ram:TaxBasisTotalAmount><ram:TaxTotalAmount>0</ram:TaxTotalAmount><ram:GrandTotalAmount>15</ram:GrandTotalAmount><ram:DuePayableAmount>0</ram:DuePayableAmount></ram:SpecifiedTradeSettlementHeaderMonetarySummation></ram:ApplicableHeaderTradeSettlement></rsm:SupplyChainTradeTransaction></rsm:CrossIndustryInvoice>`;
const ubl = (credit = false, stated = true) => {
  const root = credit ? 'CreditNote' : 'Invoice', line = credit ? 'CreditNoteLine' : 'InvoiceLine', qty = credit ? 'CreditedQuantity' : 'InvoicedQuantity';
  return `<${root} xmlns="urn:oasis:names:specification:ubl:schema:xsd:${root}-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"><cbc:ID>UBL-TEST</cbc:ID><cac:LegalMonetaryTotal><cbc:LineExtensionAmount>17</cbc:LineExtensionAmount><cbc:TaxExclusiveAmount>15</cbc:TaxExclusiveAmount><cbc:PayableAmount>0</cbc:PayableAmount></cac:LegalMonetaryTotal><cac:${line}><cbc:ID>1</cbc:ID><cbc:${qty} unitCode="H87">200</cbc:${qty}>${stated ? '<cbc:LineExtensionAmount>17</cbc:LineExtensionAmount>' : ''}<cac:Item><cbc:Name>Consulting</cbc:Name></cac:Item><cac:Price><cbc:PriceAmount>10.1234</cbc:PriceAmount><cbc:BaseQuantity>100</cbc:BaseQuantity></cac:Price></cac:${line}></${root}>`;
};
(async()=>{
 for(const channel of (process.env.BROWSER_CHANNELS || 'chrome,msedge').split(',')){
  const browser=await chromium.launch({channel, headless:true});
  try {
   const page=await browser.newPage(); const errors=[];
   page.on('pageerror', e=>errors.push(e.message));
   await page.route('**/*', route=>route.abort());
   await page.setContent(html);
   const parse = async xml => page.evaluate(xml=>{testInvoice.resetView(); testInvoice.parseXml(xml);return {data:testInvoice.getData(),warnings:testInvoice.getWarnings()};},xml);
   for(const xml of [cii(),ubl(),ubl(true)]){
    const {data,warnings}=await parse(xml);
    assert.equal(data.payment.netAmount,15); assert.equal(data.payment.lineTotalAmount,17);
    assert.equal(data.payment.dueAmount,0); assert.equal(data.lineItems[0].lineNet,17);
    assert.equal(data.lineItems[0].unitPrice,10.1234); assert.equal(data.lineItems[0].priceBaseQuantity,100);
    assert.ok(!warnings.some(w=>w.msgKey==='warningsTotalsMismatch'));
   }
   assert.equal((await parse(cii())).data.payment.taxAmount,0);
   for(const xml of [cii(''),ubl(false,false),ubl(true,false)]) assert.equal((await parse(xml)).data.lineItems[0].lineNet,20.25);
   assert.equal((await parse(cii('<ram:LineTotalAmount>0</ram:LineTotalAmount>'))).data.lineItems[0].lineNet,0);
   assert.ok((await parse(cii('<ram:LineTotalAmount>99</ram:LineTotalAmount>'))).warnings.some(w=>w.msgKey==='warningsTotalsMismatch'));
   assert.equal((await parse(cii('').replace('<ram:BasisQuantity>100</ram:BasisQuantity>', ''))).data.lineItems[0].lineNet,2024.68);
   await parse(cii());
   await page.locator('#lineItemsSearch').fill('missing');
   assert.equal(await page.locator('#lineItemsTable tbody tr:visible').count(),0);
   await page.locator('#lineItemsSearch').fill('CONSULTING');
   assert.equal(await page.locator('#lineItemsTable tbody tr:visible').count(),1);
   for(const lang of ['de','en','fr','it','es']){
    await page.evaluate(lang=>testInvoice.setLang(lang),lang);
    assert.ok((await page.locator('#lineItemsCount').innerText()).includes('1'));
   }
   await page.locator('#lineItemsSearch').fill('missing');
   await page.emulateMedia({media:'print'});
   assert.equal(await page.locator('#lineItemsTable tbody tr:visible').count(),1);
   await page.emulateMedia({media:'screen'});
   await parse(ubl());
   assert.equal(await page.locator('#lineItemsSearch').inputValue(),'');
   assert.deepEqual(await page.evaluate(()=>['', ' ', '12oops','Infinity','0','-12.50','1,25'].map(testInvoice.parseAmount)),[null,null,null,null,0,-12.5,1.25]);
   assert.deepEqual(errors,[]);
   console.log(`${channel}: parser, precision, totals, search, print and five languages passed`);
  } finally {await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
