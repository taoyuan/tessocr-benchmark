"use strict";

var fs = require('fs');
var tesseract = require('node-tesseract');
var tess = require('tessocr').tess();

// var file = __dirname + '/fixtures/eng.png';
var file = __dirname + '/fixtures/hello_world.jpg';
var data = fs.readFileSync(file);

var options = {
  psm: 6
};

exports.compare = {
  "tessocr with image file" : function (done) {
    tess.ocr(file, options, done);
  },
  "tessocr with image data" : function (done) {
    tess.ocr(data, options, done);
  },
  "node-tesseract with image file" : function (done) {
    tesseract.process(file, options, done);
  }
};
require("bench").runMain();
