const {spawnSync}=require('node:child_process'),path=require('node:path');
for(const file of ['entry-regressions.cjs','photo-pipeline.cjs']){
 const result=spawnSync(process.execPath,[path.join(__dirname,file),...process.argv.slice(2)],{stdio:'inherit'});
 if(result.status!==0){process.exitCode=result.status||1;break;}
}
