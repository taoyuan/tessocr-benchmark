'use strict';

var debug = require('debug')('tb:race');
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var tesseract = require('node-tesseract');
var tess = require('tessocr').tess();

race.describe = ['race [image]', 'Begin a racing test, default race `default`'];
race.options = {
  lang: {
    alias: 'l',
    describe: 'language'
  },
  psm: {
    default: 3,
    describe: 'psm'
  }
};

function race(__, options) {
  debug(options);
  var image = options.image ? path.resolve(options.image) : path.join(__dirname, '..', '..', 'fixtures', 'receipt.png');
  run(image, options);
}

function run(image, options) {
  var data = fs.readFileSync(image);

  suite
    .add('tessocr-file', {
      defer: true,
      fn: function (deferred) {
        tess.ocr(image, options, function () {
          deferred.resolve();
        });
      }
    })
    .add('tessocr-buffer', {
      defer: true,
      fn: function (deferred) {
        tess.ocr(data, options, function () {
          deferred.resolve();
        });
      }
    })
    .add('tesseract', {
      defer: true,
      fn: function (deferred) {
        var command = ['tesseract', image];
        if (options.l) {
          command.push('-l ' + options.l);
        }
        if (options.psm) {
          command.push('-psm ' + options.psm);
        }
        command.push(path.basename(image, path.extname(image)));
        exec(command.join(' '), function () {
          deferred.resolve();
        });
      }
    })
    .add('node-tesseract', {
      defer: true,
      fn: function (deferred) {
        tesseract.process(image, options, function () {
          deferred.resolve();
        });
      }
    })
    // add listeners
    .on('cycle', function(event) {
      console.log(String(event.target));
    })
    .on('complete', function() {
      console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run();
}

module.exports = race;
