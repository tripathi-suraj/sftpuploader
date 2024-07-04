const Client = require('ssh2-sftp-client');
const sftp = new Client();
var config=require('../config');
var fs=require('fs');

var sftpLib={
    uploadChunkFile:function(remotefile,localfile,cb){
        sftp.connect({
            host: config.sftp.host,
            port: config.sftp.port,
            username: config.sftp.username,
            password: config.sftp.password
          }).then(() => {
            return sftp.fastPut(localfile,`${config.sftp.remoteDir}/${remotefile}`);
          }).then(data => {
            sftp.end();
            cb(null,1);
          }).catch((e)=>{
            cb(null,e);
          })
    },
    getFiles:function(remoteLocation,cb){
        sftp.connect({
            host: config.sftp.host,
            port: config.sftp.port,
            username: config.sftp.username,
            password: config.sftp.password
        }).then(()=>{
            return sftp.list(remoteLocation);
        }).then((data)=>{
            sftp.end();
            cb(null,data);
        }).catch((err)=>{
            return cb(null,err);
        });
    }
}


module.exports=sftpLib;