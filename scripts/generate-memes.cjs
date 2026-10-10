// Development-only generator. Requires sharp 0.35.5; no browser dependency.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.join(__dirname,'..'),copy=require('./meme-copy.json');
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function lines(text){const out=[];let line='';for(const word of text.split(' ')){if((line+' '+word).trim().length>33){out.push(line);line=word;}else line=(line+' '+word).trim();}if(line)out.push(line);return out;}
function panel(text,y,color){return '<rect x="24" y="'+y+'" width="720" height="182" rx="20" fill="'+color+'"/>'+lines(text).map((line,i)=>'<text x="140" y="'+(y+60+i*36)+'" fill="#fff" font-family="Arial,sans-serif" font-weight="700" font-size="28">'+escape(line)+'</text>').join('')+'<circle cx="80" cy="'+(y+87)+'" r="35" fill="#f6c453"/><path d="M56 '+(y+78)+'h48M63 '+(y+97)+'h34" stroke="#13223a" stroke-width="7" stroke-linecap="round"/>';}
(async()=>{
 const codes=fs.readdirSync(path.join(root,'data/memes')).filter(f=>/^[A-Z]{2}\.json$/.test(f)).map(f=>f.slice(0,2));
 if(codes.some(c=>!copy[c]||copy[c].length!==2)||Object.keys(copy).some(c=>!codes.includes(c)))throw Error('Country coverage mismatch');
 let total=0,max=0;
 for(const code of codes){const dir=path.join(root,'data/memes',code,'images');fs.mkdirSync(dir,{recursive:true});const memes=[];
  for(let i=0;i<copy[code].length;i++){
   const [setup,punch]=copy[code][i].split('|');if(!setup||!punch)throw Error('Invalid copy');
   const svg='<svg xmlns="http://www.w3.org/2000/svg" width="768" height="512" viewBox="0 0 768 512"><rect width="768" height="512" fill="#0b1424"/><text x="28" y="42" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#f6c453">MARVEL · HUMOR LOCAL · '+code+'</text>'+panel(setup,65,'#243a62')+panel(punch,265,'#653055')+'<text x="28" y="485" font-family="Arial,sans-serif" font-size="16" fill="#bac7db">MCU TRACKER · MEME ORIGINAL DE FANS · NO OFICIAL</text></svg>';
   const name='meme-'+(i+1)+'.webp',file=path.join(dir,name);await sharp(Buffer.from(svg)).webp({quality:78,effort:6}).toFile(file);
   const bytes=fs.statSync(file).size;total+=bytes;max=Math.max(max,bytes);
   memes.push({title:setup+' '+punch,alt:setup+' '+punch,image:'data/memes/'+code+'/images/'+name,width:768,height:512,creator:'MCU Tracker · humor original de fans'});
  }
  fs.writeFileSync(path.join(root,'data/memes',code+'.json'),JSON.stringify({country:code,memes},null,2)+'\n');
 }
 console.log(JSON.stringify({countries:codes.length,memes:codes.length*2,totalImageBytes:total,maxImageBytes:max}));
})().catch(e=>{console.error(e);process.exitCode=1;});
