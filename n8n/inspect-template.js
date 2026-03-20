const http = require("http");
function login(cb){const data=JSON.stringify({emailOrLdapLoginId:"EMAIL_HERE",password:"PASSWORD_HERE"});const req=http.request({hostname:"localhost",port:5678,path:"/rest/login",method:"POST",headers:{"Content-Type":"application/json","Content-Length":data.length}},res=>{let body="";const cookie=res.headers["set-cookie"][0].split(";")[0];res.on("data",c=>body+=c);res.on("end",()=>cb(cookie));});req.write(data);req.end();}
function get(cookie,path,cb){const req=http.request({hostname:"localhost",port:5678,path:path,method:"GET",headers:{"Cookie":cookie}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(body));});req.end();}
function patch(cookie,path,payload,cb){const data=JSON.stringify(payload);const req=http.request({hostname:"localhost",port:5678,path:path,method:"PATCH",headers:{"Cookie":cookie,"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}},res=>{let body="";res.on("data",c=>body+=c);res.on("end",()=>cb(res.statusCode));});req.write(data);req.end();}

login(cookie => {
  // Desactivar todos excepto el template
  var ids = ['wf_1','wf_2','wf_3','wf_4','wf_5','wf_6','botfinal','botdebug','bot1','botultra','CrqBmhakbm4Z0Nt5','CP5uymoLRBFmGIDT'];
  ids.forEach(id => patch(cookie, '/rest/workflows/' + id, {active: false}, () => {}));

  setTimeout(() => {
    get(cookie, '/rest/workflows/igVpuK8Q90XP5qbS', body => {
      var wf = JSON.parse(body).data || JSON.parse(body);
      console.log("Name:", wf.name);
      console.log("Active:", wf.active);
      console.log("\nNodos:");
      (wf.nodes || []).forEach(n => {
        var credTypes = n.credentials ? Object.keys(n.credentials).join(",") : "none";
        console.log("  " + n.name + " | " + n.type + " | " + credTypes);
        // Show URL if httpRequest
        if (n.parameters && n.parameters.url) {
          console.log("    URL: " + n.parameters.url);
        }
        // Show webhook path
        if (n.parameters && n.parameters.path) {
          console.log("    Path: " + n.parameters.path);
        }
      });
    });
  }, 2000);
});
