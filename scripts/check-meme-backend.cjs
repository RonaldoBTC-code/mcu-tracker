// Read-only readiness gate. Never sends OTP, analytics, likes or views.
const fs=require('node:fs/promises'),path=require('node:path');
const root=path.join(__dirname,'..');
const project='https://apxgkmllektcmrstuirw.supabase.co';
const pendingFiles=['docs/ecuador-pending-photo.json','docs/mx-quality-replacement-pending.json'];

function validateStats(rows,ids){
 if(!Array.isArray(rows)||rows.length!==ids.length)throw Error('Unexpected aggregate row count');
 const expected=new Set(ids),seen=new Set();
 for(const row of rows){
  if(!row||!expected.has(row.meme_id)||seen.has(row.meme_id))throw Error('Unexpected or duplicate aggregate ID');
  for(const field of ['likes_count','views_count'])if(!Number.isSafeInteger(row[field])||row[field]<0)throw Error('Invalid aggregate count');
  if(row.liked!==false||row.seen!==false)throw Error('Unexpected authenticated state in anonymous aggregate');
  seen.add(row.meme_id);
 }
 return rows;
}

async function inspectCatalogue({fetchImpl=fetch,key,activeIds,pendingIds}){
 const results=[],read=async(ids)=>{
  try{
   const response=await fetchImpl(project+'/rest/v1/rpc/get_meme_stats',{
    method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),
    headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},
    body:JSON.stringify({p_ids:ids})
   });
   if(response.status===400){
    const error=await response.json();
    if(error.code==='22023'&&error.message==='Unknown meme')return {ids,status:'unknown-id',httpStatus:400};
   }
   if(!response.ok)return {ids,status:'request-failed',httpStatus:response.status};
   const rows=validateStats(await response.json(),ids);
   return {ids,status:'ready',httpStatus:response.status,rows};
  }catch{return {ids,status:'request-or-validation-failed'};}
 };
 // Pending IDs are isolated: one unknown ID must not hide a valid active batch.
 for(let start=0;start<activeIds.length;start+=50)results.push(await read(activeIds.slice(start,start+50)));
 const active=results.slice();
 for(const id of pendingIds)results.push(await read([id]));
 return {checkedAt:new Date().toISOString(),rpc:'get_meme_stats',parameter:'p_ids',readOnly:true,
  productionWritesPerformed:false,productionPersistenceVerified:false,
  activeCatalogueReady:active.every(r=>r.status==='ready'),
  pendingCatalogueReady:results.slice(active.length).every(r=>r.status==='ready'),results};
}

async function main(){
 const html=await fs.readFile(path.join(root,'index.html'),'utf8');
 const url=html.match(/SUPABASE_URL:\s*'([^']+)'/)?.[1];
 const key=html.match(/SUPABASE_ANON_KEY:\s*'([^']+)'/)?.[1];
 if(url!==project||!key)throw Error('Public configuration does not match the audited project');
 const active=JSON.parse(await fs.readFile(path.join(root,'scripts/photo-sources.json'),'utf8'));
 const prepared=await Promise.all(pendingFiles.map(file=>fs.readFile(path.join(root,file),'utf8').then(JSON.parse)));
 const pending=prepared.filter(p=>!active.some(a=>a.id===p.id));
 const ids=active.concat(pending).map(p=>p.id);
 if(new Set(ids).size!==ids.length||ids.some(id=>typeof id!=='string'||!/^[a-z0-9-]+$/.test(id)))throw Error('Invalid catalogue identities');
 const report=await inspectCatalogue({key,activeIds:active.map(p=>p.id),pendingIds:pending.map(p=>p.id)});
 report.result=report.activeCatalogueReady?(report.pendingCatalogueReady?'PASS':'BLOCKED'):'FAIL';
 await fs.writeFile(path.join(root,'docs/candidate-backend-readiness.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({result:report.result,activeIds:active.length,pendingIds:pending.length,
  activeCatalogueReady:report.activeCatalogueReady,pendingCatalogueReady:report.pendingCatalogueReady,
  productionWritesPerformed:false}));
 process.exitCode=report.result==='PASS'?0:report.result==='BLOCKED'?2:1;
}

module.exports={validateStats,inspectCatalogue};
if(require.main===module)main().catch(()=>{console.error('Readiness check failed; no changes made.');process.exitCode=1;});
