var file = require("../models/file.js");
var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var sd = require("silly-datetime");

//上传表单
exports.doPost = function (req,res) {
  var form = new formidable.IncomingForm();

      // "../"返回上一级
  form.uploadDir = path.normalize(__dirname + "/../tempup/");
  form.parse(req, function (err, fields, files,next) {
      console.log(fields);
      console.log(files);
      //改名
      if(err) {
          next(); //这个中间件不受理这个请求了，往下走
          return;
      };

      //判断文件尺寸
      var size = parseInt(files.tupian.size);
      if(size > 2000000) {
           res.send("图片尺寸应该小于2M");

          //则删除这个文件
          fs.unlink("files.tupian.path",function () {

          });
          return;
      }
      var wenjianjia = fields.wenjianjia;
      var oldpath = files.tupian.path ;
      //还是加时间戳
      var ttt = sd.format(new Date(), "YYYMMDDHHmmss");
      var ran = parseInt(Math.random() * 89999 + 10000);
      var extname = path.extname(files.tupian.name);
      var newpath = path.normalize(__dirname + "/../uploads/" + wenjianjia + "/" + ttt + ran + extname);
      fs.rename(oldpath,newpath,function (err) {
          if(err) {
              res.send("改名失败");
              return;
          }
          res.send("成功");
      });
  });
}