var file = require("../models/file.js");
var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var sd = require("silly-datetime");
var qiniu =require("qiniu");
var se = require("../se.json")
var axios = require("axios");
const moment = require('moment');
const db = require("../models/models.js");
//上传表单
exports.doUpload = function (req,res) {
  var form = new formidable.IncomingForm();

      // "../"返回上一级
  form.uploadDir = path.normalize(__dirname + "/../tempup/");
  form.parse(req, function (err, fields, files,next) {
      // console.log('fields',fields);
      // console.log('files',files);
      //改名
      if(err) {
          next(); //这个中间件不受理这个请求了，往下走
          return;
      };

      //判断文件尺寸
      let size = parseInt(files.file.size);
      if(size > 10000000) {
           res.send("图片尺寸应该小于10M");

          //则删除这个文件
          fs.unlink("files.path",function () {

          });
          return;
      }
      console.log(files.file.path);
      var oldpath = files.file.path ;
      //还是加时间戳
      var ttt = sd.format(new Date(), "YYYMMDDHHmmss");
      var ran = parseInt(Math.random() * 89999 + 10000);
      var extname = path.extname(files.file.name);
      var newpath = path.normalize(__dirname + "/../uploads/" + "/" + ttt + ran + extname);
      console.log(newpath);
      fs.rename(oldpath,newpath,function (err) {
          if(err) {
              res.send("改名失败");
              return;
          }
          res.send("成功");
      });
  });
}

//获取qiniuAT
exports.doGetAT = function(req,res) {
    var accessKey = se.accessKey;
    var secretKey = se.secretKey;
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var config = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_z2;
    var bucketManager = new qiniu.rs.BucketManager(mac, config);

    var options = {
        // prefix: 'images/',
      };
    var bucket = "lawlietimg";
    bucketManager.listPrefix(bucket, options, function(err, respBody, respInfo) {
        if (err) {
          console.log(err);
          throw err;
        }
        if (respInfo.statusCode == 200) {
          //如果这个nextMarker不为空，那么还有未列举完毕的文件列表，下次调用listPrefix的时候，
          //指定options里面的marker为这个值
          var nextMarker = respBody.marker;
          var commonPrefixes = respBody.commonPrefixes;
          console.log(nextMarker);
          console.log(commonPrefixes);
          var items = respBody.items;
          items.forEach(function(item) {
            
            console.log(item.key);
            
            // console.log(item.putTime);
            // console.log(item.hash);
            // console.log(item.fsize);
            // console.log(item.mimeType);
            // console.log(item.endUser);
            // console.log(item.type);
          });
        //   res.send("成功");
          res.setHeader("Access-Control-Allow-Origin", "*"); 
          res.json(items);
        } else {
          console.log(respInfo.statusCode);
          console.log(respBody);
          res.send("失败");
        }
      });
}

exports.dogetranklist = function(req, res) {
  let url = "https://wcs.starcraft2.com/en-us/search/standings?year=2017&circuit=korea&page=0&number=30";
  axios.get(url,{
    headers: {
      referer: "https://wcs.starcraft2.com/en-us/standings/",
      host: "wcs.starcraft2.com"
    }
  }).then(response => {
    res.setHeader("Access-Control-Allow-Origin", "*"); 
    res.json(response.data)  
    console.log("请求成功");
  }).catch((e)=> {
    console.log("error",e);
  });
}

exports.dogetPostList = function(req,res) {
  db.find("postlists",{},function(err,result) {
    if(err) {
      res.json({"OK":1});
    }
    res.json(result);
  })
}

exports.doPost = function(req,res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    //得到表单之后做的事情
    var content = fields.content;
    
    //现在可以证明，用户名没有被占用
    db.insertOne("posts", {
        "username": username,
        "datetime": new Date(),
        "content": content
    }, function (err, result) {

        // console.log(result);
        if (err) {
            res.send("-3"); //服务器错误
            console.log("错误");
            return;
        }
        res.send("1");
    })
  })
}

exports.doRegister = function(req,res) {
  console.log("doRegister")
  let form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    //得到表单之后做的事情
    let username = fields.username;
    let password = fields.password;
    console.log(fields);
    //现在可以证明，用户名没有被占用
    db.insertOne("users", {
        "username": username,
        "password": password,
        "registerDate": new Date()
    }, function (err, result) {

        // console.log(result);
        if (err) {
            res.send("500"); //服务器错误
            console.log("插入错误");
            return;
        }
        // console.log(result);
        res.send("200");
    })
  })
}

exports.doLogin = function(req,res) {
  console.log("doLogin");
  let form = new formidable.IncomingForm();
  let username,password;
  form.parse(req, function (err, fields, files) {
    //得到表单之后做的事情
    username = fields.username;
    password = fields.password;
    console.log(fields);
    //现在可以证明，用户名没有被占用
    db.find("users", {"username": username}, function (err, result) {
      //注意这个result是个数组
      if (err) {
          res.send("-5");
          return;
      }
      //没有这个人
      console.log(result.length);
      if (result.length == 0) {
          res.send("-1");
          return;
      }
      //有的话，进一步看看这个人的密码是否匹配
      req.session.username = username;
      req.session.login = "1";
      // console.log(req.session);
      if (password == result[0].password) {
          res.send("1"); //登陆成功
          return;
      } else {
          res.send("-2"); //密码错误
          return;
      }
  })
});
}


