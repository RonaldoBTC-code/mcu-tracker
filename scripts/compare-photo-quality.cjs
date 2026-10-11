// Reproducible compression comparison at the actual desktop DPR2 rendering size.
// PSNR quantifies reproduction loss (resolution and encoding), not source focus or exposure.
const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
const root=path.join(__dirname,'..');
const samples=new Set(['ec-spider-bus','ph-spider-commute','ca-iron-pikachu','us-iron-board','gb-deadpool-sombrero','gb-thor-bike']);
async function rgb(file,width,height){return sharp(file).rotate().resize(width,height,{fit:'fill'}).removeAlpha().toColourspace('srgb').raw().toBuffer();}
function psnr(a,b){let sum=0;for(let i=0;i<a.length;i++)sum+=(a[i]-b[i])**2;return sum===0?null:Number((10*Math.log10(255**2/(sum/a.length))).toFixed(2));}
(async()=>{
 const sources=JSON.parse(await fs.readFile(path.join(root,'scripts/photo-sources.json')));
 const inventory=JSON.parse(await fs.readFile(path.join(root,'docs/photo-inventory.json')));
 const browser=JSON.parse(await fs.readFile(path.join(root,'docs/browser-quality-results.json')));
 const measured=browser.reports.find(r=>r.viewport.width===1280&&r.dpr===2);
 const rows=[];await fs.mkdir(path.join(root,'docs/quality-comparisons'),{recursive:true});
 for(const item of inventory){
  const draw=measured.rows.find(r=>r.id===item.id),source=sources.find(s=>s.id===item.id);
  if(!draw)throw Error('No measured rendering for '+item.id);
  const width=Math.round(draw.drawnWidth*2),height=Math.round(draw.drawnHeight*2);
  const original=await rgb(path.join(root,source.image),width,height);
  const previousFile=path.join(root,'research/quality-before',item.id+'.webp');
  const previousAvailable=await fs.access(previousFile).then(()=>true).catch(error=>{if(error.code==='ENOENT')return false;throw error;});
  const before=previousAvailable?await rgb(previousFile,width,height):null;
  const after=await rgb(path.join(root,draw.selectedFile),width,height);
  rows.push({id:item.id,country:item.country,comparedWidth:width,comparedHeight:height,drawnWidth:draw.drawnWidth,drawnHeight:draw.drawnHeight,dpr:2,previousAvailable,previousPSNR:before?psnr(original,before):null,currentPSNR:psnr(original,after),sourceOriginalRecovered:source.sourceRetrieval?.original===true,sourceURL:source.source,imageURL:source.imageURL,review:source.qualityReview});
  if(samples.has(item.id)&&before)await sharp({create:{width:width*3,height,channels:3,background:'white'}}).composite([original,before,after].map((input,i)=>({input,raw:{width,height,channels:3},left:width*i,top:0}))).webp({lossless:true}).toFile(path.join(root,'docs/quality-comparisons',item.id+'-desktop-2x.webp'));
 }
 const report={checkedAt:new Date().toISOString(),method:'Source | previous published WebP if one exists | current browser-selected WebP, full aspect ratio at measured desktop DPR2; new photos have no prior version and no invented improvement; PSNR measures reproduction error from resolution/encoding, not source focus, exposure or composition',initialPhotosReviewed:65,activePhotos:inventory.length,newPhotosWithoutPriorVersion:rows.filter(r=>!r.previousAvailable).length,rows};
 await fs.writeFile(path.join(root,'docs/photo-quality-comparison.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({photos:rows.length,nativeSampleComparisons:samples.size,newPhotosWithoutPriorVersion:report.newPhotosWithoutPriorVersion,compressionImproved:rows.filter(r=>r.previousAvailable&&r.currentPSNR>r.previousPSNR).length}));
})().catch(error=>{console.error(error);process.exitCode=1;});
