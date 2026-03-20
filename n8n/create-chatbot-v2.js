const http = require("http");
const OPENAI_KEY = "OPENAI_KEY_HERE";

function login(cb) {
  const data = JSON.stringify({emailOrLdapLoginId:"EMAIL_HERE",password:"PASSWORD_HERE"});
  const req = http.request({hostname:"localhost",port:5678,path:"/rest/login",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}}, res => {
    let body="";const cookie=res.headers["set-cookie"][0].split(";")[0];
    res.on("data",c=>body+=c);res.on("end",()=>cb(cookie));
  });req.write(data);req.end();
}
function apiCall(cookie, method, path, payload, cb) {
  const data = payload ? JSON.stringify(payload) : null;
  const opts = {hostname:"localhost",port:5678,path:path,method:method,headers:{"Cookie":cookie,"Content-Type":"application/json"}};
  if(data) opts.headers["Content-Length"] = Buffer.byteLength(data);
  const req = http.request(opts, res => {
    let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(res.statusCode, body));
  });
  if(data) req.write(data);
  req.end();
}

const workflow = {
  name: "Bot WhatsApp ProVitamins",
  active: true,
  nodes: [
    {
      id: "wh1",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [250, 300],
      webhookId: "bot-wsp",
      parameters: {
        httpMethod: "POST",
        path: "bot-wsp",
        responseMode: "responseNode",
        options: {}
      }
    },
    {
      id: "code1",
      name: "Extraer Mensaje",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [470, 300],
      parameters: {
        jsCode: "const body = $input.first().json;\nconst data = body.data || body;\nconst key = data.key || {};\nconst message = data.message || {};\nif (key.fromMe === true) return [];\nlet text = message.conversation || message.extendedTextMessage?.text || message.imageMessage?.caption || '';\nconst phone = (key.remoteJid || '').replace('@s.whatsapp.net', '');\nconst name = data.pushName || 'Cliente';\nif (!text || !phone) return [];\nreturn [{json: { phone, name, text }}];"
      }
    },
    {
      id: "ai1",
      name: "OpenAI",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [690, 300],
      parameters: {
        method: "POST",
        url: "https://api.openai.com/v1/chat/completions",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: "Authorization", value: "Bearer " + OPENAI_KEY },
            { name: "Content-Type", value: "application/json" }
          ]
        },
        sendBody: true,
        specifyBody: "json",
        jsonBody: '={{ JSON.stringify({model:"gpt-4o-mini",messages:[{role:"system",content:"Eres el asistente de ProVitamins Peru, tienda de suplementos deportivos en Lima. Responde en español, breve (max 3 lineas). Productos: whey protein desde S/89, creatina desde S/49, mass gainer, pre-entreno, vitaminas. Web: https://calogojh.duckdns.org. Envio a todo Peru, pago contraentrega."},{role:"user",content:$json.name+" dice: "+$json.text}],max_tokens:200,temperature:0.7}) }}'
      }
    },
    {
      id: "send1",
      name: "Enviar WhatsApp",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [910, 300],
      parameters: {
        method: "POST",
        url: "http://72.60.251.43:8085/message/sendText/catalogo",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: "apikey", value: "EVO_KEY_HERE" },
            { name: "Content-Type", value: "application/json" }
          ]
        },
        sendBody: true,
        specifyBody: "json",
        jsonBody: '={{ JSON.stringify({number: $("Extraer Mensaje").first().json.phone, textMessage: {text: $json.choices[0].message.content}}) }}'
      }
    },
    {
      id: "resp1",
      name: "Respond",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [1130, 300],
      parameters: {
        respondWith: "json",
        responseBody: '={"status":"ok"}'
      }
    }
  ],
  connections: {
    "Webhook": { main: [[{node:"Extraer Mensaje",type:"main",index:0}]] },
    "Extraer Mensaje": { main: [[{node:"OpenAI",type:"main",index:0}]] },
    "OpenAI": { main: [[{node:"Enviar WhatsApp",type:"main",index:0}]] },
    "Enviar WhatsApp": { main: [[{node:"Respond",type:"main",index:0}]] }
  },
  settings: { executionOrder: "v1" }
};

login(cookie => {
  // Delete old simple chatbot
  apiCall(cookie, "DELETE", "/rest/workflows/CrqBmhakbm4Z0Nt5", null, (s1) => {
    console.log("Deleted old:", s1);

    // Create new
    apiCall(cookie, "POST", "/rest/workflows", workflow, (s2, body) => {
      console.log("Created:", s2);
      try {
        const r = JSON.parse(body);
        const id = r.data?.id || r.id;
        console.log("ID:", id);

        // Activate
        apiCall(cookie, "PATCH", "/rest/workflows/" + id, {active: true}, (s3, b3) => {
          const r3 = JSON.parse(b3);
          console.log("Active:", r3.data?.active);

          if (!r3.data?.active) {
            console.log("ACTIVATION FAILED - checking logs...");
            console.log(b3.substring(0, 500));
          } else {
            console.log("\nSUCCESS! Webhook: /webhook/bot-wsp");
          }
        });
      } catch(e) {
        console.log("Error:", body.substring(0, 300));
      }
    });
  });
});
