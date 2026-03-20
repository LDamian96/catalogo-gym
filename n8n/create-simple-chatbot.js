const http = require("http");

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
    let body="";
    res.on("data",c=>body+=c);
    res.on("end",()=>cb(res.statusCode, body));
  });
  if(data) req.write(data);
  req.end();
}

// Simple chatbot workflow that WORKS
const simpleWorkflow = {
  name: "Chatbot WhatsApp - Simple",
  active: true,
  nodes: [
    {
      id: "webhook1",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [250, 300],
      webhookId: "simple-chatbot",
      parameters: {
        httpMethod: "POST",
        path: "simple-chatbot",
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
        jsCode: `
// Extract message from Evolution API v1 webhook
const body = $input.first().json;
const data = body.data || body;
const key = data.key || {};
const message = data.message || {};

// Skip messages from myself
if (key.fromMe === true) {
  return [];
}

// Extract text
let text = message.conversation ||
           message.extendedTextMessage?.text ||
           message.imageMessage?.caption ||
           '';

// Extract phone number (remove @s.whatsapp.net)
const phone = (key.remoteJid || '').replace('@s.whatsapp.net', '');
const name = data.pushName || 'Cliente';

if (!text || !phone) {
  return [];
}

return [{json: { phone, name, text, remoteJid: key.remoteJid }}];
`
      }
    },
    {
      id: "openai1",
      name: "AI Responder",
      type: "@n8n/n8n-nodes-langchain.openAi",
      typeVersion: 1.6,
      position: [690, 300],
      parameters: {
        resource: "chat",
        model: "gpt-4o-mini",
        messages: {
          values: [
            {
              role: "system",
              content: "Eres el asistente virtual de ProVitamins Perú, una tienda de suplementos deportivos y proteínas originales en Lima. Responde amablemente en español, sé breve (máximo 3 líneas). Si preguntan por productos, menciona que tenemos whey protein, creatina, mass gainer, pre-entrenos y vitaminas. Para comprar, diles que visiten nuestra web: https://calogojh.duckdns.org o que escriban 'quiero comprar [producto]'. Precio referencial: proteínas desde S/89, creatina desde S/49. Envío a todo el Perú, pago contraentrega."
            },
            {
              role: "user",
              content: "={{$json.name}} dice: {{$json.text}}"
            }
          ]
        },
        options: {
          maxTokens: 300,
          temperature: 0.7
        }
      },
      credentials: {
        openAiApi: {
          id: "rse5K6B4MOeBr8eL",
          name: "OpenAI"
        }
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
        jsonBody: "={{ JSON.stringify({ number: $('Extraer Mensaje').first().json.phone, textMessage: { text: $json.message?.content || $json.text || 'Hola! Soy el asistente de ProVitamins. ¿En qué puedo ayudarte?' } }) }}"
      }
    },
    {
      id: "respond1",
      name: "Respond",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [1130, 300],
      parameters: {
        respondWith: "json",
        responseBody: "={{ JSON.stringify({status: 'ok'}) }}"
      }
    }
  ],
  connections: {
    "Webhook": {
      main: [[{ node: "Extraer Mensaje", type: "main", index: 0 }]]
    },
    "Extraer Mensaje": {
      main: [[{ node: "AI Responder", type: "main", index: 0 }]]
    },
    "AI Responder": {
      main: [[{ node: "Enviar WhatsApp", type: "main", index: 0 }]]
    },
    "Enviar WhatsApp": {
      main: [[{ node: "Respond", type: "main", index: 0 }]]
    }
  },
  settings: {
    executionOrder: "v1"
  }
};

login(cookie => {
  // First deactivate the old chatbot
  apiCall(cookie, "PATCH", "/rest/workflows/wf_1", { active: false }, (s1) => {
    console.log("Old chatbot deactivated:", s1);

    // Create new simple chatbot
    apiCall(cookie, "POST", "/rest/workflows", simpleWorkflow, (s2, body) => {
      console.log("New chatbot created:", s2);
      try {
        const resp = JSON.parse(body);
        const wfId = resp.data?.id || resp.id;
        console.log("Workflow ID:", wfId);

        // Activate it
        if (wfId) {
          apiCall(cookie, "PATCH", "/rest/workflows/" + wfId, { active: true }, (s3) => {
            console.log("Activated:", s3);
            console.log("\nDONE! Webhook: /webhook/simple-chatbot");
          });
        }
      } catch(e) {
        console.log("Response:", body.substring(0, 300));
      }
    });
  });
});
