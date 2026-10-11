const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
module.exports=async function checkFeed(page,{root,viewport,requests}){
 const countries=JSON.parse(fs.readFileSync(path.join(root,'docs/photo-coverage.json'))).countries,unique=new Set();let decoded=0;
 await page.waitForFunction(()=>document.querySelectorAll('#mc .row').length>0&&document.querySelector('#feedCountry').options.length===52);
 assert(await page.locator('#trackerView').isVisible());assert(await page.locator('#memeFeed').isHidden());assert.equal(requests.length,0);assert(await page.locator('#q').isVisible());
 await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('#mc .row')).opacity)===1);assert.equal(requests.length,0);
 await page.screenshot({path:path.join(root,'docs/tracker-entry-'+viewport.width+'.png'),fullPage:false});
 await page.locator('.chk').first().click();const progress=await page.evaluate(()=>window.SafeStorage.getItem('mcu_v4'));
 await page.locator('#feedOpen').click();await page.waitForFunction(()=>document.querySelector('#feedCountry').value==='EC');assert(await page.locator('#trackerView').isHidden());
 await page.locator('#memeFeed').scrollIntoViewIfNeeded();assert(await page.locator('#feedCountry').isVisible());
 await page.locator('#feedList img').first().scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#feedList img')?.naturalWidth>0);
 assert(requests.every(p=>p==='/data/memes/EC.json'||p.startsWith('/data/memes/EC/images/')));const initialRequests=[...requests];
 assert.equal(await page.locator('#feedMap, #feedMapCaption, .feed-map-panel').count(),0);assert.equal(await page.locator('#memeFeed svg').count(),0);
 assert.equal(await page.locator('#mapOpen').count(),1);assert.equal(await page.locator('#mapwrap').count(),1);assert(await page.locator('#mapwrap').isHidden());
 await page.selectOption('#feedCountry','CA');await page.waitForFunction(()=>document.querySelector('#feedList article')?.dataset.memeId.startsWith('ca-'));
 await page.locator('#feedCountry').focus();await page.locator('#feedCountry').press('Home');await page.locator('#feedCountry').press('ArrowDown');await page.locator('#feedCountry').press('Enter');
 await page.selectOption('#feedCountry','BR');await page.waitForFunction(()=>document.querySelector('#feedList article')?.dataset.memeId.startsWith('br-'));
 await page.waitForLoadState('networkidle');
 for(const country of countries){
  requests.length=0;await page.evaluate(c=>{window.__feedImageAssignments=[];return window.MemeFeed.open(c);},country);const items=JSON.parse(fs.readFileSync(path.join(root,'data/memes',country+'.json'))).memes;
  if(items.length){
   for(;;){const before=await page.locator('#feedList article').count();if(before>=items.length)break;for(let attempt=0;attempt<60&&await page.locator('#feedList article').count()===before;attempt++){await page.locator('#feedSentinel').scrollIntoViewIfNeeded();await page.waitForTimeout(250);}await page.waitForFunction(n=>document.querySelectorAll('#feedList article').length>n,before,{timeout:1000}).catch(async error=>{console.log(JSON.stringify({country,before,viewport,feedState:await page.evaluate(()=>({status:document.querySelector('#feedStatus').textContent,sentinel:document.querySelector('#feedSentinel').getBoundingClientRect().toJSON(),scrollY,viewport:innerHeight,cards:document.querySelectorAll('#feedList article').length,moreHidden:document.querySelector('#feedMore').hidden}))}));await page.screenshot({path:path.join(root,'docs/feed-failure.png')});throw error;});}
   assert.equal(await page.locator('#feedList article').count(),items.length);
   for(let n=0;n<items.length;n++){
    const img=page.locator('#feedList img').nth(n);await img.scrollIntoViewIfNeeded();await page.waitForFunction(i=>{const img=document.querySelectorAll('#feedList img')[i];return img?.complete&&img.naturalWidth>0},n).catch(async error=>{console.log(JSON.stringify({country,n,images:await page.locator('#feedList img').evaluateAll(xs=>xs.map(x=>({src:x.getAttribute('src'),pending:x.dataset.src,complete:x.complete,width:x.naturalWidth})))}));throw error;});
    const src=await img.getAttribute('src');assert(src.includes('/'+country+'/images/'));assert(!unique.has(src));unique.add(src);decoded++;
   }
   assert((await page.locator('#feedEnd').textContent()).includes('Fin de esta colección'));assert(await page.locator('#feedMore').isHidden());assert(await page.locator('.feed-like').first().isDisabled());
  }else{assert.equal(await page.locator('#feedList article').count(),0);assert((await page.locator('#feedStatus').textContent()).includes('Todavía'));}
  // Native request events can arrive after a previously assigned image was detached.
  // Assert catalogue requests plus the country at each actual image activation.
  assert(requests.filter(p=>p.endsWith('.json')).every(p=>p==='/data/memes/'+country+'.json'),country+': requested another catalogue: '+JSON.stringify(requests));
  const assigned=await page.evaluate(()=>window.__feedImageAssignments||[]);
  assert.equal(assigned.length,items.length,country+': not every image activation was verified');
  assert(assigned.every(x=>x.country===country&&x.path.startsWith('/data/memes/'+country+'/images/')),country+': activated an image after switching to another country: '+JSON.stringify(assigned));
 }
 await page.selectOption('#feedCountry','CA');await page.waitForFunction(()=>document.querySelector('#feedList article')?.dataset.memeId.startsWith('ca-'));await page.locator('#feedList img').first().scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#feedList img')?.complete&&document.querySelector('#feedList img').naturalWidth>0);await page.locator('#feedList img').first().evaluate(img=>img.decode());await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path:path.join(root,'docs/feed-section-'+viewport.width+'.png'),fullPage:false});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.selectOption('#feedCountry','BR');await page.locator('#feedClose').click();assert(await page.locator('#trackerView').isVisible());assert(await page.locator('#memeFeed').isHidden());assert.equal(await page.evaluate(()=>window.SafeStorage.getItem('mcu_v4')),progress);assert.equal(await page.locator('#feedOpen').getAttribute('aria-expanded'),'false');
 await page.goto(page.url().split('#')[0]+'#memeFeed',{waitUntil:'domcontentloaded'});await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelectorAll('#mc .row').length>0);assert(await page.locator('#trackerView').isVisible());assert(await page.locator('#memeFeed').isHidden());assert.equal(await page.locator('#feedList article').count(),0);assert.equal(await page.evaluate(()=>window.SafeStorage.getItem('mcu_v4')),progress);
 requests.length=0;await page.locator('#feedOpen').click();await page.waitForFunction(()=>document.querySelector('#feedCountry')?.value==='BR'&&document.querySelectorAll('#feedList article').length>=2);
 await page.selectOption('#feedCountry','EC');await page.locator('#feedList img').first().scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#feedList img')?.naturalWidth>0);await page.locator('#feedClose').click();await page.waitForLoadState('networkidle');requests.length=0;
 return {countriesTested:countries.length,uniquePhotos:unique.size,imageDisplayChecks:decoded,initialRequests,inlineMapAbsent:true,originalMapEntryPreserved:true,countrySelectorOptions:51,manualSelectionSurvivesReload:true,trackerInitialAndReloadVerified:true,hashDoesNotOpenMemes:true,noInitialMemeRequests:true,progressSurvivesNavigation:true,result:'PASS'};
};
