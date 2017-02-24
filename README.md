A multer StorageEngine utilizing a mongoose-gridfs instance.

Example use:
```
const multer = require("multer");
const mongoose = require("mongoose");
const gridMulter = require("mongoose-gridfs-multer");

//mongoose connect
mongoose.connect('mongodb://localhost/test');

//instantiate mongoose-gridfs
const gridfs = require('mongoose-gridfs')({
  collection:'attachments',
  model:'Attachment'
});

const gridStorage = new gridMulter({
  "gridfs": gridfs,
  "filename": function(req,file, cb){ ... },
  "metadata": function(req, file, cb){ ... }
});

const uploadMiddleware = multer({
  "storage": gridStorage
});
```
#### options
- gridfs - mongoose-gridfs instance
- filename - function to return filename to be stored in the gridfs - defaults to a sudo-random filename
- metdata - function to return metadata to be stored with the gridfs record

Both filename and metadata take the standard multer parameters: req, file, cb
- req: HTTP request
- file: The multer produced filestream
- cb: The callback for multer
