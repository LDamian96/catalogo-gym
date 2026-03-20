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
const INST = "catalogo";
const KEY = "EVO_KEY_HERE";

login(cookie => {
  const ids = ["wf_1","wf_2","wf_3","wf_4","wf_5","wf_6"];
  let i = 0;

  function next() {
    if (i >= ids.length) { console.log("\nALL SEND NODES FIXED!"); return; }
    get(cookie, "/rest/workflows/" + ids[i], resp => {
      const wf = resp.data || resp;
      let changed = false;

      (wf.nodes || []).forEach(n => {
        if (n.type === "n8n-nodes-base.httpRequest" && n.parameters && n.parameters.url) {
          let url = n.parameters.url;

          // Fix URLs with expressions that reference instanceName
          if (url.includes("$json.instanceName") || url.includes("instanceName")) {
            url = url.replace(/\{\{\s*\$json\.instanceName\s*\}\}/g, INST);
            url = url.replace(/\{\{\s*\$json\["instanceName"\]\s*\}\}/g, INST);
          }

          // Remove leading = from expression URLs that were broken
          if (url.startsWith("=") && !url.startsWith("={{")) {
            url = url.substring(1);
          }

          // Fix double http in URLs
          url = url.replace(/=http/g, "http");

          if (url !== n.parameters.url) {
            n.parameters.url = url;
            changed = true;
            console.log("  " + wf.name + " -> Fixed URL in '" + n.name + "': " + url);
          }

          // Fix header values with leading =
          if (n.parameters.headerParameters && n.parameters.headerParameters.parameters) {
            n.parameters.headerParameters.parameters.forEach(h => {
              if (h.value && h.value.startsWith("=") && !h.value.startsWith("={{")) {
                h.value = h.value.substring(1);
                changed = true;
                console.log("  " + wf.name + " -> Fixed header '" + h.name + "' in '" + n.name + "'");
              }
            });
          }
        }
      });

      if (changed) {
        patch(cookie, "/rest/workflows/" + ids[i], { nodes: wf.nodes }, s => {
          i++; next();
        });
      } else {
        i++; next();
      }
    });
  }
  next();
});
