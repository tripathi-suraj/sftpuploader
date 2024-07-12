var express = require("express");
var router = express.Router();
var path = require("path");
var fs = require("fs");
const multer = require("multer");
var database = require("./db");
const sftpLib = require("./sftp");
const config = require("../config");
const fileFilter = (req, file, cb) => {
  if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
      cb (null, true)
  } else {
      cb (null, false)
  }
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Generate a unique file name
  }
});
const upload = multer({ storage:storage ,fileFilter:fileFilter});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/getfiles", function (req, res) {
  if (req.headers.apikey !== config.validUUID) {
    return res.status(403).json({ message: "Provide Valid Apikey" });
  }
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
});

router.post("/report/incident", upload.single("image"), function (req, res) {
  if (req.headers.apikey !== config.validUUID) {
    return res.status(403).json({ message: "Provide Valid Apikey" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Please select image file" });
  }
  const { deviceId } = req.body;

  const fileTypes = /jpeg|jpg|png/;
  const extname = fileTypes.test(
    path.extname(req.file.originalname).toLowerCase()
  );
  const mimeType = fileTypes.test(req.file.mimetype);

  if (!deviceId) {
    return res
      .status(400)
      .json({ status: 0, message: "Please provide deviceid" });
  }

  if (!extname || !mimeType) {
    return res.status(400).json({
      status: 0,
      message: "Not allowed only png jpg jpeg are allowed to upload",
    });
  }

  database.getConnection(function (dberr, db) {
    if (dberr) {
      res.status(400).send({ status: 0, error: dberr });
    }
    db.query(
      "SELECT * FROM `employees` WHERE `deviceId` = ?",
      [deviceId],
      function (error, result) {
        db.end();
        if (error) {
          return res
            .status(400)
            .json({ status: 0, message: "Something wrong happends" });
        }
        if (result.length === 0) {
          return res.status(404).json({ message: "Employee not found" });
        }
        if (result && result.length > 0) {
          const employee = result[0];
          const RemoteFileName = `${new Date().getTime()}-${deviceId}-${
            employee.division
          }-${employee.employeeCode}${path.extname(req.file.originalname)}`;
          const localPath = path.join(__dirname,"../uploads",req.file.filename);
          sftpLib.uploadChunkFile(
            `${RemoteFileName}`,
            localPath,
            function (err, status) {
              console.log(localPath);
              fs.unlinkSync(localPath);
              if (err) {
                return res
                  .status(400)
                  .json({ status: 0, message: "Something wrong happends" });
              }
              return res
                .status(200)
                .json({ status: 1, message: "File Uploaded Successfully" });
            }
          );
        }
      }
    );
  });
});

module.exports = router;
