const http = require("http");
function login(cb){const data=JSON.stringify({emailOrLdapLoginId:"EMAIL_HERE",password:"PASSWORD_HERE"});const req=http.request({hostname:"localhost",port:5678,path:"/rest/login",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}},res=>{let body="";const cookie=res.headers["set-cookie"][0].split(";")[0];res.on("data",c=>body+=c);res.on("end",()=>cb(cookie));});req.write(data);req.end();}
function patch(cookie,path,payload,cb){const data=JSON.stringify(payload);const req=http.request({hostname:"localhost",port:5678,path:path,method:"PATCH",headers:{"Cookie":cookie,"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(res.statusCode));});req.write(data);req.end();}

const codeJs = `
// Get incoming data
var input = $input.first().json;
var data = input.data || input;
var key = data.key || {};
var msg = data.message || {};

// Skip own messages
if (key.fromMe === true) return [];

// Get phone number
var jid = key.remoteJid || '';
var phone = jid.replace('@s.whatsapp.net', '');
var text = msg.conversation || (msg.extendedTextMessage && msg.extendedTextMessage.text) || '';

if (!phone || !text) return [];

// Send WhatsApp response directly from code
var responseText = 'Hola! Soy el asistente de ProVitamins Peru. Tenemos proteinas, creatina, pre-entreno y mas. Visita nuestra web: https://calogojh.duckdns.org';

var postData = JSON.stringify({
  number: phone,
  textMessage: { text: responseText }
});

// Make HTTP request to Evolution API
var result = await fetch('http://172.18.0.8:8085/message/sendText/catalogo', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'EVO_KEY_HERE'
  },
  body: postData
});

var resBody = await result.text();
return [{json: {sent: true, phone: phone, status: result.status, response: resBody.substring(0,200)}}];
`;

login(cookie => {
  const nodes = [
    {
      id: "w1",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [250, 300],
      webhookId: "bot-ultra",
      parameters: {
        httpMethod: "POST",
        path: "bot-ultra",
        options: {}
      }
    },
    {
      id: "c1",
      name: "Responder",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [500, 300],
      parameters: {
        jsCode: codeJs
      }
    }
  ];

  const connections = {
    "Webhook": {main: [[{node: "Responder", type: "main", index: 0}]]}
  };

  patch(cookie, "/rest/workflows/botultra", {nodes, connections}, s => {
    console.log("Bot updated to all-in-code:", s);
  });
});
