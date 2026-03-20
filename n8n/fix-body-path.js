const http = require("http");
function login(cb){const data=JSON.stringify({emailOrLdapLoginId:"EMAIL_HERE",password:"PASSWORD_HERE"});const req=http.request({hostname:"localhost",port:5678,path:"/rest/login",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}},res=>{let body="";const cookie=res.headers["set-cookie"][0].split(";")[0];res.on("data",c=>body+=c);res.on("end",()=>cb(cookie));});req.write(data);req.end();}
function patch(cookie,path,payload,cb){const data=JSON.stringify(payload);const req=http.request({hostname:"localhost",port:5678,path:path,method:"PATCH",headers:{"Cookie":cookie,"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(res.statusCode));});req.write(data);req.end();}

login(cookie => {
  patch(cookie, "/rest/workflows/botnew", {
    nodes: [
      {
        id: "webhook_1", name: "Webhook", type: "n8n-nodes-base.webhook", typeVersion: 2,
        position: [250, 300], webhookId: "bot-nuevo",
        parameters: { httpMethod: "POST", path: "bot-nuevo", options: {} }
      },
      {
        id: "set_1", name: "Get Phone", type: "n8n-nodes-base.set", typeVersion: 3.4,
        position: [500, 300],
        parameters: {
          mode: "manual",
          duplicateItem: false,
          assignments: {
            assignments: [
              {
                id: "phone",
                name: "phone",
                type: "string",
                value: '={{ $json.body.sender ? $json.body.sender.replace("@s.whatsapp.net","") : "" }}'
              },
              {
                id: "fromMe",
                name: "fromMe",
                type: "string",
                value: '={{ String($json.body.data.key.fromMe) }}'
              },
              {
                id: "text",
                name: "text",
                type: "string",
                value: '={{ $json.body.data.message.conversation || "" }}'
              }
            ]
          },
          options: {}
        }
      },
      {
        id: "if_1", name: "Skip Own", type: "n8n-nodes-base.if", typeVersion: 2,
        position: [750, 300],
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: "" },
            combinator: "and",
            conditions: [
              {
                id: "c1",
                leftValue: '={{ $json.fromMe }}',
                rightValue: "false",
                operator: { type: "string", operation: "equals" }
              },
              {
                id: "c2",
                leftValue: '={{ $json.phone }}',
                rightValue: "",
                operator: { type: "string", operation: "isNotEmpty" }
              }
            ]
          }
        }
      },
      {
        id: "send_1", name: "Send WhatsApp", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2,
        position: [1000, 200],
        parameters: {
          method: "POST",
          url: "http://172.18.0.8:8085/message/sendText/catalogo",
          authentication: "none",
          sendHeaders: true,
          headerParameters: {
            parameters: [
              { name: "apikey", value: "EVO_KEY_HERE" }
            ]
          },
          sendBody: true,
          contentType: "json",
          bodyParameters: {
            parameters: [
              { name: "number", value: "={{ $json.phone }}" },
              { name: "textMessage", value: '={"text":"Hola! Soy ProVitamins Peru. Proteinas desde S/89, creatina desde S/49. Visita: https://calogojh.duckdns.org"}' }
            ]
          }
        }
      }
    ],
    connections: {
      "Webhook": {main: [[{node: "Get Phone", type: "main", index: 0}]]},
      "Get Phone": {main: [[{node: "Skip Own", type: "main", index: 0}]]},
      "Skip Own": {main: [[{node: "Send WhatsApp", type: "main", index: 0}], []]}
    }
  }, s => {
    console.log("Updated:", s);
  });
});
