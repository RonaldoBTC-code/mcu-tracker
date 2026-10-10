// Build-time download only; the browser never requests Commons or a global catalogue.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.join(__dirname,'..'),sources=require('./photo-sources.json');
const plain=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').trim();
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function request(url){
 for(let attempt=0;attempt<4;attempt++){
  const response=await fetch(url,{headers:{'User-Agent':'MCUTrackerPhotoImporter/1.0 (https://github.com/RonaldoBTC-code/mcu-tracker)'}});
  if(response.ok)return response;
  if(![429,503].includes(response.status)||attempt===3)throw Error('Source HTTP '+response.status);
  const retry=Number(response.headers.get('retry-after'));
  await response.body?.cancel();
  await pause(Math.min(120,Math.max(2,Number.isFinite(retry)?retry:2**(attempt+2)))*1000);
 }
}
(async()=>{
 const countries=fs.readdirSync(path.join(root,'data/memes')).filter(f=>/^[A-Z]{2}\.json$/.test(f)).map(f=>f.slice(0,2));
 const data=Object.fromEntries(countries.map(country=>[country,{country,memes:[]}]));
 const inventory=[];
 const previous=JSON.parse(fs.readFileSync(path.join(root,'docs/photo-inventory.json'),'utf8'));
 for(const source of sources){
  if(!data[source.country])throw Error('Unknown country');
  const cached=previous.find(item=>item.country===source.country&&decodeURIComponent(new URL(item.source).pathname.split('/wiki/File:')[1]||'').replace(/_/g,' ')===source.file.replace(/_/g,' ')&&item.title===source.title&&item.countryEvidence===source.countryEvidence);
  if(cached&&cached.bytes<100000&&fs.existsSync(path.join(root,cached.image))){
   const {country,bytes,...item}=cached;
   data[country].memes.push(item);inventory.push(cached);continue;
  }
  const api=new URL('https://commons.wikimedia.org/w/api.php');
  for(const [key,value]of Object.entries({action:'query',format:'json',titles:'File:'+source.file,prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'768'}))api.searchParams.set(key,value);
  const response=await request(api);
  const result=await response.json(),info=Object.values(result.query.pages)[0]?.imageinfo?.[0];
  if(!info)throw Error('Missing source '+source.file);
  const meta=info.extmetadata,license=meta.LicenseShortName?.value;
  if(!/^(?:CC BY(?:-SA)? (?:2\.0|3\.0|4\.0)|CC0)$/.test(license||''))throw Error('Review license '+source.file);
  const image=await request(info.thumburl||info.url);
  const bytes=Buffer.from(await image.arrayBuffer());if(bytes.length>10000000)throw Error('Image too large');
  const n=data[source.country].memes.length+1,name='photo-'+n+'.webp',dir=path.join(root,'data/memes',source.country,'images');fs.mkdirSync(dir,{recursive:true});
  let output;
  for(const quality of [76,68,60,50]){
   output=await sharp(bytes).rotate().resize({width:768,height:768,fit:'inside',withoutEnlargement:true}).webp({quality,effort:6}).toFile(path.join(dir,name));
   if(output.size<100000)break;
  }
  if(output.size>=100000)throw Error('Compressed image too large '+source.file);
  const item={title:source.title,alt:source.title,image:'data/memes/'+source.country+'/images/'+name,width:output.width,height:output.height,creator:plain(meta.Artist?.value),source:info.descriptionurl,license,licenseUrl:meta.LicenseUrl?.value,changes:'Redimensionada y convertida a WebP; sin texto añadido',countryEvidence:source.countryEvidence};
  data[source.country].memes.push(item);inventory.push({...item,country:source.country,bytes:output.size});
 }
 for(const [code,value]of Object.entries(data))fs.writeFileSync(path.join(root,'data/memes',code+'.json'),JSON.stringify(value,null,2)+'\n');
 fs.writeFileSync(path.join(root,'docs/photo-inventory.json'),JSON.stringify(inventory,null,2)+'\n');
 console.log(JSON.stringify({countriesWithPhotos:Object.values(data).filter(d=>d.memes.length).length,photos:inventory.length,bytes:inventory.reduce((n,p)=>n+p.bytes,0)}));
})().catch(e=>{console.error(e);process.exitCode=1;});
