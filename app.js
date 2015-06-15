var rest = require('restler');
var fs = require('fs');
var toMarkdown = require('to-markdown');

var url = 'http://127.0.0.1:8080/api/blog';

function xslash(str) {
  return str.replace(/\\/g, '').replace(/\<br[\s/]*\>/g, '\n\n');
}
function xtitle(str) {
  return str.replace(/[^A-Za-z0-9\s]/g, '').replace(/\s+/g, '-');
}

rest.get(url).on('complete', function(result) {
  if (result instanceof Error) {
    console.log('Error:', result.message);
    this.retry(5000); // try again after 5 sec
  } else {
    result.forEach(function(article) {
      article.topicTitle = xslash(article.topicTitle);
      article.topicDescription = xslash(article.topicDescription);
      var date = new Date(article.topicCreatedDate * 1000);// multiplied by 1000 so that the argument is in milliseconds, not seconds

      var ym = date.toISOString().substr(0, ('yyyy-mm').length );
      var md = toMarkdown(xslash(article.topicDescription));
      var fd = "./" + ym + "/";
      var fn = fd + date.getDay() + "-" + xtitle(article.topicTitle) + ".md";

      md = '# ' + article.topicTitle + '\n' + date.toISOString().substr(0, 'yyyy-mm-dd'.length) + '\n\n' + md;

      fs.exists(fd, function(exists) {
        if (!exists) {
          try {
            fs.mkdirSync(fd);
          }
          catch (e) {

          }
        }
        fs.writeFile(fn, md, function(err) {
          if(err) {
              return console.log('ERROR: ' + err);
          }
          console.log(fn);
        });
      });

    });
  }
});
