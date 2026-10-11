const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'..'),results=[],pause=ms=>new Promise(r=>setTimeout(r,ms));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace("await import('https://esm.sh/@supabase/supabase-js@2')","await Promise.reject(Error('Offline SDK'))").replace('</body>','<script>'+fs.readFileSync(path.join(root,'scripts/meme-feed.js'),'utf8')+'</script></body>');
function backend(){
 const likes=new Set(),views=new Set(),calls=[];let fail=false,hold=null,bad=false;
 return {likes,views,calls,set fail(v){fail=v},set hold(v){hold=v},set bad(v){bad=v},async fetch(url,options={}){
  const u=new URL(url),name=u.pathname.split('/').at(-1);calls.push({path:u.pathname,body:options.body,token:options.headers?.Authorization});
  if(u.pathname.includes('/data/memes/')){const c=name.slice(0,2);return{ok:true,json:async()=>({country:c,scope:'geographic',status:'complete',memes:[1,2,3,4,5].map(n=>({id:c.toLowerCase()+'-fixture-'+n,country:c,title:'Foto '+n,image:'data/memes/'+c+'/images/fixture-'+n+'.webp',width:600,height:700,location:'Escena de prueba',countryEvidence:{statement:'Simulación'},source:'https://commons.wikimedia.org/wiki/File:Test.jpg'}))})};}
  const p=JSON.parse(options.body||'{}'),owner=options.headers?.Authorization?.replace('Bearer token-','')||null;if(fail)return{ok:false,status:503,json:async()=>({})};
  if(hold&&name==='set_meme_like')await hold;
  const ids=p.p_ids||[p.p_id];if(name==='set_meme_like'){const key=owner+':'+p.p_id;p.p_liked?likes.add(key):likes.delete(key)}if(name==='record_meme_views')ids.forEach(id=>views.add(owner+':'+id));
  return{ok:true,json:async()=>ids.map(id=>({meme_id:id,likes_count:bad?-1:[...likes].filter(x=>x.endsWith(':'+id)).length,views_count:[...views].filter(x=>x.endsWith(':'+id)).length,liked:likes.has(owner+':'+id),seen:views.has(owner+':'+id)}))};
 }};
}
async function wait(predicate){const end=Date.now()+3000;while(!predicate()){if(Date.now()>end)throw Error('Expected state missing');await pause(15);}}
async function fixture(server=backend()){
 const observers=[],errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));let owner=null;
 const dom=new JSDOM(html,{url:'https://test.example/tracker/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.localStorage.setItem('mcu_tour_v1','1');w.localStorage.setItem('mcu_map_country','BR');w.fetch=(...args)=>server.fetch(...args);w.matchMedia=()=>({matches:false,addEventListener(){}});w.ResizeObserver=class{observe(){}disconnect(){}};
  w.IntersectionObserver=class{constructor(cb,options){this.cb=cb;this.options=options;this.targets=new Set();observers.push(this);}observe(e){this.targets.add(e)}unobserve(e){this.targets.delete(e)}disconnect(){this.targets.clear()}};
  w.Element.prototype.scrollIntoView=function(){};w.HTMLCanvasElement.prototype.getContext=()=>null;w.scrollTo=()=>{};
  Object.defineProperty(w.HTMLImageElement.prototype,'complete',{get:()=>true});Object.defineProperty(w.HTMLImageElement.prototype,'naturalWidth',{get:()=>600});w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,right:300,bottom:500});w.document.elementFromPoint=()=>w.document.querySelector('#feedList img');
 }});
  const w=dom.window,d=w.document;await wait(()=>d.querySelectorAll('#feedList article').length===2);await pause(30);
 w.CloudSync.user=()=>owner?{id:owner}:null;w.CloudSync.client=()=>({auth:{getSession:async()=>({data:{session:owner?{user:{id:owner},access_token:'token-'+owner}:null},error:null})}});
  return{w,d,server,observers,errors,async login(id){owner=id;w.MemeFeed.sessionChanged();await pause(50)},show(img,on=true){const o=observers.findLast(x=>x.options?.threshold);o.cb([{target:img,isIntersecting:on,intersectionRatio:on ? .75 : 0}]);},close:()=>{w.dispatchEvent(new w.Event('pagehide'));w.close()}};
}
async function test(name,fn){let f;try{f=await fixture();await fn(f);assert.deepEqual(f.errors,[]);results.push({name,status:'PASS'})}catch(e){results.push({name,status:'FAIL',detail:e.stack});process.exitCode=1}finally{f?.close()}}
(async()=>{
 await test('Landing: lote inicial, país único, scroll sin duplicados y fin real',async({w,d,server,observers})=>{
  assert(d.querySelector('#memeFeed'));assert.equal(d.querySelector('#feedCountry').value,'BR');assert.equal(d.querySelectorAll('#feedList article').length,2);assert.equal(d.querySelectorAll('#feedList img[src]').length,0);assert.equal(server.calls.filter(x=>x.path.includes('/data/memes/')).length,1);
  const lazy=observers.find(x=>x.options?.rootMargin==='300px');lazy.cb([{target:d.querySelector('#feedList img'),isIntersecting:true}]);assert(d.querySelector('#feedList img').src.includes('/BR/images/'));
  const more=observers.find(x=>x.options?.rootMargin==='150px');more.cb([{isIntersecting:true}]);more.cb([{isIntersecting:true}]);assert.equal(d.querySelectorAll('#feedList article').length,5);assert.equal(new Set([...d.querySelectorAll('#feedList article')].map(x=>x.dataset.memeId)).size,5);assert(d.querySelector('#feedEnd').textContent.includes('Fin'));assert(d.querySelector('#feedMore').hidden);await w.MemeFeed.open('BR');assert.equal(server.calls.filter(x=>x.path.includes('/data/memes/')).length,1);
 });
 await test('Doble clic: una petición, estado confirmado, retirar y recargar',async f=>{
  await f.login('A');let release;f.server.hold=new Promise(r=>release=r);const first=f.w.MemeFeed.toggle('br-fixture-1');f.w.MemeFeed.toggle('br-fixture-1');await pause(30);assert.equal(f.server.calls.filter(x=>x.path.endsWith('/set_meme_like')).length,1);release();await first;assert.equal(f.d.querySelector('.feed-like').getAttribute('aria-pressed'),'true');
  const reload=await fixture(f.server);try{await reload.login('A');assert.equal(reload.d.querySelector('.feed-like').getAttribute('aria-pressed'),'true')}finally{reload.close()}
  await f.w.MemeFeed.toggle('br-fixture-1');assert.equal(f.d.querySelector('.feed-like').getAttribute('aria-pressed'),'false');assert.equal(f.server.likes.size,0);
 });
 await test('Cambio A→B: JWT capturado, respuesta tardía no cambia B',async f=>{
  await f.login('A');let release;f.server.hold=new Promise(r=>release=r);const old=f.w.MemeFeed.toggle('br-fixture-1');await pause(30);await f.login('B');release();await old;assert.equal(f.d.querySelector('.feed-like').getAttribute('aria-pressed'),'false');assert(f.server.likes.has('A:br-fixture-1'));assert(!f.server.likes.has('B:br-fixture-1'));
 });
 await test('Vista: menos de un segundo no cuenta; reentrada y recarga deduplicadas',async f=>{
  await f.login('A');const img=f.d.querySelector('#feedList img');f.show(img);await pause(100);f.show(img,false);await pause(1100);assert.equal(f.server.views.size,0);f.show(img);await pause(1550);assert.equal(f.server.views.size,1);f.show(img,false);f.show(img);await pause(1550);assert.equal(f.server.views.size,1);assert.equal(f.server.calls.filter(x=>x.path.endsWith('/record_meme_views')).length,1);
  const reload=await fixture(f.server);try{await reload.login('A');reload.show(reload.d.querySelector('#feedList img'));await pause(1550);assert.equal(f.server.calls.filter(x=>x.path.endsWith('/record_meme_views')).length,1)}finally{reload.close()}
 });
 await test('Guía superpuesta e invitado no generan vistas',async f=>{
  f.show(f.d.querySelector('#feedList img'));await pause(1550);assert.equal(f.server.views.size,0);await f.login('A');f.d.body.classList.add('tour-on');f.show(f.d.querySelector('#feedList img'));await pause(1550);assert.equal(f.server.views.size,0);f.d.body.classList.remove('tour-on');await pause(100);assert.equal(f.server.views.size,0);await pause(1450);assert.equal(f.server.views.size,1);
 });
 await test('Fallo de red: sin éxito ficticio; reconsulta recupera estado',async f=>{
  await f.login('A');f.server.fail=true;await f.w.MemeFeed.toggle('br-fixture-1');assert(!f.server.likes.size);assert(f.d.querySelector('.feed-like').disabled);assert(!f.d.querySelector('#feedRetry').hidden);f.server.fail=false;f.d.querySelector('#feedRetry').click();await pause(50);assert(!f.d.querySelector('.feed-like').disabled);assert.equal(f.d.querySelector('.feed-like').getAttribute('aria-pressed'),'false');
 });
 await test('Cambiar país cancela colección antigua y rechaza contadores inválidos',async f=>{
  const original=f.server.fetch.bind(f.server);let release;f.w.fetch=(url,opts)=>new URL(url).pathname.endsWith('/EC.json')?new Promise(r=>release=()=>r(original(url,opts))):original(url,opts);
  const old=f.w.MemeFeed.open('EC');await f.w.MemeFeed.open('MX');release();await old;assert.equal(f.d.querySelector('#feedCountry').value,'MX');assert([...f.d.querySelectorAll('#feedList img')].every(i=>i.dataset.src.includes('/MX/')));f.server.bad=true;await f.login('B');assert(f.d.querySelector('.feed-like').disabled);assert.equal(f.d.querySelector('.feed-actions span').textContent,'Vistas no disponibles');
 });
 const report={checkedAt:new Date().toISOString(),result:results.every(r=>r.status==='PASS')?'PASS':'FAIL',network:'simulated; no production writes',checks:results};fs.writeFileSync(path.join(root,'docs/meme-feed-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1});
