var jade = require('jade');
var fs = require('fs');
var util = require('util');

function read(fn, callback) {
    fs.readFile(fn, function (err, data) {
        if(err) {
            util.error('Failed to read file ' + fn + ': ');
            util.error(err);
        } else {
            callback(data);
        }
    });
}

var files = [
    'templates/index.jade',
    'templates/channel.jade',
    'templates/modoptions.jade'
];

var locals = {
    siteTitle: "CyTube"
};

files.forEach(function (f) {
    read(f, function (data) {
        util.print('Compiling ' + f + '\n');
        var html = jade.compile(data, {
            pretty: true,
            filename: f
        })(locals);

        var output = f.replace('templates/', 'bs3/')
                      .replace('.jade', '.html');
        fs.writeFile(output, html);
    });
});
