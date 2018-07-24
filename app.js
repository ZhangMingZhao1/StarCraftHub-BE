var express = require('express');
var fs = require('fs');
var path = require('path');
var multipart = require('connect-multiparty');
// var router = express.Router();

var app = express();
var router = require("./router/router.js");

app.use(express.static("./public"));
app.use(express.static("./uploads"));
// app.post('/upload',function(req,res) {
//   console.log(req,res);
//   res.send(200);
// });

// app.listen(3000);

/* GET App home page. */
// router.get('*', function (req, res) {
//   res.sendFile(path.resolve('./', 'index.html'));
// });

// router.post('/upload', multipart(), function (req, res) {
//   console.log("捕捉到");
//   //获得文件名
//   var filename = req.files.files.originalFilename || path.basename(req.files.files.path);

//   //复制文件到指定路径
//   var targetPath = './public/uploads/' + filename;

//   //复制文件流
//   fs.createReadStream(req.files.files.path).pipe(fs.createWriteStream(targetPath));

//   //响应ajax请求，告诉它图片传到哪了
//   res.json({ code: 200, data: { url: 'http://' + req.headers.host + '/public/uploads/' + filename } });
// });
app.all('/*', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers && req.headers.origin ? req.headers.origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Connection, User-Agent, Cookie, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  //post请求之前，会发送一个options的跨域请求
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next()
  }
})
app.post("/upload",router.doUpload);
app.get("/getat",router.doGetAT);
app.get("/getranklist",router.dogetranklist);
app.get("/getPostList",router.dogetPostList);
app.post("/post",router.doPost);
app.post("/register",router.doRegister);

app.listen(3002); 