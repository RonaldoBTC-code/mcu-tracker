// Build-time download only; the browser never requests Commons or a global catalogue.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.join(__dirname,'..'),sources=require('./photo-sources.json');
const plain=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').trim();
(async()=>{
 const countries=fs.readdirSync(path.join(root,'data/memes')).filter(f=>/^[A-Z]{2}\.json$/.test(f)).map(f=>f.slice(0,2));
 const data=Object.fromEntries(countries.map(country=>[country,{country,memes:[]}]));
 const inventory=[];
 for(const source of sources){
  if(!data[source.country])throw Error('Unknown country');
  const api=new URL('https://commons.wikimedia.org/w/api.php');
  for(const [key,value]of Object.entries({action:'query',format:'json',titles:'File:'+source.file,prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'768'}))api.searchParams.set(key,value);
  const response=await fetch(api);if(!response.ok)throw Error('Metadata HTTP '+response.status);
  const result=await response.json(),info=Object.values(result.query.pages)[0]?.imageinfo?.[0];
  if(!info)throw Error('Missing source '+source.file);
  const meta=info.extmetadata,license=meta.LicenseShortName?.value;
  if(!/^(?:CC BY(?:-SA)? (?:2\.0|3\.0|4\.0)|CC0)$/.test(license||''))throw Error('Review license '+source.file);
  const image=await fetch(info.thumburl||info.url);if(!image.ok)throw Error('Image HTTP '+image.status);
  const bytes=Buffer.from(await image.arrayBuffer());if(bytes.length>10000000)throw Error('Image too large');
  const n=data[source.country].memes.length+1,name='photo-'+n+'.webp',dir=path.join(root,'data/memes',source.country,'images');fs.mkdirSync(dir,{recursive:true});
  const output=await sharp(bytes).rotate().resize({width:768,height:768,fit:'inside',withoutEnlargement:true}).webp({quality:76,effort:6}).toFile(path.join(dir,name));
  const item={title:source.title,alt:source.title,image:'data/memes/'+source.country+'/images/'+name,width:output.width,height:output.height,creator:plain(meta.Artist?.value),source:info.descriptionurl,license,licenseUrl:meta.LicenseUrl?.value,changes:'Redimensionada y convertida a WebP; sin texto añadido',countryEvidence:source.countryEvidence};
  data[source.country].memes.push(item);inventory.push({...item,country:source.country,bytes:output.size});
 }
 for(const [code,value]of Object.entries(data))fs.writeFileSync(path.join(root,'data/memes',code+'.json'),JSON.stringify(value,null,2)+'\n');
 fs.writeFileSync(path.join(root,'docs/photo-inventory.json'),JSON.stringify(inventory,null,2)+'\n');
 console.log(JSON.stringify({countriesWithPhotos:Object.values(data).filter(d=>d.memes.length).length,photos:inventory.length,bytes:inventory.reduce((n,p)=>n+p.bytes,0)}));
})().catch(e=>{console.error(e);process.exitCode=1;});
