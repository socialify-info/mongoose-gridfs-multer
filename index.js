'use strict';
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const _ = require("lodash");
const crypto = require('crypto');

// Empty function to avoid modifications in the Event Emmiter prototype
function Storage(options) {
  this.gridfs = _.get(options,"gridfs", undefined);
  this.options = options;
  if(_.isUndefined(this.gridfs)) {
    throw new Error("No mongoose-gridfs defined in options.  Cannot create MongooseGridfsMuter instance.");
  }
}
function getFilename(req, file, cb) {
  crypto.pseudoRandomBytes(16, function (err, raw) {
    cb(err, err ? undefined : raw.toString('hex'));
  });
}
//return only the original file name in metadata by default
function getMetadata(req, file, cb) {
  let md = _.pick(file,["originalname"]);
  cb(null, md);
}
util.inherits(Storage, EventEmitter);

_.assign(Storage.prototype, {
  _getFileName: function _getFileName(req, file, cb) {
    let fn = _.get(this,"options.filename", getFilename);
    fn(req, file, cb)
  },
  _getMetadata: function _getFileName(req, file, cb) {
    let fn = _.get(this,"options.metadata", getMetadata);
    fn(req, file, cb)
  },
  _handleFile: function _handleFile(req, file, cb) {
    const Attachment = this.gridfs.model;
    var that = this;
    this._getFileName(req,file,function(err, filename){
      if(err) {
        return cb(err);
      }
      that._getMetadata(req, file, function(err, metadata){
        if(err) {
          return cb(err);
        }
        Attachment.write({
          "filename": filename,
          "contentType": file.mimetype
        },
        req,
        function(err, savedFile) {
          if(err){
            return cb(err);
          }
          cb(null, {
            "filename": filename,
            "metadata": metadata,
            "id": savedFile._id,
            "grid": savedFile,
            "size": savedFile.size
          });
        });
      });
    });
  },
  _removeFile: function _removeFile(req, file, cb) {
    var self = this;
    const Attachment = this.gridfs.model;
    if (file.id) {
      Attachment.unlinkById(file.id, function(err, removedFile){
        if(err){
          return cb(err);
        }
        return cb(null);
      });
    } else {
      cb(null);
    }
  }
});


module.exports = Storage;
