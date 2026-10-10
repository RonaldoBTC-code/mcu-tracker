// Read-only deployment audit. No browser scripts, analytics, OTP or database writes.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const base=new URL('https://ronaldobtc-code.github.io/mcu-tracker/');
const hash=bytes=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+bytes.length+'\0'),bytes])).digest('hex');
async function check(file){
 const url=new URL(file,base);url.searchParams.set('audit',Date.now().toString());
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(20000),cache:'no-store'});
 if(!response.ok)throw Error(file+': HTTP '+response.status);
 const actual=Buffer.from(await response.arrayBuffer()),expected=await fs.readFile(path.join(root,file));
 if(hash(actual)!==hash(expected))throw Error(file+': published bytes differ from the verified workspace');
 return {file,bytes:actual.length,sha:hash(actual)};
}
(async()=>{
 const report={url:base.href,checkedAt:new Date().toISOString(),result:'FAIL',files:[]};
 try{
  // Stop before requesting photos if the published HTML is still an earlier version.
  report.files.push(await check('index.html'));
  const inventory=JSON.parse(await fs.readFile(path.join(root,'docs/photo-inventory.json'),'utf8'));
  const countries=[...new Set(inventory.map(item=>item.country))];
  if(countries.length!==51||inventory.length!==96)throw Error('Unexpected audited coverage');
  for(const code of countries)report.files.push(await check('data/memes/'+code+'.json'));
  for(const item of inventory)report.files.push(await check(item.image));
  report.result='PASS';
 }catch(error){report.error=error.message;process.exitCode=1;}
 await fs.writeFile(path.join(root,'docs/pages-verification-results.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({result:report.result,filesVerified:report.files.length,error:report.error}));
})();
