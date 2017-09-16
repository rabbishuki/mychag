const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      cookieParser = require('cookie-parser');
const ads = require('./Server/routes/ads.js');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static('public'));

app.use('/api/1.0/ads', ads);

var port = process.env.PORT || 770;

app.listen(port, function () {
    console.log('myChag(tm) is running on http://localhost:' + port);
});
