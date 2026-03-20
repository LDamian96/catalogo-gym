const http = require("http");
function login(cb){const data=JSON.stringify({emailOrLdapLoginId:"EMAIL_HERE",password:"PASSWORD_HERE"});const req=http.request({hostname:"localhost",port:5678,path:"/rest/login",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}},res=>{let body="";const cookie=res.headers["set-cookie"][0].split(";")[0];res.on("data",c=>body+=c);res.on("end",()=>cb(cookie));});req.write(data);req.end();}
function get(cookie,path,cb){const req=http.request({hostname:"localhost",port:5678,path:path,method:"GET",headers:{"Cookie":cookie}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(JSON.parse(body)));});req.end();}
function patch(cookie,path,payload,cb){const data=JSON.stringify(payload);const req=http.request({hostname:"localhost",port:5678,path:path,method:"PATCH",headers:{"Cookie":cookie,"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(res.statusCode));});req.write(data);req.end();}

login(cookie => {
  get(cookie, "/rest/workflows/botfinal", resp => {
    const wf = resp.data || resp;
    const procNode = wf.nodes.find(n => n.name === "Procesar");
    if (procNode) {
      // Just return EVERYTHING as-is, no filtering
      procNode.parameters.jsCode = "return [{json: $input.first().json}];";

      // Also remove Groq and WhatsApp send - just log
      // Keep only Webhook -> Procesar
      const webhook = wf.nodes.find(n => n.name === "Webhook");

      patch(cookie, "/rest/workflows/botfinal", {
        nodes: [webhook, procNode],
        connections: {
          "Webhook": {main: [[{node: "Procesar", type: "main", index: 0}]]}
        }
      }, s => {
        console.log("Simplified to just log:", s);
      });
    }
  });
});
