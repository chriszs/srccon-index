var fs = require('fs'),
    natural = require('natural'),
    _ = require('lodash'),
    queue = require('queue-async');

var TfIdf = natural.TfIdf;
var tfidf = new TfIdf();
var tokenizer = new natural.WordTokenizer();

var basePath = '../srccon-data/2014/transcripts/';

fs.readdir(basePath, function (err,files) {

    var q = queue(1);

    files.forEach(function (file) {
        q.defer(fs.readFile,basePath + file,{ encoding: 'utf8' });
    });

    q.awaitAll(function (err,contents) {
        contents.forEach(function (content) {
            tfidf.addDocument(content);
        });

        var result = 'SRCCON Index\n============\n\nThis is a quick experiment in automatically generating human-readable indexes for SRCCON transcripts using [term frequency–inverse document frequency](http://en.wikipedia.org/wiki/Tf%E2%80%93idf).';

        contents.forEach(function (content,i) {
            result += ('\n\n ## [' + files[i] + '](https://github.com/ryanpitts/srccon-data/blob/master/2014/transcripts/' + files[i] + ')\n\n');

            result += (_.pluck(tfidf.listTerms(i).slice(0,40),'term').join(', '));
        });

        fs.writeFile('README.md', result, function (err) {
            console.log('written');
        });
    });

});