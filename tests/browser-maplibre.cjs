// Real MapLibre modules and software WebGL; no production database requests.
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),results=[],live=process.argv.includes('--live');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8')
 .replace(/SUPABASE_URL: '[^']+'/,"SUPABASE_URL: 'TU-PROYECTO'")
 .replace(/TMDB_TOKEN: '[^']+'/,"TMDB_TOKEN: ''")
 .replace("await import('https://esm.sh/@supabase/supabase-js@2')","await Promise.reject(Error('Audit SDK offline'))")
 .replace('map = new maplibregl.Map({','map = window.__auditMap = new maplibregl.Map({');
const fixture={version:8,sources:{test:{type:'geojson',data:{type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'Point',coordinates:[-20,25]}}]},
 attribution:'<details open onload="window.__attributionXss=1" ontoggle="window.__attributionXss=2">Audit attribution</details><a href="javascript:window.__attributionXss=3" onclick="window.__attributionXss=4">Audit link</a>'}},
 layers:[{id:'background',type:'background',paint:{'background-color':'#16243a'}},{id:'test',type:'circle',source:'test',paint:{'circle-radius':8,'circle-color':'#ff2255'}}]};
const server=http.createServer((req,res)=>{
 const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/,''),file=path.resolve(root,relative||'index.html');
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 if(file===path.join(root,'index.html')){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return;}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',file.endsWith('.json')?'application/json':file.endsWith('.js')?'application/javascript':file.endsWith('.webp')?'image/webp':'text/plain');res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 const assets=JSON.parse(fs.readFileSync(path.join(root,'docs/maplibre-assets.json'),'utf8'));
 for(const asset of assets.assets){const bytes=fs.readFileSync(path.join(root,'research/maplibre-6.4.1',asset.asset));assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),asset.sha256);}
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader'],...(process.env.MCU_BROWSER_PATH?{executablePath:process.env.MCU_BROWSER_PATH}:{})});
 try{
  for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
   const context=await browser.newContext({viewport,locale:'es-EC'}),requests=[];
   await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.origin===origin)return route.continue();
    if(url.origin==='https://unpkg.com'&&url.pathname.startsWith('/maplibre-gl@6.4.1/dist/')){
     const asset=assets.assets.find(a=>a.url===url.href);assert(asset,'Unexpected MapLibre dependency');requests.push(asset.asset);
     if(live)return route.continue();
     return route.fulfill({body:fs.readFileSync(path.join(root,'research/maplibre-6.4.1',asset.asset)),contentType:asset.asset.endsWith('.css')?'text/css':'application/javascript',headers:{'Access-Control-Allow-Origin':'*'}});
    }
    if(url.origin==='https://tiles.openfreemap.org')return live?route.continue():route.fulfill({json:fixture});
    if(url.origin==='https://en.wikipedia.org')return route.fulfill({json:{thumbnail:{source:'https://evil.invalid/x" onerror="window.__photoXss=1" data-x="'},content_urls:{desktop:{page:'javascript:window.__photoXss=2'}}}});
    return route.abort();
   });
   await context.addInitScript(()=>{localStorage.setItem('mcu_tour_v1','1');localStorage.setItem('mcu_lang','es');});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   if(live)await page.addInitScript(()=>{localStorage.removeItem('wiki_img_v3');});
   await page.goto(origin,{waitUntil:'domcontentloaded'});await page.locator('#mapOpen').click();await page.locator('#tabEsc').click();
   await page.waitForFunction(()=>window.__auditMap?.loaded()&&document.querySelectorAll('#zoommap .pin').length===window.Places.list().length,{},{timeout:30000});
   const count=await page.locator('#zoommap .pin').count();assert(count>0);
   const canvas=await page.locator('#zoommap canvas').boundingBox();assert(canvas&&canvas.width>0&&canvas.height>0);
   const zoom=await page.evaluate(()=>window.__auditMap.getZoom());await page.locator('.maplibregl-ctrl-zoom-in').click();
   await page.waitForFunction(before=>window.__auditMap.getZoom()>before,zoom);
   await page.evaluate(()=>window.__auditMap.jumpTo({center:window.Places.list().map(p=>[p[1],p[0]])[0],zoom:12}));
   await page.locator('#zoommap .pin').first().click();assert.equal(await page.locator('.maplibregl-popup').count(),1);
   assert.equal(await page.locator('.maplibregl-popup img,.maplibregl-popup a').count(),0);
   assert.equal(await page.evaluate(()=>window.__photoXss||0),0);
   await page.locator('.maplibregl-popup-close-button').click();assert.equal(await page.locator('.maplibregl-popup').count(),0);
   await page.waitForFunction(()=>window.__auditMap.loaded()&&!window.__auditMap.isMoving(),{},{timeout:30000});
   assert.equal(await page.locator('.maplibregl-ctrl-attrib-inner [onload],.maplibregl-ctrl-attrib-inner [ontoggle],.maplibregl-ctrl-attrib-inner [onclick],.maplibregl-ctrl-attrib-inner [href^="javascript:"]').count(),0);
   assert.equal(await page.evaluate(()=>window.__attributionXss||0),0);
   const styleErrors=await page.locator('.maphint[data-err]').count();assert.equal(styleErrors,0);
   assert.equal(requests.filter(x=>x==='maplibre-gl.css').length,1);
   assert(requests.includes('maplibre-gl-worker.mjs'));assert.deepEqual(errors,[]);
   await page.screenshot({path:path.join(root,'docs/maplibre-'+(live?'live-':'')+viewport.width+'.png')});
   await page.locator('#mapClose').click();assert.equal(await page.locator('#mapwrap.open').count(),0);
   await page.locator('#mapOpen').click();await page.locator('#tabEsc').click();await page.waitForFunction(()=>window.__auditMap?.loaded());
   assert.equal(requests.filter(x=>x==='maplibre-gl.css').length,1);
   results.push({checkedAt:new Date().toISOString(),result:'PASS',version:'6.4.1',viewport,markers:count,canvas,assetsRequested:[...new Set(requests)],
    softwareWebGL:true,style:live?'real OpenFreeMap tiles and real unpkg modules; Wikipedia photo transport simulated':'local GeoJSON fixture; not real OpenFreeMap tiles',productionWritesPerformed:false,
    applicationInstrumentation:'test-only map handle; public source otherwise unchanged',checks:['module/worker/CSS load','WebGL renders','all scene markers','zoom control','popup open/close',live?'real tile attribution has no unsafe attributes':'malicious attribution sanitized without execution','untrusted photo URLs cannot inject HTML or JavaScript','close/reopen without duplicate stylesheet'],uncaughtErrors:errors});
   console.log(JSON.stringify(results.at(-1)));await context.close();
  }
 }finally{await browser.close();}
 fs.writeFileSync(path.join(root,'docs/browser-maplibre-'+(live?'live-':'')+'results.json'),JSON.stringify(results,null,2)+'\n');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
