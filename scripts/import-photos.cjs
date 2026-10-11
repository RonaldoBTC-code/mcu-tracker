// Country is the documented location of the scene, never the reader's audience.
const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
const {fingerprint,similarity}=require('./photo-fingerprint.cjs');
const root=path.join(__dirname,'..'),minimumPerCountry=10;
const isURL=value=>{try{return new URL(value).protocol==='https:';}catch{return false;}};
(async()=>{
 const sources=JSON.parse(await fs.readFile(path.join(__dirname,'photo-sources.json'),'utf8'));
 const distinct=JSON.parse(await fs.readFile(path.join(__dirname,'visual-distinctness.json'),'utf8'));
 const countries=(await fs.readdir(path.join(root,'data/memes'))).filter(name=>/^[A-Z]{2}\.json$/.test(name)).map(name=>name.slice(0,2)).sort();
 const inventory=[],ids=new Set(),nearPairs=[];
 for(const source of sources){
  if(!/^[a-z0-9-]+$/.test(source.id)||ids.has(source.id)||!countries.includes(source.country)||!source.reviewedVisually||source.hasMemeTextOverlay!==false||!source.visualGag||!source.characters?.length)throw Error('Unreviewed, duplicate or unlocated source: '+source.id);
  ids.add(source.id);
  if(!source.location||!source.countryEvidence?.statement||!isURL(source.countryEvidence?.url)||!isURL(source.source))throw Error('Missing scene-location evidence: '+source.id);
  const inputPath=path.resolve(root,source.image);
  if(!inputPath.startsWith(path.join(root,'scripts','reference-images')+path.sep))throw Error('Invalid input path: '+source.id);
  const input=await fs.readFile(inputPath),originalFingerprint=await fingerprint(input);
  const bytes=await sharp(input).rotate().resize({width:768,height:768,fit:'inside',withoutEnlargement:true}).webp({quality:72}).toBuffer();
  if(bytes.length>=100000)throw Error('Photo exceeds budget: '+source.id);
  const outputFingerprint=await fingerprint(bytes),size=await sharp(bytes).metadata();
  for(const prior of inventory){
   if(prior.originalFingerprint.sha256===originalFingerprint.sha256||prior.originalFingerprint.pixelSha256===originalFingerprint.pixelSha256||prior.outputFingerprint.sha256===outputFingerprint.sha256)throw Error('Duplicate photo: '+source.id+' / '+prior.id);
   const distance=similarity(originalFingerprint,prior.originalFingerprint);
   if(distance<=8){
    const pair=[source.id,prior.id].sort(),review=distinct.find(r=>JSON.stringify([...r.ids].sort())===JSON.stringify(pair)&&r.distinctPhotos===true&&r.reason);
    if(!review)throw Error('Visual similarity requires manual review: '+pair.join(' / ')+' distance '+distance);
    nearPairs.push({ids:pair,distance,review:review.reason});
   }
  }
  inventory.push({...source,image:'data/memes/'+source.country+'/images/'+source.id+'.webp',alt:source.visualGag,width:size.width,height:size.height,bytes:bytes.length,scope:'geographic',originalFingerprint,outputFingerprint,licenseUrl:source.licenseUrl||null,changes:'Redimensionada y convertida a WebP; sin recorte ni texto añadido',_bytes:bytes});
 }
 const perCountry=Object.fromEntries(countries.map(country=>[country,inventory.filter(p=>p.country===country).length]));
 const pendingCountries=countries.filter(country=>perCountry[country]<minimumPerCountry);
 if(process.argv.includes('--require-complete')&&pendingCountries.length)throw Error('Country collections incomplete: '+pendingCountries.join(', '));
 for(const item of inventory){await fs.mkdir(path.dirname(path.join(root,item.image)),{recursive:true});await fs.writeFile(path.join(root,item.image),item._bytes);delete item._bytes;}
 for(const country of countries){const memes=inventory.filter(item=>item.country===country);await fs.writeFile(path.join(root,'data/memes',country+'.json'),JSON.stringify({country,scope:'geographic',catalogueRole:'scene-location',status:memes.length>=minimumPerCountry?'complete':memes.length?'partial':'pending',minimumPerCountry,memes},null,2)+'\n');}
 const missingPerCountry=Object.fromEntries(countries.map(c=>[c,Math.max(0,minimumPerCountry-perCountry[c])]));
 const coverage={scope:'geographic',minimumPerCountry,minimumSource:'explicit-user-requirement',countries,photos:inventory.length,perCountry,missingPerCountry,missingPhotos:Object.values(missingPerCountry).reduce((a,b)=>a+b,0),complete:pendingCountries.length===0,completeCountries:countries.filter(c=>perCountry[c]>=minimumPerCountry),pendingCountries,crossCountryDuplicatePhotos:0,visualReviewThreshold:8,nearPairs,bytes:inventory.reduce((sum,p)=>sum+p.bytes,0),largestBytes:Math.max(0,...inventory.map(p=>p.bytes))};
 await fs.writeFile(path.join(root,'docs/photo-inventory.json'),JSON.stringify(inventory,null,2)+'\n');
 await fs.writeFile(path.join(root,'docs/photo-coverage.json'),JSON.stringify(coverage,null,2)+'\n');
 await fs.writeFile(path.join(__dirname,'country-memes.json'),JSON.stringify(Object.fromEntries(countries.map(c=>[c,inventory.filter(p=>p.country===c).map(p=>p.id)])),null,2)+'\n');
 console.log(JSON.stringify(coverage));
})().catch(error=>{console.error(error);process.exitCode=1;});
