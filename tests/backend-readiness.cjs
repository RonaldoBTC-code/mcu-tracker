const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {validateStats,inspectCatalogue}=require('../scripts/check-meme-backend.cjs');
const row=id=>({meme_id:id,likes_count:0,views_count:0,liked:false,seen:false});
(async()=>{
 const checks=[];
 assert.deepEqual(validateStats([row('a')],['a']),[row('a')]);
 for(const rows of [[],[row('b')],[row('a'),row('a')],[{...row('a'),likes_count:-1}],
  [{...row('a'),views_count:'0'}],[{...row('a'),liked:true}],[{...row('a'),seen:null}]]){
  assert.throws(()=>validateStats(rows,['a']));
 }
 checks.push('missing, duplicate, wrong IDs, negative/string counts and authenticated flags fail closed');
 const requests=[],activeIds=Array.from({length:61},(_,i)=>'active-'+i);
 const fetchImpl=async(url,options)=>{
  assert.equal(url,'https://apxgkmllektcmrstuirw.supabase.co/rest/v1/rpc/get_meme_stats');
  assert.equal(options.method,'POST');assert.equal(options.redirect,'error');
  const body=JSON.parse(options.body);assert.deepEqual(Object.keys(body),['p_ids']);
  requests.push(body.p_ids);assert(body.p_ids.length<=50);
  if(body.p_ids[0]==='pending-unknown')return {status:400,ok:false,json:async()=>({code:'22023',message:'Unknown meme'})};
  return {status:200,ok:true,json:async()=>body.p_ids.map(row)};
 };
 const report=await inspectCatalogue({fetchImpl,key:'test-public-key',activeIds,pendingIds:['pending-ready','pending-unknown']});
 assert.deepEqual(requests.map(ids=>ids.length),[50,11,1,1]);
 assert.equal(report.activeCatalogueReady,true);assert.equal(report.pendingCatalogueReady,false);
 assert.equal(report.productionWritesPerformed,false);assert.equal(report.productionPersistenceVerified,false);
 assert.equal(report.results.at(-1).status,'unknown-id');
 checks.push('61 active IDs stay valid when one isolated pending identity is unknown');
 const invalid=await inspectCatalogue({fetchImpl:async()=>({ok:true,status:200,json:async()=>[row('wrong-id')]}),key:'test',activeIds:['a'],pendingIds:['b']});
 assert.equal(invalid.activeCatalogueReady,false);assert.equal(invalid.pendingCatalogueReady,false);
 checks.push('HTTP 200 with invalid identity cannot authorize activation');
 const denied=await inspectCatalogue({fetchImpl:async()=>({ok:false,status:403}),key:'test',activeIds:['a'],pendingIds:['b']});
 assert.equal(denied.results[0].status,'request-failed');
 const failed=await inspectCatalogue({fetchImpl:async()=>{throw Error('transport secret');},key:'test',activeIds:['a'],pendingIds:['b']});
 assert(!JSON.stringify(failed).includes('secret'));assert.equal(failed.activeCatalogueReady,false);
 checks.push('permission and transport failures remain blocked without leaking error details');
 const result={checkedAt:new Date().toISOString(),result:'PASS',transport:'simulated; no production requests',checks};
 fs.writeFileSync(path.join(__dirname,'../docs/backend-readiness-tests.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1;});
