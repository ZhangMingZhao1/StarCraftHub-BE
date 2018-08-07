var express = require('express');
var fs = require('fs');
var path = require('path');
var multipart = require('connect-multiparty');
var session = require("express-session");

var app = express();
var router = require("./router/router.js");

app.use(express.static("./public"));
app.use(express.static("./uploads"));
// 使用session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  // store:new FileStore(),
  // cookie: { maxAge: 5 * 60 * 1000 }////5分钟超时，两次请求的时间差 即超过这个时间再去访问 session就会失效
}))

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
app.post("/login",router.doLogin);



app.listen(3002); 