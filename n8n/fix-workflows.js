const http = require("http");

function login(cb) {
  const data = JSON.stringify({emailOrLdapLoginId:"EMAIL_HERE",password:"PASSWORD_HERE"});
  const req = http.request({hostname:"localhost",port:5678,path:"/rest/login",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}}, res => {
    let body="";const cookie=res.headers["set-cookie"][0].split(";")[0];
    res.on("data",c=>body+=c);res.on("end",()=>cb(cookie));
  });req.write(data);req.end();
}

function get(cookie,path,cb){
  const req=http.request({hostname:"localhost",port:5678,path:path,method:"GET",headers:{"Cookie":cookie}},res=>{
    let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(JSON.parse(body)));
  });req.end();
}

function patch(cookie,path,payload,cb){
  const data=JSON.stringify(payload);
  const req=http.request({hostname:"localhost",port:5678,path:path,method:"PATCH",headers:{"Cookie":cookie,"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}},res=>{
    let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(res.statusCode));
  });req.write(data);req.end();
}

const EVO = "http://72.60.251.43:8085";
const API = "https://calogojh.duckdns.org/api/v1";
const KEY = "EVO_KEY_HERE";
const INST = "catalogo";
const PHONE = "51929751690";

function fixStr(str) {
  if (!str || typeof str !== "string") return { val: str, changed: false };
  let result = str;
  const original = str;

  // $env references in expressions {{ }}
  result = result.replace(/\{\{\s*\$env\.EVOLUTION_API_URL\s*\|\|\s*'[^']*'\s*\}\}/g, EVO);
  result = result.replace(/\{\{\s*\$env\.EVOLUTION_API_URL\s*\}\}/g, EVO);
  result = result.replace(/\{\{\s*\$env\.EVOLUTION_API_KEY\s*\}\}/g, KEY);
  result = result.replace(/\{\{\s*\$env\.EVOLUTION_INSTANCE\s*\}\}/g, INST);
  result = result.replace(/\{\{\s*\$env\.CATALOG_API_URL\s*\|\|\s*'[^']*'\s*\}\}/g, API);
  result = result.replace(/\{\{\s*\$env\.CATALOG_API_URL\s*\}\}/g, API);
  result = result.replace(/\{\{\s*\$env\.ADMIN_PHONE\s*\}\}/g, PHONE);
  result = result.replace(/\{\{\s*\$env\.ADMIN_NUMBER\s*\}\}/g, PHONE);

  // $env references in JS code
  result = result.replace(/\$env\.EVOLUTION_API_URL\s*\|\|\s*'[^']*'/g, "'" + EVO + "'");
  result = result.replace(/\$env\.EVOLUTION_API_URL/g, "'" + EVO + "'");
  result = result.replace(/\$env\.EVOLUTION_API_KEY/g, "'" + KEY + "'");
  result = result.replace(/\$env\.EVOLUTION_INSTANCE/g, "'" + INST + "'");
  result = result.replace(/\$env\.CATALOG_API_URL\s*\|\|\s*'[^']*'/g, "'" + API + "'");
  result = result.replace(/\$env\.CATALOG_API_URL/g, "'" + API + "'");
  result = result.replace(/\$env\.ADMIN_PHONE/g, "'" + PHONE + "'");
  result = result.replace(/\$env\.ADMIN_NUMBER/g, "'" + PHONE + "'");
  result = result.replace(/\$env\.CLOUDINARY_CLOUD_NAME/g, "'dnqkkd5nj'");
  result = result.replace(/\$env\.CLOUDINARY_API_KEY/g, "'388425642996986'");
  result = result.replace(/\$env\.CLOUDINARY_API_SECRET/g, "'r_S3rJO1yYVeEKgaIKQad44DWGQ'");
  result = result.replace(/\$env\.CATALOG_ADMIN_EMAIL\s*\|\|\s*'[^']*'/g, "'admin@provitamins.com'");
  result = result.replace(/\$env\.CATALOG_ADMIN_EMAIL/g, "'admin@provitamins.com'");
  result = result.replace(/\$env\.CATALOG_ADMIN_PASS\s*\|\|\s*'[^']*'/g, "'admin123'");
  result = result.replace(/\$env\.CATALOG_ADMIN_PASS/g, "'admin123'");

  // Hardcoded wrong URLs
  result = result.replace(/https:\/\/evo\.tudominio\.com/g, EVO);
  result = result.replace(/http:\/\/localhost:8085/g, EVO);
  result = result.replace(/http:\/\/localhost:4000\/api\/v1/g, API);

  return { val: result, changed: result !== original };
}

function fixNode(node) {
  let changed = false;
  if (!node.parameters) return false;

  for (const key of Object.keys(node.parameters)) {
    const val = node.parameters[key];
    if (typeof val === "string") {
      const r = fixStr(val);
      if (r.changed) { node.parameters[key] = r.val; changed = true; }
    }
    if (val && typeof val === "object") {
      // Fix nested parameter arrays
      if (val.parameters && Array.isArray(val.parameters)) {
        val.parameters.forEach(p => {
          if (typeof p.value === "string") {
            const r = fixStr(p.value);
            if (r.changed) { p.value = r.val; changed = true; }
          }
        });
      }
    }
  }
  return changed;
}

login(cookie => {
  const ids = ["wf_1","wf_2","wf_3","wf_4","wf_5","wf_6"];
  let i = 0;

  function next() {
    if (i >= ids.length) { console.log("\nALL WORKFLOWS FIXED!"); return; }
    get(cookie, "/rest/workflows/" + ids[i], resp => {
      const wf = resp.data || resp;
      let anyChanged = false;
      (wf.nodes || []).forEach(n => { if (fixNode(n)) anyChanged = true; });

      if (anyChanged) {
        patch(cookie, "/rest/workflows/" + ids[i], { nodes: wf.nodes }, s => {
          console.log(wf.name + ": FIXED (" + s + ")");
          i++; next();
        });
      } else {
        console.log(wf.name + ": no changes needed");
        i++; next();
      }
    });
  }
  next();
});
