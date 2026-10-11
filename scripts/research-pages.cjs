// Public-source research only. Saved HTML is local evidence, not a publishable asset.
const fs=require('node:fs/promises'),path=require('node:path'),{JSDOM}=require('jsdom');
const pages={
 br:'https://gshow.globo.com/cultura-pop/viralizou/noticia/homem-aranha-sem-volta-para-casa-fas-se-fantasiam-como-o-super-heroi-para-assistir-a-estreia-do-filme.ghtml',
 ar_gaucho:'https://www.infobae.com/virales/2025/02/14/el-spidergaucho-baila-folklore-y-enamoro-a-las-redes-sociales-una-gran-chacarera-conlleva-una-gran-responsabilidad/',
 ar_vote:'https://tn.com.ar/tecno/redes-sociales/2023/08/13/un-joven-fue-a-votar-disfrazado-de-spiderman-y-una-mujer-se-indigno-anulale-el-voto/',
 mx_class:'https://elcomercio.pe/redes-sociales/facebook/facebook-viral-joven-disfrazado-spiderman-interrumpe-clase-salvar-mundo-mexico-face-fb-fotos-video-nnda-noticia-540463-noticia/',
 br_school:'https://blogclaraboia.blogspot.com/2020/03/meme-homem-aranha-fantasia-carnaval.html',
 ec_cte:'https://www.ecuavisa.com/redes/spiderman-y-el-capitan-america-son-tendencia-por-foto-con-la-cte-20180601-0012.html',
 uy_street:'https://www.elobservador.com.uy/nacional/video-el-impresionante-espectaculo-que-realiza-un-hombre-disfrazado-spiderman-avenida-italia-n5952965',
 th_yogurt:'https://www.nationthailand.com/in-focus/40006400',
 th_school:'https://www.sanook.com/men/13421/',
 pe_bus:'https://elcomercio.pe/redes-sociales/facebook/facebook-viral-spiderman-baila-cumple-reto-dura-challenge-colectivo-lima-video-nnda-noticia-537172-noticia/'
};
(async()=>{const dir=path.join(__dirname,'..','research');await fs.mkdir(dir,{recursive:true});
 const reports=await Promise.all(Object.entries(pages).map(async([key,url])=>{
  try{const res=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!res.ok)throw Error('HTTP '+res.status);const html=await res.text();await fs.writeFile(path.join(dir,key+'.html'),html);
   const dom=new JSDOM(html,{url}),doc=dom.window.document;
   const main=doc.querySelector('article')||doc;
   const images=[...main.querySelectorAll('img,amp-img')].map(i=>({src:i.getAttribute('src'),lazy:i.getAttribute('data-src'),srcset:i.getAttribute('srcset'),alt:i.getAttribute('alt'),caption:i.closest('figure')?.textContent?.trim()}));
   const report={key,url,title:doc.title,og:doc.querySelector('meta[property="og:image"]')?.content,images};await fs.writeFile(path.join(dir,key+'.json'),JSON.stringify(report,null,2));
   dom.window.close();return {key,title:report.title,og:report.og,images:images.filter(i=>/aranha|spider|gaucho|miranha|hombre|fantasi|deadpool/i.test(JSON.stringify(i)))};
  }catch(e){return {key,error:e.message};}
 }));console.log(JSON.stringify(reports,null,2));
})();
