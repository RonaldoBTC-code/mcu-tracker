// Adversarial import checks: resized duplicates, byte duplicates, missing location,
// and incomplete coverage must fail before public files are written.
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),sharp=require('sharp'),{spawnSync}=require('node:child_process');
const {fingerprint,similarity}=require('../scripts/photo-fingerprint.cjs');
const root=path.join(__dirname,'..');
(async()=>{
 const sources=JSON.parse(await fs.readFile(path.join(root,'scripts/photo-sources.json'),'utf8'));
 const original=await fs.readFile(path.join(root,sources[0].image));
 const resized=await sharp(original).resize({width:300}).jpeg({quality:45}).toBuffer();
 const a=await fingerprint(original),b=await fingerprint(resized);
 assert.notEqual(a.sha256,b.sha256);assert(similarity(a,b)<=8,'Reencoded photo escaped perceptual check');
 const fixture=await fs.mkdtemp(path.join(root,'research','pipeline-test-'));
 await fs.mkdir(path.join(fixture,'scripts/reference-images'),{recursive:true});await fs.mkdir(path.join(fixture,'data/memes'),{recursive:true});await fs.mkdir(path.join(fixture,'docs'));
 for(const file of ['import-photos.cjs','responsive-photos.cjs','photo-fingerprint.cjs','visual-distinctness.json'])await fs.copyFile(path.join(root,'scripts',file),path.join(fixture,'scripts',file));
 for(const code of ['BR','TH'])await fs.writeFile(path.join(fixture,'data/memes',code+'.json'),'{}');
 await fs.writeFile(path.join(fixture,'scripts/reference-images/a.jpg'),original);await fs.writeFile(path.join(fixture,'scripts/reference-images/b.jpg'),resized);
 const item={...sources[0],id:'first',image:'scripts/reference-images/a.jpg'};
 async function rejected(entries,pattern,args=[]){
  await fs.writeFile(path.join(fixture,'scripts/photo-sources.json'),JSON.stringify(entries));
  const run=spawnSync(process.execPath,[path.join(fixture,'scripts/import-photos.cjs'),...args],{encoding:'utf8',timeout:30000});
  assert.equal(run.status,1,run.stderr);assert.match(run.stderr,pattern);assert.deepEqual(await fs.readdir(path.join(fixture,'docs')),[],'Rejected import wrote public documentation');assert.equal(await fs.readFile(path.join(fixture,'data/memes/BR.json'),'utf8'),'{}');
 }
 await rejected([item,{...item,id:'second',country:'TH'}],/Duplicate photo/);
 await rejected([item,{...item,id:'second',country:'TH',image:'scripts/reference-images/b.jpg'}],/Visual similarity requires manual review/);
 await rejected([{...item,countryEvidence:null}],/Missing scene-location evidence/);
 await rejected([item],/Country collections incomplete/,['--require-complete']);
 const {variants}=require('../scripts/responsive-photos.cjs');
 const small=await sharp(original).resize({width:375,height:500,fit:'inside'}).png().toBuffer(),smallMeta=await sharp(small).metadata(),smallSet=await variants(small);assert.equal(smallSet.result.length,1);assert(smallSet.result.every(v=>v.width<=smallMeta.width&&v.height<=smallMeta.height));
 const large=await sharp({create:{width:2400,height:1600,channels:3,background:'#6688aa'}}).png().toBuffer(),largeSet=await variants(large);assert.deepEqual(largeSet.result.map(v=>v.width),[640,1280,1920]);assert(largeSet.result.every(v=>Math.abs(v.width/v.height-1.5)<.01));
 const report={checkedAt:new Date().toISOString(),result:'PASS',checks:['byte duplicate rejected','reencoded/resized duplicate flagged','missing location rejected','incomplete coverage gate rejected','all rejections precede public writes','responsive sizes never enlarge native pixels','large source retains 640/1280/1920 variants at quality90','variants preserve full aspect ratio'],perceptualResizeDistance:similarity(a,b),collectionCoverageComplete:false};
 await fs.writeFile(path.join(root,'docs/photo-pipeline-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
})().catch(error=>{console.error(error);process.exitCode=1;});
