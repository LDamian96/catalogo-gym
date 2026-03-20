const http = require("http");
function login(cb){const data=JSON.stringify({emailOrLdapLoginId:"EMAIL_HERE",password:"PASSWORD_HERE"});const req=http.request({hostname:"localhost",port:5678,path:"/rest/login",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}},res=>{let body="";const cookie=res.headers["set-cookie"][0].split(";")[0];res.on("data",c=>body+=c);res.on("end",()=>cb(cookie));});req.write(data);req.end();}
function get(cookie,path,cb){const req=http.request({hostname:"localhost",port:5678,path:path,method:"GET",headers:{"Cookie":cookie}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(JSON.parse(body)));});req.end();}
function patch(cookie,path,payload,cb){const data=JSON.stringify(payload);const req=http.request({hostname:"localhost",port:5678,path:path,method:"PATCH",headers:{"Cookie":cookie,"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(res.statusCode));});req.write(data);req.end();}

login(cookie => {
  get(cookie, "/rest/workflows/botultra", resp => {
    const wf = resp.data || resp;
    const sendNode = wf.nodes.find(n => n.name === "Responder");
    if (sendNode) {
      // Fix: no optional chaining, use simple path
      sendNode.parameters.jsonBody = '={{ JSON.stringify({number: String($json.data && $json.data.key && $json.data.key.remoteJid ? $json.data.key.remoteJid : ($json.key && $json.key.remoteJid ? $json.key.remoteJid : "")).replace("@s.whatsapp.net",""), textMessage: {text: "Hola! Soy ProVitamins Peru. Proteinas desde S/89, creatina desde S/49. Web: https://calogojh.duckdns.org"}}) }}';
      console.log("Fixed jsonBody");
      patch(cookie, "/rest/workflows/botultra", {nodes: wf.nodes}, s => {
        console.log("Updated:", s);
      });
    }
  });
});
