var express = require("express");
var router = express.Router();
var path = require("path");
var fs = require("fs");
const multer = require("multer");
//var db = require("./db");
const sftpLib = require("./sftp");
const config = require("../config");
const swaggerUi = require('swagger-ui-express');
const upload = multer({ 
  dest: "uploads/"
});
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});



router.get('/example',function(re,res){
  const ex=`const myHeaders = new Headers();
myHeaders.append("apikey", "e1bd2282-f444-4893-b704-239d036110e4");

const formdata = new FormData();
formdata.append("deviceId", "db9ae2bc-7bde-4f5a-930a-6048e8f29f05");
formdata.append("image", fileInput.files[0], "/C:/Users/surajtripathi/Pictures/door-clamps-500x500.jpg");

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: formdata,
  redirect: "follow"
};

fetch("http://localhost:3000/uploader", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));`;

  res.send(ex);
})

router.post("/getfiles", upload.none(), function (req, res) {
  if(req.headers.apikey !== config.validUUID){
    return res.status(403).json({ message: "Provide Valid Apikey" });
  }

  const { deviceId} = req.body;
  /*db.query("SELECT * FROM `employees` WHERE `deviceId` = ?",[deviceId], function (err, result) {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (result && result.length > 0) {
      const employee = result[0];
      sftpLib.getFiles("/files", function (err, files) {
        if (err) {
          return res.status(400).json({ message: "Employee not found" });
        }
        if (files && files.length > 0) {
          res.send({ status: 1, data: files });
        } else {
          return res.status(200).json({ message: "No Files" });
        }
      });
    }
  });*/
});

router.post("/uploader", upload.single("image"), function (req, res) {
  if(req.headers.apikey !== config.validUUID){
    return res.status(403).json({ message: "Provide Valid Apikey" });
  }
  if(!req.file){
    return res.status(400).json({ message: "Not allowed only png jpg jpeg are allowed to upload" });

  }
  const fileTypes = /jpeg|jpg|png/;
  const extname = fileTypes.test(path.extname(req.file.originalname).toLowerCase());
  const mimeType = fileTypes.test(req.file.mimetype);
  if (!extname || !mimeType) {
    return res.status(400).json({ message: "Not allowed only png jpg jpeg are allowed to upload" });
  }
  const { deviceId} = req.body;
  /*db.query("SELECT * FROM `employees` WHERE `deviceId` = ?",[deviceId], function (err, result) {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (result && result.length > 0) {
      const employee = result[0];
      const fileName = `${new Date().toISOString().split('T')[0]}-${deviceId}-${employee.division}-${employee.employeeCode}.jpg`;
      const localPath = path.join(__dirname, "../uploads", req.file.filename);
      const remotePath = fileName;
      console.log(fileName);
      sftpLib.uploadChunkFile(`${remotePath}`, localPath, function (err, status) {
        fs.unlinkSync(localPath);
        if (err) {
          return res.status(400).json({ message: "Employee not found" });
        }
        return res.status(200).json({ message: "File Uploaded" });
      });
    }
  });*/
});

module.exports = router;
