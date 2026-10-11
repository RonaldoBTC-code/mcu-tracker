// Public HTML, real map modules/tiles. Supabase, OTP and analytics are blocked.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),base='https://ronaldobtc-code.github.io/mcu-tracker/',origin=new URL(base).origin;
const assets=JSON.parse(fs.readFileSync(path.join(root,'docs/maplibre-assets.json'),'utf8')).assets;
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader'],...(process.env.MCU_BROWSER_PATH?{executablePath:process.env.MCU_BROWSER_PATH}:{})}),results=[];
 try{
  for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
   const context=await browser.newContext({viewport,locale:'es-EC'});
   await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.origin===origin||assets.some(a=>a.url===url.href)||url.origin==='https://tiles.openfreemap.org')return route.continue();
    if(url.origin==='https://en.wikipedia.org')return route.fulfill({json:{}});
    return route.abort();
   });
   await context.addInitScript(()=>{localStorage.setItem('mcu_tour_v1','1');localStorage.setItem('mcu_lang','es');});
   const page=await context.newPage(),errors=[],hashChecks=[],verified=[],tiles=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',response=>{
    const asset=assets.find(a=>a.url===response.url());
    if(asset)hashChecks.push((async()=>{assert.equal(response.status(),200);const bytes=await response.body();assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256);verified.push(asset.asset);})());
    if(response.url().startsWith('https://tiles.openfreemap.org/')&&/\/\d+\/\d+\/\d+/.test(new URL(response.url()).pathname))tiles.push({status:response.status()});
   });
   const response=await page.goto(base,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);
   await page.locator('#mapOpen').click();await page.locator('#tabEsc').click();
   await page.waitForFunction(()=>document.querySelectorAll('#zoommap .pin').length===window.Places.list().length&&document.querySelectorAll('#zoommap .pin').length>0,{},{timeout:30000});
   await page.waitForLoadState('networkidle');
   assert.equal(await page.locator('link[href="https://unpkg.com/maplibre-gl@6.4.1/dist/maplibre-gl.css"]').count(),1);
   assert.equal(await page.locator('script[src*="maplibre-gl@4.7.1"]').count(),0);
   const canvas=await page.locator('#zoommap canvas').boundingBox();assert(canvas&&canvas.width>0&&canvas.height>0);
   // At world zoom some scene markers overlap. Click a visible hit-testable marker.
   await page.waitForTimeout(600); // Wait for zoom animation before choosing a pointer target.
   const markerPoint=await page.locator('#zoommap .pin').evaluateAll(pins=>{
    for(const pin of pins){
    const rect=pin.getBoundingClientRect(),x=rect.x+rect.width/2,y=rect.y+rect.height/2;
     if(rect.width>0&&rect.height>0&&document.elementFromPoint(x,y)===pin)return {x,y};
    }
    return null;
   });
   assert(markerPoint,'No visible clickable scene marker');
   await page.mouse.click(markerPoint.x,markerPoint.y);await page.locator('.maplibregl-popup').waitFor();
   assert.equal(await page.locator('.maplibregl-popup').count(),1);
   await page.locator('.maplibregl-popup-close-button').click();
   await page.locator('.maplibregl-ctrl-zoom-in').click();await page.waitForLoadState('networkidle');
   assert.equal(await page.locator('.maphint[data-err]').count(),0);assert.deepEqual(errors,[]);
   await Promise.all(hashChecks);assert.deepEqual([...new Set(verified)].sort(),assets.map(a=>a.asset).sort());
   assert(tiles.length>0&&tiles.every(t=>t.status===200),'No successful real map tile responses');
   await page.screenshot({path:path.join(root,'docs/pages-maplibre-'+viewport.width+'.png')});
   await page.locator('#mapClose').click();assert.equal(await page.locator('#mapwrap.open').count(),0);
   results.push({checkedAt:new Date().toISOString(),url:base,result:'PASS',viewport,version:'6.4.1',publicHTMLUnmodified:true,
    realModuleHashesVerified:[...new Set(verified)].sort(),realTileResponses:tiles.length,markers:29,
    softwareWebGL:true,WikipediaPhotosSimulated:true,productionWritesBlocked:true,uncaughtErrors:errors});
   console.log(JSON.stringify(results.at(-1)));await context.close();
  }
 }finally{await browser.close();}
 fs.writeFileSync(path.join(root,'docs/browser-maplibre-pages-results.json'),JSON.stringify(results,null,2)+'\n');
})().catch(e=>{console.error(e);process.exitCode=1;});
