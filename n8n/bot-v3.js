const http = require("http");
function login(cb){const data=JSON.stringify({emailOrLdapLoginId:"EMAIL_HERE",password:"PASSWORD_HERE"});const req=http.request({hostname:"localhost",port:5678,path:"/rest/login",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}},res=>{let body="";const cookie=res.headers["set-cookie"][0].split(";")[0];res.on("data",c=>body+=c);res.on("end",()=>cb(cookie));});req.write(data);req.end();}
function patch(cookie,path,payload,cb){const data=JSON.stringify(payload);const req=http.request({hostname:"localhost",port:5678,path:path,method:"PATCH",headers:{"Cookie":cookie,"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(res.statusCode,body));});req.write(data);req.end();}

login(cookie => {
  patch(cookie, "/rest/workflows/botultra", {
    nodes: [
      {
        id: "w1", name: "Webhook", type: "n8n-nodes-base.webhook", typeVersion: 2,
        position: [250, 300], webhookId: "bot-ultra",
        parameters: { httpMethod: "POST", path: "bot-ultra", options: {} }
      },
      {
        id: "h1", name: "Enviar", type: "n8n-nodes-base.httpRequest", typeVersion: 3,
        position: [500, 300],
        parameters: {
          method: "POST",
          url: "http://172.18.0.8:8085/message/sendText/catalogo",
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {name: "apikey", value: "EVO_KEY_HERE"}
            ]
          },
          sendBody: true,
          contentType: "json",
          bodyParameters: {
            parameters: [
              {name: "number", value: "51929751690"},
              {name: "textMessage", value: "{\"text\":\"BOT FUNCIONA v3!\"}"}
            ]
          }
        }
      }
    ],
    connections: {
      "Webhook": {main: [[{node: "Enviar", type: "main", index: 0}]]}
    }
  }, (s) => {
    console.log("Updated:", s);
  });
});
