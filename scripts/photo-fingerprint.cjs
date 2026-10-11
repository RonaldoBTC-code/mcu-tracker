const crypto=require('node:crypto'),sharp=require('sharp');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function perceptual(pixels){
 const values=[];
 for(let y=0;y<8;y++)for(let x=0;x<8;x++){
  let value=0;
  for(let j=0;j<32;j++)for(let i=0;i<32;i++)value+=pixels[j*32+i]*Math.cos((2*i+1)*x*Math.PI/64)*Math.cos((2*j+1)*y*Math.PI/64);
  values.push(value);
 }
 const median=[...values.slice(1)].sort((a,b)=>a-b)[31];
 return values.map((value,i)=>i>0&&value>median?'1':'0').join('');
}
async function fingerprint(bytes){
 const decoded=await sharp(bytes).rotate().removeAlpha().toColourspace('srgb').raw().toBuffer({resolveWithObject:true});
 const {width,height}=decoded.info,perceptualHashes=[];
 for(const ratio of [1,0.9,0.8]){
  const w=Math.max(1,Math.round(width*ratio)),h=Math.max(1,Math.round(height*ratio));
  const pixels=await sharp(bytes).rotate().extract({left:Math.floor((width-w)/2),top:Math.floor((height-h)/2),width:w,height:h}).resize(32,32,{fit:'fill'}).greyscale().raw().toBuffer();
  perceptualHashes.push(perceptual(pixels));
 }
 return {sha256:hash(bytes),pixelSha256:hash(Buffer.concat([Buffer.from(width+'x'+height+'\0'),decoded.data])),perceptualHashes};
}
const distance=(a,b)=>[...a].reduce((n,bit,i)=>n+(bit!==b[i]),0);
const similarity=(a,b)=>Math.min(...a.perceptualHashes.flatMap(x=>b.perceptualHashes.map(y=>distance(x,y))));
module.exports={fingerprint,similarity};
