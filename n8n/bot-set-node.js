const http = require("http");
function login(cb){const data=JSON.stringify({emailOrLdapLoginId:"EMAIL_HERE",password:"PASSWORD_HERE"});const req=http.request({hostname:"localhost",port:5678,path:"/rest/login",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}},res=>{let body="";const cookie=res.headers["set-cookie"][0].split(";")[0];res.on("data",c=>body+=c);res.on("end",()=>cb(cookie));});req.write(data);req.end();}
function patch(cookie,path,payload,cb){const data=JSON.stringify(payload);const req=http.request({hostname:"localhost",port:5678,path:path,method:"PATCH",headers:{"Cookie":cookie,"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(res.statusCode));});req.write(data);req.end();}

login(cookie => {
  patch(cookie, "/rest/workflows/botultra", {
    nodes: [
      {
        id: "w1", name: "Webhook", type: "n8n-nodes-base.webhook", typeVersion: 2,
        position: [250, 300], webhookId: "bot-ultra",
        parameters: { httpMethod: "POST", path: "bot-ultra", options: {} }
      },
      {
        id: "s1", name: "Set Data", type: "n8n-nodes-base.set", typeVersion: 3.4,
        position: [500, 300],
        parameters: {
          mode: "manual",
          duplicateItem: false,
          assignments: {
            assignments: [
              { id: "a1", name: "number", type: "string", value: "51929751690" },
              { id: "a2", name: "msg", type: "string", value: "Hola! Soy ProVitamins Peru. Proteinas desde S/89. Web: https://calogojh.duckdns.org" }
            ]
          },
          options: {}
        }
      },
      {
        id: "h1", name: "Send", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2,
        position: [750, 300],
        parameters: {
          method: "POST",
          url: "http://172.18.0.8:8085/message/sendText/catalogo",
          authentication: "genericCredentialType",
          genericAuthType: "httpHeaderAuth",
          sendBody: true,
          specifyBody: "json",
          jsonBody: "{\"number\":\"51929751690\",\"textMessage\":{\"text\":\"BOT TEST HARDCODED\"}}"
        },
        credentials: {
          httpHeaderAuth: { id: "qWZl55tfpwLCNHJf", name: "Evolution API" }
        }
      }
    ],
    connections: {
      "Webhook": {main: [[{node: "Set Data", type: "main", index: 0}]]},
      "Set Data": {main: [[{node: "Send", type: "main", index: 0}]]}
    }
  }, s => {
    console.log("Updated:", s);
  });
});
