// Read-only production check. No authentication, OTP, likes, views or other writes.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),base='https://ronaldobtc-code.github.io/mcu-tracker/';
(async()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const backend=html.match(/SUPABASE_URL\s*:\s*['"]([^'"]+)/)[1];
  const rpc=backend+'/rest/v1/rpc/get_meme_stats',totals=new Map(),errors=[],requests=[];
 const browser=await chromium.launch({headless:true,...(process.env.MCU_BROWSER_PATH?{executablePath:process.env.MCU_BROWSER_PATH}:{})});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},locale:'es-EC',timezoneId:'America/Guayaquil',serviceWorkers:'block'});
  await context.addInitScript(()=>{localStorage.setItem('mcu_tour_v1','1');localStorage.setItem('mcu_lang','es');});
  await context.route('**/*',route=>{
   const req=route.request(),url=req.url(),method=req.method();
   if(new URL(url).origin===new URL(base).origin&&['GET','HEAD'].includes(method))return route.continue();
   if(url===rpc&&['POST','OPTIONS'].includes(method))return route.continue();
   return route.abort();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',req=>{if(req.url()===rpc)console.error(JSON.stringify({rpcFailure:req.failure()}));});
  page.on('request',req=>{if(req.url()===rpc)requests.push({url:req.url(),method:req.method()});});
  page.on('response',async response=>{
   if(response.url()!==rpc||response.request().method()!=='POST')return;
   try{assert.equal(response.status(),200);for(const row of await response.json())totals.set(row.meme_id,row);}catch(e){errors.push(e.message);}
  });
  const checks=[];
  async function check(country,count){
   await page.selectOption('#feedCountry',country);
   await page.waitForFunction(n=>document.querySelectorAll('#feedList article').length>=n,Math.min(count,2));
   while(await page.locator('#feedList article').count()<count){
    await page.locator('#feedSentinel').scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
   }
   try{await page.waitForFunction(()=>[...document.querySelectorAll('.feed-actions span')].every(e=>/^\d+ vistas de cuentas únicas$/.test(e.textContent)));}
   catch(e){const diagnostic={checkedAt:new Date().toISOString(),url:base,result:'FAIL',country,writesBlocked:true,productionAggregateBrowserReadVerified:false,productionPersistenceVerified:false,requests,errors,states:await page.locator('#feedList article').allTextContents(),reason:'Browser did not display aggregate before timeout; investigate transport and application. Direct RPC is a separate check.'};fs.writeFileSync(path.join(root,'docs/browser-shared-stats-results.json'),JSON.stringify(diagnostic,null,2)+'\n');console.error(JSON.stringify(diagnostic));throw e;}
   const shown=await page.locator('#feedList article').evaluateAll(cards=>cards.map(card=>({id:card.dataset.memeId,views:card.querySelector('.feed-actions span').textContent,like:card.querySelector('.feed-like').textContent,disabled:card.querySelector('.feed-like').disabled})));
   assert.equal(shown.length,count);
   for(const card of shown){const row=totals.get(card.id);assert(row);assert.equal(row.liked,false);assert.equal(row.seen,false);assert.equal(card.views,row.views_count+' vistas de cuentas únicas');assert.equal(card.like,'Me gusta · '+row.likes_count);assert(card.disabled);}
   checks.push({country,photos:count,realCounterMatches:count,guestLikesDisabled:true});
  }
  await page.goto(base,{waitUntil:'domcontentloaded'});await check('EC',1);await check('BR',3);
  await page.reload({waitUntil:'domcontentloaded'});await check('BR',3);
  assert(requests.length>0);assert(requests.every(r=>r.url===rpc&&['POST','OPTIONS'].includes(r.method)));assert.deepEqual(errors,[]);
  const report={checkedAt:new Date().toISOString(),url:base,result:'PASS',productionAggregateReadVerified:true,productionPersistenceVerified:false,writesBlocked:true,authenticatedSession:false,checks,aggregateRequests:requests.length,uncaughtErrors:errors};
  fs.writeFileSync(path.join(root,'docs/browser-shared-stats-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
