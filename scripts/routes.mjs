import fs from 'node:fs';
const nav=JSON.parse(fs.readFileSync('content/site/navigation.json','utf8'));
const html=fs.readFileSync('dist/index.html','utf8');
const allRoutes=[...nav,...["research","team","publications","news","gallery","about-di","404"].filter(route=>!nav.some(item=>item.href==="/"+route)).map(route=>({href:"/"+route,label:route==="about-di"?"About Di":route[0].toUpperCase()+route.slice(1)}))];
for(const {href,label} of allRoutes){
 if(href==='/') continue;
 if(!/^\/[a-z0-9-]+$/.test(href)) throw Error('Invalid route: '+href);
 const dir='dist'+href; fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(dir+'/index.html',html.replace(/<title>.*?<\/title>/,`<title>${label.replace(/[<>&]/g,'')} | SEIL Lab | University of Surrey</title>`));
}
fs.writeFileSync('dist/404.html',html.replace(/<title>.*?<\/title>/,'<title>Page not found | SEIL Lab</title>'));
fs.writeFileSync('dist/.nojekyll','');
