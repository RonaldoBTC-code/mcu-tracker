const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
module.exports=async function checkFeed(page,{root,viewport,requests}){
 const countries=JSON.parse(fs.readFileSync(path.join(root,'docs/photo-coverage.json'))).countries,unique=new Set();let decoded=0;
 await page.waitForFunction(()=>document.querySelector('#feedCountry')?.value==='EC');
 await page.locator('#memeFeed').scrollIntoViewIfNeeded();assert(await page.locator('#feedCountry').isVisible());
 await page.locator('#feedList img').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#feedList img')?.naturalWidth>0);
 assert(requests.every(p=>p==='/data/memes/EC.json'||p.startsWith('/data/memes/EC/images/')));const initialRequests=[...requests];
 await page.locator('#feedMap').scrollIntoViewIfNeeded();assert(await page.locator('#feedMap svg').isVisible());assert.equal(await page.locator('#feedMap [data-country]').count(),51);
 await page.locator('#feedMap [data-country="CA"] .feed-map-hit').click();await page.waitForFunction(()=>document.querySelector('#feedCountry').value==='CA'&&document.querySelector('#feedList article')?.dataset.memeId.startsWith('ca-'));
 await page.locator('#feedMap [data-country="BR"]').press('Enter');await page.waitForFunction(()=>document.querySelector('#feedCountry').value==='BR'&&document.querySelector('#feedList article')?.dataset.memeId.startsWith('br-'));
 assert.equal(await page.locator('#feedMap [data-country="BR"]').getAttribute('aria-pressed'),'true');assert((await page.locator('#feedMapCaption').textContent()).includes('Brasil'));
 // Drain events from the map interaction before testing a new country's requests.
 await page.waitForLoadState('networkidle');
 for(const country of countries){
  requests.length=0;await page.evaluate(c=>{window.__feedImageAssignments=[];return window.MemeFeed.open(c);},country);const items=JSON.parse(fs.readFileSync(path.join(root,'data/memes',country+'.json'))).memes;
  if(items.length){
   for(;;){const before=await page.locator('#feedList article').count();if(before>=items.length)break;await page.locator('#feedSentinel').scrollIntoViewIfNeeded();await page.waitForFunction(n=>document.querySelectorAll('#feedList article').length>n,before).catch(async error=>{console.log(JSON.stringify({country,before,viewport,feedState:await page.evaluate(()=>({status:document.querySelector('#feedStatus').textContent,sentinel:document.querySelector('#feedSentinel').getBoundingClientRect().toJSON(),scrollY,viewport:innerHeight,cards:document.querySelectorAll('#feedList article').length,moreHidden:document.querySelector('#feedMore').hidden}))}));await page.screenshot({path:path.join(root,'docs/feed-failure.png')});throw error;});}
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
 await page.selectOption('#feedCountry','CA');await page.locator('#feedList img').first().scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#feedList img')?.naturalWidth>0);await page.screenshot({path:path.join(root,'docs/feed-landing-'+viewport.width+'.png'),fullPage:false});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.selectOption('#feedCountry','BR');await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#feedCountry')?.value==='BR'&&document.querySelectorAll('#feedList article').length>=2);
 await page.selectOption('#feedCountry','EC');await page.locator('#feedList img').first().scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#feedList img')?.naturalWidth>0);requests.length=0;
 return {countriesTested:countries.length,uniquePhotos:unique.size,imageDisplayChecks:decoded,initialRequests,inlineMapVisible:true,mapMarkers:51,mapClickAndKeyboardVerified:true,manualSelectionSurvivesReload:true,result:'PASS'};
};
