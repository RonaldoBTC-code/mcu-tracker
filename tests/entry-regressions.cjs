const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8')
 .replace("await import('https://esm.sh/@supabase/supabase-js@2')","await Promise.reject(Error('Test SDK offline'))")
 .replace('return {push,client:()=>sb,user:()=>user};','return {push,onSession,sendLink,renderForm,renderOut,inject:c=>sb=c,client:()=>sb,user:()=>user};')
 .replace('return { switchUser, paintAll, loadStats, pullMine, get };','return {set,switchUser,paintAll,loadStats,pullMine,get};');
const pause=ms=>new Promise(r=>setTimeout(r,ms));const results=[];
async function waitFor(predicate){const end=Date.now()+3000;while(!predicate()){if(Date.now()>end)throw Error('Estado esperado no apareció');await pause(20);}}
async function fixture(options={}){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://custom.example/tracker/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.localStorage.setItem('mcu_tour_v1','1');w.localStorage.setItem('mcu_lang','es');
  for(const [k,v]of Object.entries(options.storage||{}))w.localStorage.setItem(k,v);
  w.fetch=async()=>{throw Error('Test network offline')};w.matchMedia=()=>({matches:false,addEventListener(){}});
  w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};w.ResizeObserver=class{observe(){}disconnect(){}};
  w.Element.prototype.scrollIntoView=function(){};w.scrollTo=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>null;
  options.before?.(w);
 }});await pause(50);return {w:dom.window,d:dom.window.document,errors,close:()=>dom.window.close()};
}
function mock({readError=null,progress=[],reviews=[]}={}){
 const writes=[],authCalls=[];
 return {writes,authCalls,auth:{signInWithOtp:async args=>{authCalls.push(args);return {error:null}},signOut:async()=>({error:null})},rpc:async()=>({data:[]}),from:table=>({
   select:()=>({eq:()=>table==='mcu_progress'?{maybeSingle:async()=>({data:{watched:progress},error:readError})}:Promise.resolve({data:reviews,error:null})}),
   upsert:async row=>{writes.push({table,...row});return {error:null}}
 })};
}
async function test(name,fn){let f;try{f=await fixture();await fn(f);results.push({name,status:'PASS'})}catch(e){process.exitCode=1;results.push({name,status:'FAIL',detail:e.stack})}finally{await pause(60);f?.close()}}

