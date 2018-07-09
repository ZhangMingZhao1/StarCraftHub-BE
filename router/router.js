var file = require("../models/file.js");
var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var sd = require("silly-datetime");
var qiniu =require("qiniu");
var se = require("../se.json")
//上传表单
exports.doPost = function (req,res) {
  var form = new formidable.IncomingForm();

      // "../"返回上一级
  form.uploadDir = path.normalize(__dirname + "/../tempup/");
  form.parse(req, function (err, fields, files,next) {
      console.log('fields',fields);
      console.log('files',files);
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