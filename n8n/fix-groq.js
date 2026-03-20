const http = require("http");
function login(cb){const data=JSON.stringify({emailOrLdapLoginId:"EMAIL_HERE",password:"PASSWORD_HERE"});const req=http.request({hostname:"localhost",port:5678,path:"/rest/login",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}},res=>{let body="";const cookie=res.headers["set-cookie"][0].split(";")[0];res.on("data",c=>body+=c);res.on("end",()=>cb(cookie));});req.write(data);req.end();}
function get(cookie,path,cb){const req=http.request({hostname:"localhost",port:5678,path:path,method:"GET",headers:{"Cookie":cookie}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(JSON.parse(body)));});req.end();}
function patch(cookie,path,payload,cb){const data=JSON.stringify(payload);const req=http.request({hostname:"localhost",port:5678,path:path,method:"PATCH",headers:{"Cookie":cookie,"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(res.statusCode));});req.write(data);req.end();}

const GROQ_KEY = "GROQ_KEY_HERE";
const SYSTEM_PROMPT = "Eres el asistente virtual de ProVitamins Peru, tienda de suplementos deportivos y proteinas originales en Lima. Responde amablemente en español, se breve (maximo 2-3 lineas). Productos: whey protein desde S/89, creatina desde S/49, mass gainer, pre-entreno, bcaa, vitaminas. Envio a todo Peru, pago contraentrega. Web: https://calogojh.duckdns.org. Si quieren comprar diles que escriban el producto que desean.";

login(cookie => {
  get(cookie, "/rest/workflows/botfinal", resp => {
    const wf = resp.data || resp;

    // Reemplazar nodo OpenAI/Responder con Groq + Enviar
    const newNodes = [
      wf.nodes.find(n => n.name === "Webhook"),
      wf.nodes.find(n => n.name === "Procesar"),
      {
        id: "groq1",
        name: "Groq AI",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        position: [750, 300],
        parameters: {
          method: "POST",
          url: "https://api.groq.com/openai/v1/chat/completions",
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {name: "Authorization", value: "Bearer " + GROQ_KEY},
              {name: "Content-Type", value: "application/json"}
            ]
          },
          sendBody: true,
          specifyBody: "json",
          jsonBody: '={{ JSON.stringify({model:"llama-3.1-8b-instant",messages:[{role:"system",content:"' + SYSTEM_PROMPT + '"},{role:"user",content:$json.name+" dice: "+$json.text}],max_tokens:200,temperature:0.7}) }}'
        }
      },
      {
        id: "send1",
        name: "Enviar WhatsApp",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        position: [1000, 300],
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
          specifyBody: "json",
          jsonBody: '={{ JSON.stringify({number: $("Procesar").first().json.phone, textMessage: {text: $json.choices[0].message.content}}) }}'
        }
      }
    ];

    const newConnections = {
      "Webhook": {main: [[{node: "Procesar", type: "main", index: 0}]]},
      "Procesar": {main: [[{node: "Groq AI", type: "main", index: 0}]]},
      "Groq AI": {main: [[{node: "Enviar WhatsApp", type: "main", index: 0}]]}
    };

    patch(cookie, "/rest/workflows/botfinal", {
      nodes: newNodes,
      connections: newConnections
    }, s => {
      console.log("Bot actualizado con Groq:", s);
    });
  });
});
