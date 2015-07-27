var path      = require('path'),
  express     = require('express'),
  bodyParser  = require('body-parser'),
  fs          = require('fs'),
  app         = express(),
  serverUrl   = 'localhost',
  port        = 3000;

function getDirectories (srcpath) {
  return fs.readdirSync(srcpath).filter(function (file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/data/get/folders', function (req, res) {
  var directories = getDirectories(path.join(__dirname, 'edm_modules'));
  res.status(200).json(directories);
  res.end();
});

app.get('*', function (req, res) {
  var date = new Date();
  var html = '<p>404 - Sorry, but the page you are looking for has not been found. Time now: ' + date + ' </p>';
  res.end(html);
});

app.post('/data/post/folder', function (req, res) {
  var folder = req.body.folder;
  fs.readFile(path.join(__dirname, 'edm_modules', folder, 'i18n.json'), 'utf8', function (err, content) {
    if (err) throw err;
    res.end(content);
  });
});

app.post('/data/post/save', function (req, res) {
  var module = req.body.module;
  var lang = req.body.lang;
  var content = req.body.content;
  var filePath = path.join(__dirname, 'edm_modules', module, 'i18n.json');
  
  fs.readFile(filePath, 'utf8', function (err, fileContent) {
    if (err) throw err;
    var i18n = JSON.parse(fileContent);
    i18n[lang] = content;
    fs.writeFile(filePath, JSON.stringify(i18n), function (err) {
      if (err) throw err;
    });
  });
});

app.listen(port, function () {
  console.log('Listening @ http://' + serverUrl + ':' + port + '/');
});
