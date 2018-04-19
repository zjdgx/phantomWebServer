var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var compression = require('compression');
var phantom = require('phantom');
var userAgent = {
  'iphone5': {
    'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
    'size': {width: 320, height: 568}
  },
  'iphone6': {
    'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12A366 Safari/600.1.4',
    'size': {width: 375, height: 667}
  },
  'iphone6s': {
    'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12A366 Safari/600.1.4',
    'size': {width: 414, height: 736}
  }
}

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(compression());

app.use(express.static(__dirname + '/public/'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.render('index');
});

app.post('/img', function (req, res) {
  var address = req.body.url,
        _page = null,
        iPhone = req.body.phone,
        selector = req.body.selector,
        instance = null,
        filename = new Date().getTime();

  phantom.create().then(function (ph) {
    instance = ph;
    return ph.createPage();
  }).then(function (page) {
    _page = page;

    if (iPhone && iPhone.length) {
      page.property('customHeaders',{
        'User-Agent': userAgent[iPhone]['ua']
      });
      page.property('viewportSize', {
        width: userAgent[iPhone]['size']['width'],
        height: userAgent[iPhone]['size']['height']
      })
    } else {
      page.property('viewportSize', {
        width: 1440,
        height: 900
      })
    }
    return _page.open(address);
  }).then(function (status) {
    //http://cn.dealmoon.com/guide/193
    console.timeEnd('page open');
    console.time('evaluate');
    _page.evaluate(function (s) {
      return document.querySelector(s).getBoundingClientRect();
    }, selector).then(function (c) {
      console.log('size:' + JSON.stringify(c));
      console.timeEnd('evaluate');
      c && _page.property('clipRect', {
        top:    c.top,
        left:   c.left,
        width:  c.width,
        height: c.height
      });

      setTimeout(function () {
        console.time('render page');
        _page.render('./public/cutImages/' + filename + '.png');
        instance.exit();
        console.timeEnd('render page');
        res.send(JSON.stringify({'url':'/cutImages/' + filename + '.png'}));
      }, 200);
    }, function () {
      console.time('reject');
      _page.render('./public/' + filename + '.png');
      instance.exit();
      console.timeEnd('reject');
      res.send(JSON.stringify({'url':'/cutImages/' + filename + '.png'}));
    });
  }).catch(function (e) {
    console.log(e);
    res.send(JSON.stringify({'error': 'capture failed.'}));
  });
});

app.listen(8010, function() {
  console.log('server is running at 8010...');
});
