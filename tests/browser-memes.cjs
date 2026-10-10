// Optional real-browser audit: install playwright and a Chromium browser first.
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),reports=[];
const html=fs.readFileSync(path.join(root,'index.html'),'utf8')
 .replace(/SUPABASE_URL: '[^']+'/,"SUPABASE_URL: 'TU-PROYECTO'").replace(/TMDB_TOKEN: '[^']+'/,"TMDB_TOKEN: ''")
 .replace("await import('https://esm.sh/@supabase/supabase-js@2')","await Promise.reject(Error('Audit SDK offline'))");
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),relative=decodeURIComponent(url.pathname).replace(/^\/+/,''),file=path.resolve(root,relative||'index.html');
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 if(file===path.join(root,'index.html')){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return;}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',file.endsWith('.json')?'application/json':file.endsWith('.webp')?'image/webp':'text/plain');res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.MCU_BROWSER_PATH?{executablePath:process.env.MCU_BROWSER_PATH}:{})});
 try{
  for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
   const context=await browser.newContext({viewport,locale:'es-EC',timezoneId:'America/Guayaquil'});
   await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
   await context.addInitScript(()=>{localStorage.setItem('mcu_tour_v1','1');localStorage.setItem('mcu_lang','es');});
   const page=await context.newPage(),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/data/memes/'))requests.push(new URL(r.url()).pathname);});
   await page.goto(origin,{waitUntil:'domcontentloaded'});await page.locator('#mapOpen').click();
   await page.locator('#memeList img').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('#memeList img')?.complete&&document.querySelector('#memeList img').naturalWidth>0);
   assert.equal(requests.length,2);assert.equal(requests[0],'/data/memes/EC.json');assert(requests[1].startsWith('/data/memes/EC/images/'));
   const ecRequests=[...requests];requests.length=0;
   await page.evaluate(()=>window.MapMemes.open('CA'));
   await page.locator('#memeList img').first().scrollIntoViewIfNeeded();
   await page.locator('#memeList img').last().scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>[...document.querySelectorAll('#memeList img')].every(i=>i.complete&&i.naturalWidth>0));
   assert.equal(requests.length,2);assert(requests.every(p=>p==='/data/memes/CA.json'||p.startsWith('/data/memes/CA/images/')),JSON.stringify(requests));
   const closeBox=await page.locator('#mapClose').boundingBox();assert(closeBox&&closeBox.y>=0&&closeBox.y+closeBox.height<=viewport.height);
   await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('#memeList img')].map(img=>img.decode()));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
   await page.waitForTimeout(500); // Allow the dialog's opening transition to finish before visual QA.
   await page.screenshot({path:path.join(root,'docs/memes-'+viewport.width+'.png'),fullPage:false});
   const countries=await page.evaluate(()=>window.Region.countries().map(c=>c[0]));let maxOpenMs=0,maxSvgNodes=0,decoded=0,withPhotos=0;
   for(const code of countries){
    requests.length=0;
    const ms=await page.evaluate(async country=>{const t=performance.now();await window.MapMemes.open(country);return performance.now()-t;},code);
    maxOpenMs=Math.max(maxOpenMs,ms);
    const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/memes',code+'.json'),'utf8'));
    if(manifest.memes.length){withPhotos++;let previous='';
     for(let i=0;i<manifest.memes.length;i++){
      await page.locator('#memeList img').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelector('#memeList img')?.complete&&document.querySelector('#memeList img').naturalWidth>0);
      const src=await page.locator('#memeList img').getAttribute('src');assert.notEqual(src,previous);previous=src;decoded++;
      if(i+1<manifest.memes.length)await page.locator('#memeRandom').click();
     }
    }else{assert.equal(await page.locator('#memeList img').count(),0);assert((await page.locator('#memeStatus').textContent()).includes('Todavía'));}
    assert(requests.every(p=>p==='/data/memes/'+code+'.json'||p.startsWith('/data/memes/'+code+'/images/')),code+': '+JSON.stringify(requests));
    maxSvgNodes=Math.max(maxSvgNodes,await page.locator('#memeMap circle').count());
   }
   await page.selectOption('#memeCountry','CA');await page.waitForFunction(()=>document.querySelector('#memeStatus').textContent.includes('2 fotos'));
   await page.locator('#mapClose').click();await page.reload({waitUntil:'domcontentloaded'});await page.locator('#mapOpen').click();
   await page.waitForFunction(()=>document.querySelector('#memeCountry')?.value==='CA');
   await page.locator('#mapClose').click();
   // Guide remains usable and highlighted above page wrappers.
   await page.locator('#guideOpen').click();for(let i=0;i<6;i++)await page.locator('#tourNext').click();
   await page.waitForFunction(()=>document.querySelector('.row.tour-active-el'));
   await page.waitForTimeout(450);
   for(let step=7;step<=8;step++){
    await page.waitForFunction(()=>document.querySelector('.tour-active-el'));
    await page.waitForTimeout(450);
    const visible=await page.evaluate(()=>{let e=document.querySelector('.tour-active-el');if(!e)return false;for(;e&&e!==document.body;e=e.parentElement){if(Number(getComputedStyle(e).opacity)<1)return false;}return true;});assert(visible);
    await page.locator('#tourNext').click();
   }
   await page.waitForFunction(()=>!document.querySelector('#tourOverlay').classList.contains('active'));
   assert.deepEqual(errors,[]);assert(maxSvgNodes<1000);
   reports.push({viewport,countriesTested:countries.length,countriesWithPhotos:withPhotos,imagesDecoded:decoded,initialECRequests:ecRequests,maxCountryOpenMs:Math.round(maxOpenMs),maxSvgNodes,uncaughtErrors:errors,result:'PASS'});
   await context.close();
  }
 }finally{await browser.close();}
 fs.writeFileSync(path.join(root,'docs/browser-memes-results.json'),JSON.stringify(reports,null,2)+'\n');console.log(JSON.stringify(reports,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
