const sharp=require('sharp');
// The budget grows with resolution; never degrade quality to meet a tiny byte cap.
const STEPS=[{edge:640,budget:250000},{edge:1280,budget:650000},{edge:1920,budget:1300000}];
async function variants(input,detailMaxEdge=Infinity){
 const result=[];
 for(const {edge,budget} of STEPS){
  const target=Math.min(edge,detailMaxEdge);
  const bytes=await sharp(input).rotate().resize({width:target,height:target,fit:'inside',withoutEnlargement:true}).webp({quality:90,effort:6}).toBuffer();
  const {width,height}=await sharp(bytes).metadata();
  if(result.some(v=>v.width===width&&v.height===height))continue;
  if(bytes.length>budget)throw Error('Photo exceeds quality-preserving budget at '+edge+'px');
  result.push({edge,width,height,bytes});
 }
 const source=await sharp(input).metadata(),swap=source.orientation>=5;
 const width=swap?source.height:source.width,height=swap?source.width:source.height,scale=Math.min(1,detailMaxEdge/Math.max(width,height));
 return {sourceWidth:Math.round(width*scale),sourceHeight:Math.round(height*scale),result};
}
module.exports={variants,STEPS};
