const http = require("http");
function login(cb){const data=JSON.stringify({emailOrLdapLoginId:"EMAIL_HERE",password:"PASSWORD_HERE"});const req=http.request({hostname:"localhost",port:5678,path:"/rest/login",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}},res=>{let body="";const cookie=res.headers["set-cookie"][0].split(";")[0];res.on("data",c=>body+=c);res.on("end",()=>cb(cookie));});req.write(data);req.end();}
function get(cookie,path,cb){const req=http.request({hostname:"localhost",port:5678,path:path,method:"GET",headers:{"Cookie":cookie}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(JSON.parse(body)));});req.end();}
function patch(cookie,path,payload,cb){const data=JSON.stringify(payload);const req=http.request({hostname:"localhost",port:5678,path:path,method:"PATCH",headers:{"Cookie":cookie,"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(res.statusCode));});req.write(data);req.end();}

login(cookie => {
  get(cookie, "/rest/workflows/botfinal", resp => {
    const wf = resp.data || resp;
    const sendNode = wf.nodes.find(n => n.name === "Responder WhatsApp");
    if (sendNode) {
      // Use IP directa en vez de nombre de contenedor
      sendNode.parameters.url = "http://172.18.0.8:8085/message/sendText/catalogo";
      console.log("URL cambiada a:", sendNode.parameters.url);
      console.log("Body:", sendNode.parameters.jsonBody);

      patch(cookie, "/rest/workflows/botfinal", {nodes: wf.nodes}, s => {
        console.log("Updated:", s);

        // Test: enviar un mensaje de prueba directo
        setTimeout(() => {
          const testData = JSON.stringify({
            number: "51929751690",
            textMessage: {text: "TEST DESDE N8N: Si ves esto, el bot funciona!"}
          });
          const req = http.request({
            hostname: "172.18.0.8",
            port: 8085,
            path: "/message/sendText/catalogo",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": "EVO_KEY_HERE",
              "Content-Length": Buffer.byteLength(testData)
            }
          }, res => {
            let b = "";
            res.on("data", c => b += c);
            res.on("end", () => console.log("Test envío:", res.statusCode, b.substring(0, 100)));
          });
          req.write(testData);
          req.end();
        }, 1000);
      });
    }
  });
});
