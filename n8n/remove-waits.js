const http = require("http");

function login(cb) {
  const data = JSON.stringify({emailOrLdapLoginId:"EMAIL_HERE",password:"PASSWORD_HERE"});
  const req = http.request({hostname:"localhost",port:5678,path:"/rest/login",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}}, res => {
    let body="";const cookie=res.headers["set-cookie"][0].split(";")[0];
    res.on("data",c=>body+=c);res.on("end",()=>cb(cookie));
  });req.write(data);req.end();
}

function get(cookie,path,cb){
  const req=http.request({hostname:"localhost",port:5678,path:path,method:"GET",headers:{"Cookie":cookie}},res=>{
    let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(JSON.parse(body)));
  });req.end();
}

function patch(cookie,path,payload,cb){
  const data=JSON.stringify(payload);
  const req=http.request({hostname:"localhost",port:5678,path:path,method:"PATCH",headers:{"Cookie":cookie,"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}},res=>{
    let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(res.statusCode));
  });req.write(data);req.end();
}

login(cookie => {
  const ids = ["wf_1","wf_2","wf_3","wf_4","wf_5","wf_6"];
  let i = 0;

  function next() {
    if (i >= ids.length) { console.log("\nDONE - All waits removed!"); return; }
    get(cookie, "/rest/workflows/" + ids[i], resp => {
      const wf = resp.data || resp;
      let changed = false;

      (wf.nodes || []).forEach(n => {
        // Remove wait/delay nodes by setting them to 0 seconds
        if (n.type === "n8n-nodes-base.wait") {
          if (n.parameters) {
            // Set wait to 1 second instead of minutes
            n.parameters.amount = 1;
            n.parameters.unit = "seconds";
            changed = true;
            console.log("  " + wf.name + " -> Wait '" + n.name + "' set to 1 second");
          }
        }
      });

      if (changed) {
        patch(cookie, "/rest/workflows/" + ids[i], { nodes: wf.nodes }, s => {
          console.log("  Updated: " + s);
          i++; next();
        });
      } else {
        i++; next();
      }
    });
  }
  next();
});
