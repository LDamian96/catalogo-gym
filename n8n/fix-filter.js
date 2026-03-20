const http = require("http");
function login(cb){const data=JSON.stringify({emailOrLdapLoginId:"EMAIL_HERE",password:"PASSWORD_HERE"});const req=http.request({hostname:"localhost",port:5678,path:"/rest/login",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}},res=>{let body="";const cookie=res.headers["set-cookie"][0].split(";")[0];res.on("data",c=>body+=c);res.on("end",()=>cb(cookie));});req.write(data);req.end();}
function get(cookie,path,cb){const req=http.request({hostname:"localhost",port:5678,path:path,method:"GET",headers:{"Cookie":cookie}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(JSON.parse(body)));});req.end();}
function patch(cookie,path,payload,cb){const data=JSON.stringify(payload);const req=http.request({hostname:"localhost",port:5678,path:path,method:"PATCH",headers:{"Cookie":cookie,"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(res.statusCode));});req.write(data);req.end();}

login(cookie => {
  get(cookie, "/rest/workflows/botfinal", resp => {
    const wf = resp.data || resp;
    const procNode = wf.nodes.find(n => n.name === "Procesar");
    if (procNode) {
      // Remove fromMe filter + log everything for debug
      procNode.parameters.jsCode = `const input = $input.first().json;
const data = input.data || input;
const key = data.key || {};
const msg = data.message || {};
const phone = (key.remoteJid || '').replace('@s.whatsapp.net','');
const text = msg.conversation || msg.extendedTextMessage?.text || '';
const name = data.pushName || 'Cliente';
// Log for debug
console.log('INCOMING:', JSON.stringify({phone,text,name,fromMe:key.fromMe,remoteJid:key.remoteJid}));
// Skip if no text or phone, but DON'T skip fromMe for now
if (!phone || !text) return [];
if (key.fromMe === true) return [];
return [{json:{phone, text, name}}];`;

      patch(cookie, "/rest/workflows/botfinal", {nodes: wf.nodes}, s => {
        console.log("Procesar node updated:", s);
      });
    }
  });
});
