/* Only documented scene-location collections; shared totals always come from RPCs. */
window.MemeFeed=(()=>{
  const $=id=>document.getElementById(id),BATCH=2,VIEW_MS=1000;
  let mounted=false,epoch=0,socialEpoch=0,controller,timer,lazy,visibility,more,blockers;
  let code=null,items=[],cursor=0,loading=false,manifestFailed=false,flushTimer=null;
  const cards=new Map(),visible=new Set(),viewTimers=new Map(),pendingViews=new Set(),inflightViews=new Set(),requests=new Set();
  let flushing=false;
  const account=()=>window.CloudSync?.user()?.id||null;
  function status(text){$('feedStatus').textContent=text;}
  function cancelVisibleTimers(){for(const t of viewTimers.values())clearTimeout(t);viewTimers.clear();}
  function cancelTimers(){clearTimeout(flushTimer);flushTimer=null;cancelVisibleTimers();}
  function cancelSocial(){socialEpoch++;cancelTimers();pendingViews.clear();inflightViews.clear();flushing=false;for(const r of requests)r.abort();requests.clear();}
  function cancel(){epoch++;controller?.abort();clearTimeout(timer);lazy?.disconnect();visibility?.disconnect();more?.disconnect();cancelSocial();visible.clear();cards.clear();}
  function paint(s){
    s.like.disabled=!account()||!s.data||s.busy;
    s.like.setAttribute('aria-pressed',String(s.data?.liked===true));
    s.like.textContent=(s.data?.liked?'Quitar Me gusta':'Me gusta')+(s.data?' · '+s.data.likes_count:'');
    s.views.textContent=s.data?s.data.views_count+' vistas de cuentas únicas':'Vistas no disponibles';
    s.message.textContent=s.error||(!account()?'Inicia sesión para dar Me gusta.':'');
  }
  async function rpc(name,params,owner,generation){
    if(generation!==socialEpoch)throw Error('Stale session');
    if(!CFG.SUPABASE_URL||CFG.SUPABASE_URL.includes('TU-PROYECTO'))throw Error('Backend unavailable');
    const headers={'Content-Type':'application/json',apikey:CFG.SUPABASE_ANON_KEY};
    if(owner){
      const client=window.CloudSync?.client();if(!client)throw Error('Session unavailable');
      const {data,error}=await client.auth.getSession();if(error||data?.session?.user?.id!==owner||!data.session.access_token)throw Error('Session changed');
      // Capture the JWT: an in-flight like must never be reassigned to the next account.
      headers.Authorization='Bearer '+data.session.access_token;
    }
    if(generation!==socialEpoch||owner!==account())throw Error('Session changed');
    const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),8000);requests.add(abort);
    try{
      const r=await fetch(CFG.SUPABASE_URL+'/rest/v1/rpc/'+name,{method:'POST',headers,body:JSON.stringify(params),signal:abort.signal});
      if(!r.ok)throw Error('RPC unavailable: '+r.status);const data=await r.json();
      if(generation!==socialEpoch||owner!==account())throw Error('Session changed');
      return data;
    }finally{clearTimeout(timeout);requests.delete(abort);}
  }
  function checked(data,ids){
    if(!Array.isArray(data)||data.length!==ids.length)throw Error('Invalid totals');
    const seen=new Set();for(const row of data){
      if(!ids.includes(row.meme_id)||seen.has(row.meme_id)||!['likes_count','views_count'].every(k=>Number.isSafeInteger(row[k])&&row[k]>=0)||typeof row.liked!=='boolean'||typeof row.seen!=='boolean')throw Error('Invalid totals');
      seen.add(row.meme_id);
    }return data;
  }
  async function refresh(ids=[...cards.keys()]){
    ids=ids.filter(id=>cards.has(id)&&!cards.get(id).busy);if(!ids.length)return;
    const generation=socialEpoch,owner=account(),versions=new Map(ids.map(id=>[id,cards.get(id).version]));
    try{
      const rows=checked(await rpc('get_meme_stats',{p_ids:ids},owner,generation),ids);
      for(const row of rows){const s=cards.get(row.meme_id);if(s&&s.version===versions.get(row.meme_id)&&!s.busy){s.data=row;s.error='';paint(s);scheduleView(s);}}
      if(generation===socialEpoch)$('feedRetry').hidden=true;
    }catch(e){if(generation!==socialEpoch)return;for(const id of ids){const s=cards.get(id);if(s&&s.version===versions.get(id)&&!s.busy){s.error='No se pudieron consultar las interacciones compartidas.';paint(s);}}$('feedRetry').hidden=false;}
  }
  async function toggle(id){
    const s=cards.get(id),owner=account();if(!s||!owner||!s.data||s.busy)return;
    const generation=socialEpoch,desired=!s.data.liked;s.busy=true;s.version++;s.error='';paint(s);
    try{const [row]=checked(await rpc('set_meme_like',{p_id:id,p_liked:desired},owner,generation),[id]);if(generation===socialEpoch&&cards.get(id)===s)s.data=row;}
    catch(e){if(generation===socialEpoch)s.error='No se confirmó el Me gusta. Reintenta la consulta antes de cambiarlo.';}
    finally{if(generation===socialEpoch&&cards.get(id)===s){s.busy=false;paint(s);if(s.error){s.data=null;paint(s);$('feedRetry').hidden=false;}}}
  }
  function foreground(s){
    if(document.visibilityState==='hidden'||document.body.classList.contains('tour-on')||$('mapwrap')?.classList.contains('open'))return false;
    const r=s.img.getBoundingClientRect(),x=(Math.max(0,r.left)+Math.min(innerWidth,r.right))/2,y=(Math.max(0,r.top)+Math.min(innerHeight,r.bottom))/2;
    return document.elementFromPoint(x,y)===s.img;
  }
  function scheduleView(s){
    if(!s||!account()||!s.data||s.data.seen||!visible.has(s.img)||!s.img.complete||s.img.naturalWidth<1||viewTimers.has(s.id)||pendingViews.has(s.id)||inflightViews.has(s.id)||!foreground(s))return;
    const generation=socialEpoch;viewTimers.set(s.id,setTimeout(()=>{
      viewTimers.delete(s.id);if(generation!==socialEpoch||!visible.has(s.img)||!foreground(s))return;
      pendingViews.add(s.id);if(!flushTimer)flushTimer=setTimeout(flushViews,400);
    },VIEW_MS));
  }
  async function flushViews(){
    clearTimeout(flushTimer);flushTimer=null;const owner=account(),generation=socialEpoch,ids=[...pendingViews].slice(0,10);if(flushing||!owner||!ids.length)return;
    flushing=true;ids.forEach(id=>{pendingViews.delete(id);inflightViews.add(id)});const versions=new Map(ids.map(id=>[id,cards.get(id)?.version]));
    try{
      const rows=checked(await rpc('record_meme_views',{p_ids:ids},owner,generation),ids);
      for(const row of rows){const s=cards.get(row.meme_id);if(s&&!s.busy&&s.version===versions.get(row.meme_id)){s.data=row;paint(s);}}
      if(generation===socialEpoch&&pendingViews.size)flushTimer=setTimeout(flushViews,400);
    }catch(e){if(generation!==socialEpoch)return;ids.forEach(id=>{if(cards.has(id))pendingViews.add(id)});$('feedRetry').hidden=false;for(const id of ids){const s=cards.get(id);if(s){s.error='No se confirmó la vista. Puedes reintentar.';paint(s);}}}
    finally{if(generation===socialEpoch){flushing=false;ids.forEach(id=>inflightViews.delete(id));}}
  }
  function append(){
    if(loading||cursor>=items.length)return;const ids=[];
    for(const item of items.slice(cursor,cursor+BATCH)){
      const card=document.createElement('article');card.className='feed-card';card.dataset.memeId=item.id;
      const figure=document.createElement('figure'),img=document.createElement('img');img.width=item.width||768;img.height=item.height||512;img.alt=item.alt||item.title;img.loading='lazy';img.decoding='async';img.dataset.src=window.MapMemes.imageURL(code,item.image);
      const caption=window.MapMemes.creditCaption(item,$('feedCountry').selectedOptions[0].textContent);figure.append(img,caption);card.append(figure);
      const actions=document.createElement('div');actions.className='feed-actions';const like=document.createElement('button');like.type='button';like.className='feed-like';like.setAttribute('aria-label','Me gusta: '+item.title);
      const views=document.createElement('span'),message=document.createElement('p');message.className='feed-message';message.setAttribute('role','status');actions.append(like,views);card.append(actions,message);$('feedList').append(card);
      const s={id:item.id,img,like,views,message,data:null,error:'',busy:false,version:0};cards.set(item.id,s);ids.push(item.id);like.onclick=()=>toggle(item.id);paint(s);
      img.onload=()=>scheduleView(s);img.onerror=()=>{s.error='No se pudo cargar la foto.';paint(s);if(!card.querySelector('.feed-image-retry')){const retry=document.createElement('button');retry.type='button';retry.className='feed-image-retry';retry.textContent='Reintentar imagen';retry.onclick=()=>{s.error='';paint(s);img.src=window.MapMemes.imageURL(code,item.image);retry.remove();};card.append(retry);}};
      if(lazy)lazy.observe(img);else{img.src=img.dataset.src;delete img.dataset.src;}visibility?.observe(img);
    }
    cursor=Math.min(items.length,cursor+BATCH);$('feedMore').hidden=cursor>=items.length;
    status(items.length+' foto'+(items.length===1?'':'s')+' para descubrir. Sigue bajando.');$('feedEnd').hidden=cursor<items.length;
    $('feedEnd').textContent='Fin de esta colección.'+(items.length<3?' Seguimos ampliándola.':'');
    refresh(ids);
  }
  async function open(next=window.MapMemes.resolveCountry(),force=false){
    next=window.MapMemes.valid(next)?next:null;if(!force&&next===code&&(loading||items.length))return;
    cancel();const generation=epoch;code=next;items=[];cursor=0;loading=!!code;manifestFailed=false;$('feedList').replaceChildren();$('feedCountry').value=code||'';$('feedMore').hidden=true;$('feedEnd').hidden=true;$('feedRetry').hidden=true;
    if(!code){status('Selecciona un país para descubrir sus fotos.');return;}
    status('Cargando la colección…');controller=new AbortController();timer=setTimeout(()=>controller?.abort(),10000);
    try{
      const r=await fetch(new URL('data/memes/'+code+'.json',document.baseURI),{signal:controller.signal});if(!r.ok)throw Error('Catalogue unavailable');
      const data=await r.json();if(generation!==epoch)return;
      const unique=new Set();items=window.MapMemes.parseCatalogue(code,data).map(x=>x.item).filter(item=>/^[a-z0-9-]+$/.test(item.id||'')&&!unique.has(item.id)&&unique.add(item.id));loading=false;
      if(!items.length){status('Todavía no hay fotos verificadas para este país.');return;}
      if(typeof IntersectionObserver==='function'){
        lazy=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting&&generation===epoch){const img=e.target;if(img.dataset.src){img.src=img.dataset.src;delete img.dataset.src;}lazy.unobserve(img)}},{rootMargin:'300px'});
        visibility=new IntersectionObserver(entries=>{if(generation!==epoch)return;for(const e of entries){if(e.isIntersecting&&e.intersectionRatio>=.5){visible.add(e.target);scheduleView(cards.get(e.target.closest('article').dataset.memeId));}else{visible.delete(e.target);const id=e.target.closest('article').dataset.memeId;clearTimeout(viewTimers.get(id));viewTimers.delete(id);}}},{threshold:[0,.5]});
        more=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&generation===epoch)append()},{rootMargin:'150px'});more.observe($('feedSentinel'));
      }
      append();
    }catch(e){if(generation!==epoch)return;manifestFailed=true;loading=false;status('No se pudo cargar esta colección.');$('feedRetry').hidden=false;}
    finally{if(generation===epoch){clearTimeout(timer);controller=null;}}
  }
  function sessionChanged(){
    if(!mounted)return;cancelSocial();for(const s of cards.values()){s.version++;s.data=null;s.busy=false;s.error='';paint(s);}refresh();
  }
  function init(){
    if(mounted||!$('memeFeed'))return;mounted=true;const select=$('feedCountry');select.add(new Option('Selecciona un país',''));for(const [id,name]of window.Region.countries())select.add(new Option(name,id));
    select.onchange=()=>{if(select.value)window.SafeStorage.setItem('mcu_map_country',select.value);else window.SafeStorage.removeItem('mcu_map_country');open(select.value);};$('feedMore').onclick=append;$('feedRetry').onclick=()=>manifestFailed?open(code,true):Promise.all([refresh(),flushViews()]);
    const observeBlockers=()=>{blockers.observe(document.body,{attributes:true,attributeFilter:['class']});if($('mapwrap'))blockers.observe($('mapwrap'),{attributes:true,attributeFilter:['class']});};
    blockers=new MutationObserver(()=>{cancelVisibleTimers();for(const s of cards.values())scheduleView(s)});observeBlockers();
    document.addEventListener('visibilitychange',()=>{cancelTimers();if(document.visibilityState==='visible'){for(const s of cards.values())scheduleView(s);flushViews();}});
    window.addEventListener('online',()=>{if(manifestFailed)open(code,true);else{refresh();flushViews();}});
    window.addEventListener('pagehide',()=>{blockers.disconnect();cancel()});window.addEventListener('pageshow',e=>{if(e.persisted){observeBlockers();open(code,true)}});open();
  }
  document.addEventListener('DOMContentLoaded',init);
  return {init,open,sessionChanged,toggle};
})();
