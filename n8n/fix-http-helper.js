const http = require("http");
function login(cb){const data=JSON.stringify({emailOrLdapLoginId:"EMAIL_HERE",password:"PASSWORD_HERE"});const req=http.request({hostname:"localhost",port:5678,path:"/rest/login",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}},res=>{let body="";const cookie=res.headers["set-cookie"][0].split(";")[0];res.on("data",c=>body+=c);res.on("end",()=>cb(cookie));});req.write(data);req.end();}
function patch(cookie,path,payload,cb){const data=JSON.stringify(payload);const req=http.request({hostname:"localhost",port:5678,path:path,method:"PATCH",headers:{"Cookie":cookie,"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(res.statusCode));});req.write(data);req.end();}

// Use this.$http helper instead of fetch
const codeJs = [
  "var input = $input.first().json;",
  "var data = input.data || input;",
  "var key = data.key || {};",
  "var msg = data.message || {};",
  "if (key.fromMe === true) return [];",
  "var jid = key.remoteJid || '';",
  "var phone = jid.replace('@s.whatsapp.net', '');",
  "var text = msg.conversation || (msg.extendedTextMessage ? msg.extendedTextMessage.text : '');",
  "if (!phone || !text) return [];",
  "var resp = await this.helpers.httpRequest({",
  "  method: 'POST',",
  "  url: 'http://172.18.0.8:8085/message/sendText/catalogo',",
  "  headers: { 'apikey': 'EVO_KEY_HERE', 'Content-Type': 'application/json' },",
  "  body: { number: phone, textMessage: { text: 'Hola! Soy ProVitamins Peru. Proteinas desde S/89, creatina desde S/49. Web: https://calogojh.duckdns.org' } },",
  "  json: true",
  "});",
  "return [{json: {sent: true, phone: phone}}];"
].join("\n");

login(cookie => {
  patch(cookie, "/rest/workflows/botultra", {
    nodes: [
      {
        id: "w1", name: "Webhook", type: "n8n-nodes-base.webhook", typeVersion: 2,
        position: [250, 300], webhookId: "bot-ultra",
        parameters: { httpMethod: "POST", path: "bot-ultra", options: {} }
      },
      {
        id: "c1", name: "Responder", type: "n8n-nodes-base.code", typeVersion: 2,
        position: [500, 300],
        parameters: { jsCode: codeJs }
      }
    ],
    connections: { "Webhook": {main: [[{node: "Responder", type: "main", index: 0}]]} }
  }, s => {
    console.log("Updated:", s);
  });
});