const localCatalogue=data=>({scope:'geographic',status:'partial',...data,memes:data.memes.map(item=>({country:data.country,location:'Ubicación de prueba',countryEvidence:{url:'https://example.org/evidence',statement:'Ubicación simulada para esta prueba'},...item}))});
const session=id=>({user:{id,email:id.toLowerCase()+'@example.org'}});
(async()=>{
 await test('Primera carga offline: catálogo, 445 estrellas y búsqueda',async({d,errors})=>{assert.equal(d.querySelectorAll('.row').length,89);assert.equal(d.querySelectorAll('.st').length,445);assert.equal(errors.length,0);const q=d.querySelector('#q');q.value='IRON MAN';q.dispatchEvent(new d.defaultView.Event('input'));assert.equal(d.querySelectorAll('.row').length,3)});
 await test('Storage corrupto o tipo inválido no deja la página vacía',async()=>{for(const value of ['{','{}','null','"texto"','[null,1,{},"id:1"]']){const f=await fixture({storage:{mcu_v4:value,mcu_reviews:'null',tmdb_titles_v2:'null'}});try{assert.equal(f.d.querySelectorAll('.row').length,89);assert.equal(f.errors.length,0)}finally{f.close()}}});
 await test('Storage bloqueado permite ver y marcar',async()=>{const f=await fixture({before:w=>Object.defineProperty(w,'localStorage',{get(){throw new w.DOMException('Blocked','SecurityError')}})});try{f.d.querySelector('.chk').click();assert.equal(f.d.querySelector('#s-done').textContent,'1');assert.equal(f.errors.length,0);assert.equal(f.d.querySelector('#storageNotice').hidden,false)}finally{f.close()}});
 await test('Cuota agotada actualiza UI y conserva cambios en memoria',async({w,d,errors})=>{w.Storage.prototype.setItem=()=>{throw new w.DOMException('Quota','QuotaExceededError')};d.querySelector('.chk').click();assert.equal(d.querySelector('#s-done').textContent,'1');assert.equal(w.SafeStorage.getItem('mcu_v4:guest'),'["id:1"]');assert.equal(errors.length,0)});
 await test('Secciones se cierran y reabren con teclado',async({w,d})=>{const hdr=d.querySelector('.sec-hdr'),rows=hdr.nextElementSibling;hdr.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));assert.equal(rows.hidden,true);assert.equal(hdr.getAttribute('aria-expanded'),'false');hdr.dispatchEvent(new w.KeyboardEvent('keydown',{key:' ',bubbles:true}));assert.equal(rows.hidden,false);assert.equal(rows.style.maxHeight,'9999px');assert.equal(hdr.tabIndex,0)});
 await test('Marcar conserva foco y muestra nombre de película',async({d})=>{const b=d.querySelector('.chk');b.focus();b.click();assert.equal(d.activeElement.dataset.mid,'id:1');assert(!d.querySelector('#toast').textContent.includes('id —'));assert.equal(d.querySelectorAll('.st').length,445)});
 await test('Escape y API close cierran guía y restauran foco',async({w,d})=>{let closed=0;const actualClose=w.close;try{w.close=()=>closed++;w.Guide.start();assert.equal(d.activeElement.id,'tourClose');d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(closed,0);assert.equal(d.querySelector('#tourOverlay').classList.contains('active'),false);assert.equal(d.activeElement.id,'guideOpen');w.Guide.start();w.Guide.close();assert.equal(d.querySelector('#tourOverlay').classList.contains('active'),false);}finally{w.close=actualClose}});
 await test('OTP vuelve al despliegue actual y bloquea envío duplicado',async({w,d})=>{const c=mock();let finish;c.auth.signInWithOtp=args=>{c.authCalls.push(args);return new Promise(r=>finish=r)};w.CloudSync.inject(c);w.CloudSync.renderForm();d.querySelector('#cbEmail').value=' audit@example.org ';const a=w.CloudSync.sendLink(),b=w.CloudSync.sendLink();assert.equal(c.authCalls.length,1);assert.equal(c.authCalls[0].options.emailRedirectTo,'https://custom.example/tracker/');finish({error:null});await a;await b});
 await test('Error OTP recuperable sin excepción no manejada',async({w,d})=>{const c=mock();c.auth.signInWithOtp=async()=>{throw Error('Offline')};w.CloudSync.inject(c);w.CloudSync.renderForm();d.querySelector('#cbEmail').value='audit@example.org';await w.CloudSync.sendLink();assert.equal(d.querySelector('#cbSend').disabled,false);assert(d.querySelector('#cbMsg').textContent.includes('Error'))});
 await test('Sesiones A/B/invitado separan progreso y estrellas',async({w,d})=>{d.querySelector('.chk').click();await w.Reviews.set('id:1',4);const c=mock({progress:['id:2'],reviews:[{title:'id:2',rating:5}]});w.CloudSync.inject(c);await w.CloudSync.onSession(session('A'));assert.equal(w.eval('watched.has("id:1")'),false);assert.equal(w.Reviews.get('id:1'),0);assert.equal(w.Reviews.get('id:2'),5);w.CloudSync.inject(mock());await w.CloudSync.onSession(session('B'));assert.equal(w.eval('watched.size'),0);assert.equal(w.Reviews.get('id:2'),0);await w.CloudSync.onSession(null);assert.equal(w.CloudSync.user(),null);assert.equal(w.eval('watched.has("id:1")'),true);assert.equal(w.Reviews.get('id:1'),4)});
 await test('Error SELECT no genera upsert y conserva caché de cuenta',async({w})=>{w.SafeStorage.setItem('mcu_v4:user:A','["id:1"]');const c=mock({readError:Error('SELECT offline'),progress:['id:1','id:2']});w.CloudSync.inject(c);await w.CloudSync.onSession(session('A'));w.CloudSync.push(['id:1']);await pause(760);assert.equal(c.writes.length,0);assert.equal(w.eval('watched.has("id:1")'),true)});
 await test('Desmarcación remota sustituye copia antigua, sin unión',async({w})=>{w.SafeStorage.setItem('mcu_v4:user:A','["id:1"]');const c=mock();w.CloudSync.inject(c);await w.CloudSync.onSession(session('A'));assert.equal(w.eval('watched.size'),0);assert.equal(c.writes.length,0)});
 await test('Cambio de cuenta cancela debounce y respuestas tardías',async({w})=>{const c=mock();w.CloudSync.inject(c);await w.CloudSync.onSession(session('A'));w.CloudSync.push(['id:1']);await w.CloudSync.onSession(session('B'));await pause(760);assert.equal(c.writes.length,0);let finish;const a=mock();a.from=()=>({select:()=>({eq:()=>({maybeSingle:()=>new Promise(r=>finish=r)})})});w.CloudSync.inject(a);const old=w.CloudSync.onSession(session('A'));w.CloudSync.inject(mock());await w.CloudSync.onSession(session('B'));finish({data:{watched:['id:1']},error:null});await old;assert.equal(w.eval('watched.size'),0)});
 await test('Cambios offline se reintentan tras lectura válida',async({w,d})=>{const c=mock({readError:Error('Offline')});w.CloudSync.inject(c);await w.CloudSync.onSession(session('A'));d.querySelector('.chk').click();assert.equal(w.SafeStorage.getItem('mcu_v4:user:A:pending'),'1');const next=mock();w.CloudSync.inject(next);await w.CloudSync.onSession(session('A'),true);await pause(760);assert.equal(next.writes.length,1);assert.equal(next.writes[0].user_id,'A');assert.equal(next.writes[0].watched[0],'id:1');assert.equal(w.SafeStorage.getItem('mcu_v4:user:A:pending'),null)});
 await test('Cambios de idioma preservan estado de sincronización',async({w,d})=>{w.CloudSync.inject(mock());await w.CloudSync.onSession(session('A'));const before=d.querySelector('#cbMsg').textContent;w.Lang.set('en');assert.equal(d.querySelector('#cbMsg').textContent,before)});
 await test('Título externo se muestra como texto, sin HTML ejecutable',async({w,d})=>{w.Titles={get:()=>'<img id="xss" src=x onerror="alert(1)">'};w.renderList();assert.equal(d.querySelector('#xss'),null);assert(d.querySelector('.ttxt').textContent.includes('<img'))});
 await test('Estrellas antiguas de invitado permanecen disponibles',async()=>{const f=await fixture({storage:{mcu_reviews:'{"id:1":4}'}});try{assert.equal(f.w.Reviews.get('id:1'),4)}finally{f.close()}});
 await test('Estrellas offline se conservan y reintentan por cuenta',async({w})=>{const c=mock();w.CloudSync.inject(c);await w.CloudSync.onSession(session('A'));c.from=()=>({upsert:async()=>{throw Error('Offline')}});await w.Reviews.set('id:1',4);assert.equal(JSON.parse(w.SafeStorage.getItem('mcu_reviews:user:A:pending'))['id:1'],4);const next=mock();w.CloudSync.inject(next);await w.CloudSync.onSession(session('A'),true);assert.equal(w.Reviews.get('id:1'),4);assert.equal(next.writes.filter(x=>x.table==='reviews').length,1);assert.deepEqual(JSON.parse(w.SafeStorage.getItem('mcu_reviews:user:A:pending')),{});});
 await test('Importar progreso invitado requiere clic explícito',async({w,d})=>{d.querySelector('.chk').click();const c=mock();w.CloudSync.inject(c);await w.CloudSync.onSession(session('A'));assert.equal(w.eval('watched.size'),0);const button=[...d.querySelectorAll('#cbAuth button')].find(b=>b.textContent.includes('Importar'));assert(button);button.click();assert.equal(w.eval('watched.has("id:1")'),true)});
 await test('Mapa offline y respuesta antigua no reemplazan pestaña activa',async({w,d})=>{w.CloudSync.inject({...mock(),rpc:async()=>{throw Error('Offline')}});await w.WorldMap.open();assert(d.querySelector('#mapwrap').classList.contains('open'));w.WorldMap.close();assert.equal(d.activeElement.id,'mapOpen');let resolve;const c=mock();c.rpc=()=>new Promise(r=>resolve=r);c.from=()=>({select:async()=>({data:[]})});w.CloudSync.inject(c);const old=w.WorldMap.open();w.MapView.generation++;d.querySelector('#mapbody').textContent='Escenarios actuales';resolve({data:[]});await old;assert.equal(d.querySelector('#mapbody').textContent,'Escenarios actuales')});
 await test('Pasos 7 y 8: botones separados de filas, avanzan sin activar película',async({w,d})=>{
  w.Guide.start();for(let i=0;i<6;i++)d.querySelector('#tourNext').click();await pause(120);
  assert(d.querySelector('#tourStep').textContent.includes('7'));
  const card=d.querySelector('#tourCard');assert.equal(card.parentElement,d.body);assert(!card.closest('.tour-parent'));
  assert(Number(w.getComputedStyle(card).zIndex)>Number(w.getComputedStyle(d.querySelector('#tourOverlay')).zIndex));
  let pageClicks=0;d.querySelector('.row').addEventListener('click',()=>pageClicks++);
  d.querySelector('#tourNext').click();await pause(120);assert(d.querySelector('#tourStep').textContent.includes('8'));assert.equal(pageClicks,0);
  d.querySelector('#tourNext').click();await pause(120);assert(!d.querySelector('#tourOverlay').classList.contains('active'));assert.equal(w.getComputedStyle(card).pointerEvents,'none');assert.equal(w.getComputedStyle(card).visibility,'hidden');assert.equal(pageClicks,0);
 });
 await test('Cambios rápidos 7→8→7→8→fin cancelan reajustes anteriores',async({w,d})=>{
  w.Guide.start();for(let i=0;i<6;i++)w.Guide.next();w.Guide.next();w.Guide.prev();w.Guide.next();w.Guide.next();await pause(180);
  assert(!d.querySelector('#tourOverlay').classList.contains('active'));assert(!d.querySelector('#tourCard').classList.contains('on'));assert.equal(d.querySelectorAll('.tour-active-el,.tour-parent').length,0);
 });
 await test('Paso 7 sin películas y filas regeneradas permite terminar',async({w,d})=>{
  w.Guide.start();for(let i=0;i<6;i++)w.Guide.next();w.renderList();await pause(120);assert(d.querySelector('#tourCard').classList.contains('on'));
  d.querySelector('#q').value='sin-resultados-xyz';d.querySelector('#q').dispatchEvent(new w.Event('input'));await pause(120);assert.equal(d.querySelectorAll('.row').length,0);assert(d.querySelector('#tourCard').classList.contains('on'));
  d.querySelector('#tourNext').click();d.querySelector('#tourNext').click();assert(!d.querySelector('#tourOverlay').classList.contains('active'));
 });
 await test('Pasos 7 y 8: destino y todos sus contenedores conservan opacidad',async({w,d})=>{
  w.Guide.start();for(let i=0;i<6;i++)w.Guide.next();await pause(120);
  for(const selector of ['.row','.row .chk']){
   await waitFor(()=>d.querySelector(selector)?.classList.contains('tour-active-el'));
   const target=d.querySelector(selector);assert(target.classList.contains('tour-active-el'));
   for(let el=target;el&&el!==d.body;el=el.parentElement){
    const opacity=w.getComputedStyle(el).opacity;
    assert(opacity===''||Number(opacity)===1,`${el.className} oscurece el destino: ${opacity}`);
   }
   const ring=d.querySelector('#tourSpotlight');assert.equal(ring.parentElement,d.body);
   assert(ring.classList.contains('on'));assert.equal(w.getComputedStyle(ring).pointerEvents,'none');
   assert(Number(w.getComputedStyle(ring).zIndex)>11002);
   assert(Number(w.getComputedStyle(ring).zIndex)<Number(w.getComputedStyle(d.querySelector('#tourCard')).zIndex));
   if(selector==='.row'){w.Guide.next();await pause(120);}
  }
  w.Guide.close();assert.equal(d.querySelectorAll('.tour-path,.tour-parent,.tour-active-el').length,0);
 });
 await test('Memes Ecuador: solo archivo EC e imágenes EC diferidas, nunca catálogo global/MX',async({w,d})=>{
  const requests=[],images=[];let intersect;
  w.fetch=async url=>{requests.push(new URL(url).pathname);return {ok:true,json:async()=>(localCatalogue({country:'EC',memes:[
   {title:'EC de prueba',image:'data/memes/EC/images/fixture.webp'},
   {title:'MX no permitido',image:'data/memes/MX/images/fixture.webp'},
   {title:'Externo no permitido',image:'https://example.org/image.webp'},
   {title:'Ruta codificada no permitida',image:'data/memes/EC/images/%2f..%2fMX/fixture.webp'},
   {title:'Subcarpeta no permitida',image:'data/memes/EC/images/../MX/fixture.webp'}]}))};};
  const src=Object.getOwnPropertyDescriptor(w.HTMLImageElement.prototype,'src');
  Object.defineProperty(w.HTMLImageElement.prototype,'src',{get:src.get,set(value){images.push(new URL(value,d.baseURI).pathname);src.set.call(this,value)}});
  w.IntersectionObserver=class{constructor(cb){intersect=cb;}observe(){}unobserve(){}disconnect(){}};
  await w.MapMemes.open('EC');assert.deepEqual(requests,['/tracker/data/memes/EC.json']);assert.equal(images.length,0);
  assert.equal(d.querySelectorAll('#memeList img').length,1);assert(d.querySelector('#memeMap svg').getAttribute('aria-label').includes('Ecuador'));
  const img=d.querySelector('#memeList img');assert.equal(img.loading,'lazy');intersect([{target:img,isIntersecting:true}]);
  assert.deepEqual(images,['/tracker/data/memes/EC/images/fixture.webp']);assert(!requests.concat(images).some(x=>x.includes('/MX/')||x.endsWith('/MX.json')));
 });
 await test('Memes: selección manual persiste y respuestas tardías no cambian país',async({w,d})=>{
  const requests=[];let finish,oldSignal;
  w.fetch=(url,options)=>{const country=new URL(url).pathname.endsWith('/EC.json')?'EC':'MX';requests.push(country);
   if(country==='EC'){oldSignal=options.signal;return new Promise(resolve=>finish=resolve);}
   return Promise.resolve({ok:true,json:async()=>(localCatalogue({country:'MX',memes:[]}))});};
  const old=w.MapMemes.open('EC');const select=d.querySelector('#memeCountry');select.value='MX';select.dispatchEvent(new w.Event('change'));await pause(20);
  assert(oldSignal.aborted);assert.equal(w.SafeStorage.getItem('mcu_map_country'),'MX');
  finish({ok:true,json:async()=>(localCatalogue({country:'EC',memes:[{title:'Antiguo',image:'data/memes/EC/images/fixture.webp'}]}))});await old;
  assert.equal(d.querySelector('#memeCountry').value,'MX');assert.equal(d.querySelectorAll('#memeList img').length,0);
  w.WorldMap.close();await w.MapMemes.open();assert.equal(d.querySelector('#memeCountry').value,'MX');assert.deepEqual(requests,['EC','MX','MX']);
 });
 await test('Memes: detección falla sin país predeterminado ni descarga',async({w,d})=>{
  let requests=0;w.fetch=async()=>{requests++;throw Error('No debe solicitarse')};
  w.Intl.DateTimeFormat=()=>({resolvedOptions:()=>({timeZone:'UTC'})});Object.defineProperty(w.navigator,'language',{value:'en',configurable:true});
  w.SafeStorage.removeItem('mcu_region');w.SafeStorage.removeItem('mcu_map_country');await w.MapMemes.open();
  assert.equal(requests,0);assert.equal(d.querySelector('#memeCountry').value,'');assert(d.querySelector('#memeStatus').textContent.includes('No se pudo determinar'));
 });
 await test('Memes: entrada detecta EC y cerrar evita respuesta tardía',async({w,d})=>{
  let finish,signal;const requests=[];w.Intl.DateTimeFormat=()=>({resolvedOptions:()=>({timeZone:'America/Guayaquil'})});
  w.SafeStorage.removeItem('mcu_region');w.SafeStorage.removeItem('mcu_map_country');
  w.fetch=(url,options)=>{requests.push(new URL(url).pathname);signal=options.signal;return new Promise(resolve=>finish=resolve)};
  d.querySelector('#mapOpen').click();assert.equal(d.querySelector('#memeCountry').value,'EC');assert.deepEqual(requests,['/tracker/data/memes/EC.json']);
  w.WorldMap.close();finish({ok:true,json:async()=>(localCatalogue({country:'EC',memes:[]}))});await pause(20);
  assert(signal.aborted);assert(!d.querySelector('#mapwrap').classList.contains('open'));assert(!d.querySelector('#memeStatus').textContent.includes('Todavía'));
 });
 await test('Memes: país incorrecto rechazado y ausencia de observer no precarga',async({w,d})=>{
  w.fetch=async()=>({ok:true,json:async()=>(localCatalogue({country:'MX',memes:[{title:'MX',image:'data/memes/MX/images/fixture.webp'}]}))});
  await w.MapMemes.open('EC');assert.equal(d.querySelectorAll('#memeList img').length,0);assert(d.querySelector('#memeStatus').textContent.includes('No se pudieron'));
  w.IntersectionObserver=undefined;w.fetch=async()=>({ok:true,json:async()=>(localCatalogue({country:'EC',memes:[{title:'EC',image:'data/memes/EC/images/fixture.webp'}]}))});
  await w.MapMemes.open('EC');assert.equal(d.querySelector('#memeList img').getAttribute('src'),null);assert.equal(d.querySelector('#memeList button').textContent,'Cargar imagen');
 });
 await test('Procedencia por país: fotos únicas, hashes y cobertura incompleta explícita',async({w})=>{
  const codes=w.Region.countries().map(c=>c[0]),paths=new Set(),contentHashes=new Set();assert.equal(codes.length,51);
  const sources=JSON.parse(fs.readFileSync(path.join(__dirname,'../scripts/photo-sources.json'),'utf8'));
  const coverage=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/photo-coverage.json'),'utf8'));
  for(const code of codes){const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/memes',code+'.json'),'utf8'));
   assert.equal(data.country,code);assert.equal(data.scope,'geographic');assert.equal(data.catalogueRole,'scene-location');assert.equal(data.status,data.memes.length>=3?'complete':data.memes.length?'partial':'pending');
   for(const item of data.memes){const source=sources.find(s=>s.id===item.id);assert(source);assert.equal(item.country,code);assert.equal(item.country,source.country);assert.equal(item.creator,source.creator);assert.equal(item.license,source.license);assert.deepEqual(item.countryEvidence,source.countryEvidence);assert(item.location&&item.countryEvidence.statement&&new URL(item.countryEvidence.url).protocol==='https:');assert.equal(item.hasMemeTextOverlay,false);assert(item.reviewedVisually&&item.visualGag&&item.characters.length);assert(item.image.startsWith('data/memes/'+code+'/images/'));assert.equal(item.source,source.source);assert(item.width>0&&item.width<=768);assert(item.height>0&&item.height<=768);
    const bytes=fs.readFileSync(path.join(__dirname,'..',item.image));assert(bytes.length<100000);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert(!paths.has(item.image));paths.add(item.image);assert(!contentHashes.has(item.outputFingerprint.sha256));contentHashes.add(item.outputFingerprint.sha256);
   }
   assert.equal(coverage.perCountry[code],data.memes.length);
  }
  assert.equal(paths.size,sources.length);assert.equal(coverage.photos,sources.length);assert.equal(coverage.complete,coverage.pendingCountries.length===0);assert.equal(coverage.crossCountryDuplicatePhotos,0);
 });
 await test('Sin reciclaje internacional: rechaza el catálogo compartido del PR 5',async({w,d})=>{
  w.fetch=async()=>({ok:true,json:async()=>({country:'EC',scope:'international',memes:[{title:'Marvel',image:'data/memes/international/images/avengers-office.webp'}]})});
  await w.MapMemes.open('EC');assert.equal(d.querySelectorAll('#memeList img').length,0);assert(d.querySelector('#memeStatus').textContent.includes('No se pudieron'));
 });
 await test('Origen sin acreditar o distinto se excluye aunque la ruta sea local',async({w,d})=>{
  w.fetch=async()=>({ok:true,json:async()=>({country:'EC',scope:'geographic',memes:[
   {title:'Sin evidencia',country:'EC',image:'data/memes/EC/images/missing.webp'},
   {title:'Otro país',country:'MX',location:'México',countryEvidence:{statement:'México'},image:'data/memes/EC/images/cross.webp'}]})});
  await w.MapMemes.open('EC');assert.equal(d.querySelectorAll('#memeList img').length,0);assert(d.querySelector('#memeStatus').textContent.includes('Todavía'));
 });
 await test('Atribución: dominio público enlaza su declaración y rechaza HTML y hosts externos',async({w,d})=>{
  const source='https://commons.wikimedia.org/wiki/File:Example.jpg';let item={title:'Foto <img src=x>',creator:'<script>bad()</script>',image:'data/memes/EC/images/photo-1.webp',source,license:'Public domain',licenseUrl:source};
  w.fetch=async()=>({ok:true,json:async()=>(localCatalogue({country:'EC',memes:[item]}))});await w.MapMemes.open('EC');
  const links=d.querySelectorAll('#memeList figcaption a');assert.equal(links.length,2);assert.equal(links[1].href,source);assert.equal(links[1].textContent,'Public domain');assert.equal(links[1].rel,'noopener noreferrer');assert.equal(d.querySelectorAll('#memeList figcaption script,#memeList figcaption img').length,0);
  item={...item,source:'https://www.dvidshub.net/image/2433478/residents-embrace',licenseUrl:'https://www.dvidshub.net/about/copyright',rightsNotice:'Aviso <img src=x onerror=bad()>'};await w.MapMemes.open('EC');assert.equal(d.querySelectorAll('#memeList figcaption a').length,2);assert(d.querySelector('#memeList figcaption').textContent.includes(item.rightsNotice));assert.equal(d.querySelectorAll('#memeList figcaption img').length,0);
  item={...item,licenseUrl:'https://www.dvidshub.net/about/copyright?redirect=https://example.org'};await w.MapMemes.open('EC');assert.equal(d.querySelectorAll('#memeList figcaption a').length,1);
  item={...item,source:'javascript:bad()',licenseUrl:'https://example.org/license'};await w.MapMemes.open('EC');assert.equal(d.querySelectorAll('#memeList figcaption a').length,0);
 });
 await test('Foto aleatoria: un solo elemento, sin repetición inmediata ni otro fetch',async({w,d})=>{
  let calls=0;w.Math.random=()=>0;w.fetch=async()=>{calls++;return {ok:true,json:async()=>(localCatalogue({country:'EC',memes:[1,2,3].map(n=>({title:'Foto real de prueba '+n,image:'data/memes/EC/images/photo-'+n+'.webp'}))}))};};
  await w.MapMemes.open('EC');let last='';const cycle=[];for(let i=0;i<12;i++){const images=d.querySelectorAll('#memeList img');assert.equal(images.length,1);const current=images[0].dataset.src;assert.notEqual(current,last);last=current;cycle.push(current);if(cycle.length===3){assert.equal(new Set(cycle).size,3);cycle.length=0;}d.querySelector('#memeRandom').click();}assert.equal(calls,1);
 });
 console.log(JSON.stringify(results,null,2));
 if(process.argv.includes('--record'))fs.writeFileSync(path.join(__dirname,'../docs/entry-fixes-results.json'),JSON.stringify(results,null,2)+'\n');
})();
