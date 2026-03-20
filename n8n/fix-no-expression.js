const http = require("http");
function login(cb){const data=JSON.stringify({emailOrLdapLoginId:"EMAIL_HERE",password:"PASSWORD_HERE"});const req=http.request({hostname:"localhost",port:5678,path:"/rest/login",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}},res=>{let body="";const cookie=res.headers["set-cookie"][0].split(";")[0];res.on("data",c=>body+=c);res.on("end",()=>cb(cookie));});req.write(data);req.end();}
function patch(cookie,path,payload,cb){const data=JSON.stringify(payload);const req=http.request({hostname:"localhost",port:5678,path:path,method:"PATCH",headers:{"Cookie":cookie,"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(res.statusCode));});req.write(data);req.end();}

// Code extracts phone + builds the full body JSON string
const extractCode = `var input = $input.first().json;
var data = input.data || input;
var key = data.key || {};
var msg = data.message || {};
if (key.fromMe === true) return [];
var jid = key.remoteJid || '';
var phone = jid.replace('@s.whatsapp.net', '');
var text = msg.conversation || '';
if (msg.extendedTextMessage) text = msg.extendedTextMessage.text || '';
if (!phone || !text) return [];
var body = JSON.stringify({
  number: phone,
  textMessage: { text: 'Hola! Soy ProVitamins Peru. Proteinas desde S/89, creatina desde S/49. Web: https://calogojh.duckdns.org' }
});
return [{json: {phone: phone, text: text, requestBody: body}}];`;

login(cookie => {
  patch(cookie, "/rest/workflows/botultra", {
    nodes: [
      {
        id: "w1", name: "Webhook", type: "n8n-nodes-base.webhook", typeVersion: 2,
        position: [250, 300], webhookId: "bot-ultra",
        parameters: { httpMethod: "POST", path: "bot-ultra", options: {} }
      },
      {
        id: "c1", name: "Extraer", type: "n8n-nodes-base.code", typeVersion: 2,
        position: [500, 300],
        parameters: { jsCode: extractCode }
      },
      {
        id: "h1", name: "Enviar", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2,
        position: [750, 300],
        parameters: {
          method: "POST",
          url: "http://172.18.0.8:8085/message/sendText/catalogo",
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {name: "apikey", value: "EVO_KEY_HERE"},
              {name: "Content-Type", value: "application/json"}
            ]
          },
          sendBody: true,
          specifyBody: "string",
          body: "={{ $json.requestBody }}"
        }
      }
    ],
    connections: {
      "Webhook": {main: [[{node: "Extraer", type: "main", index: 0}]]},
      "Extraer": {main: [[{node: "Enviar", type: "main", index: 0}]]}
    }
  }, s => {
    console.log("Updated:", s);
  });
});
