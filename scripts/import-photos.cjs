// Build only: compress reviewed references; never invent attribution.
const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
const root=path.join(__dirname,'..');
(async()=>{
 const sources=JSON.parse(await fs.readFile(path.join(__dirname,'photo-sources.json'),'utf8'));
 const catalogs=JSON.parse(await fs.readFile(path.join(__dirname,'country-memes.json'),'utf8'));
 const inventory=[];
 for(const source of sources){
  if(!/^[a-z0-9-]+$/.test(source.id)||!source.reviewedVisually||source.hasMemeTextOverlay!==false||!source.visualGag||!source.characters.length)throw Error('Unreviewed reference');
  const image='data/memes/international/images/'+source.id+'.webp';
  const input=await fs.readFile(path.join(root,source.image));
  const bytes=await sharp(input).rotate().resize({width:768,height:768,fit:'inside',withoutEnlargement:true}).webp({quality:72}).toBuffer();
  if(bytes.length>=100000)throw Error('Photo exceeds budget: '+source.id);
  const size=await sharp(bytes).metadata();
  await fs.mkdir(path.dirname(path.join(root,image)),{recursive:true});await fs.writeFile(path.join(root,image),bytes);
  inventory.push({...source,image,alt:source.visualGag,width:size.width,height:size.height,bytes:bytes.length,scope:'international',countryEvidence:source.countryEvidence||null,licenseUrl:source.licenseUrl||null,changes:'Redimensionada y convertida a WebP; sin texto añadido'});
 }
 const countries=(await fs.readdir(path.join(root,'data/memes'))).filter(name=>/^[A-Z]{2}\.json$/.test(name)).map(name=>name.slice(0,2));
 for(const country of countries){
  const ids=catalogs[country];if(!Array.isArray(ids)||ids.length<8||new Set(ids).size!==ids.length)throw Error('Insufficient/duplicate catalogue: '+country);
  const memes=ids.map(id=>inventory.find(item=>item.id===id));if(memes.some(item=>!item))throw Error('Unknown photo in '+country);
  await fs.writeFile(path.join(root,'data/memes',country+'.json'),JSON.stringify({country,scope:'international',catalogueRole:'audience',memes},null,2)+'\n');
 }
 await fs.writeFile(path.join(root,'docs/photo-inventory.json'),JSON.stringify(inventory,null,2)+'\n');
 const coverage={countries,photos:inventory.length,scope:'international',countriesOfOriginVerified:new Set(inventory.map(item=>item.country).filter(Boolean)).size,perCountry:Object.fromEntries(countries.map(country=>[country,catalogs[country].length])),uniqueCountryCatalogues:new Set(Object.values(catalogs).map(ids=>[...ids].sort().join(','))).size,bytes:inventory.reduce((sum,item)=>sum+item.bytes,0),largestBytes:Math.max(...inventory.map(item=>item.bytes)),previousCollectionCount:96,previousCollectionWasRejected:true,reselectedPreviousPhotos:1};
 await fs.writeFile(path.join(root,'docs/photo-coverage.json'),JSON.stringify(coverage,null,2)+'\n');console.log(JSON.stringify(coverage));
})().catch(error=>{console.error(error);process.exitCode=1;});
