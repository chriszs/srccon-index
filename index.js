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

        var resultArray = [];

        var result = 'SRCCON Index\n============\n\nThis is a quick experiment in automatically generating human-readable indexes for SRCCON transcripts using [term frequency–inverse document frequency](http://en.wikipedia.org/wiki/Tf%E2%80%93idf). Terms are sorted by relevance to a transcript when compared to the frequency with which they occur in all the transcripts. In other words, what was unique to that session? No, it isn\'t perfect.\n\nProblems? Want your name expunged? Create a GitHub issue or email me at chriszs@gmail.com.\n\n';

        contents.forEach(function (content,i) {
            result += ('\n\n## [' + files[i] + '](https://github.com/OpenNews/srccon-data/blob/master/2014/transcripts/' + files[i] + ')\n\n');

            var terms = tfidf.listTerms(i).slice(0,40);

            result += (_.pluck(terms,'term').join(', '));

            var obj = {
                name: files[i],
                terms: terms
            };

            resultArray.push(obj);

        });

        fs.writeFile('README.md', result, function (err) {
            console.log('readme written');
        });


        fs.writeFile('index.json', JSON.stringify({
            files:resultArray
        }), function (err) {
            console.log('JSON written');
        });
    });

});