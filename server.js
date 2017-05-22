var express = require('express'),
    app = express(),
    router = express.Router(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    var requestData = {
        Method: req.method,
        url: req.originalUrl,
        body: req.body
    };

    console.log('New Request.', requestData);
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/closestAd').get(function (req, res) {
    res.json({
        message: '0 results found',
        location: req.query.location,
        ads: []
    });
});

router.route('/newAd').post(function (req, res) {
    if(req.body.lastName) return res.json({ message: 'GIS is better than LEV' });
    res.json({
        message: 'new ad created!',
        ad: [{
            "location": req.body.location,
            "title": req.body.title,
            "date": req.body.date,
            "imgFile": req.body.imgFile,
            "outLink": req.body.outLink,
            "outLinkText": req.body.outLinkText,
            "name": req.body.name,
            "phone": req.body.phone,
            "email": req.body.email,
            "comment": req.body.comment,
        }]
    });
});

app.use('/api/1.0/ads', router);

var port = process.env.PORT || 770;

app.listen(port, function () {
    console.log('myChag(tm) is running on http://localhost:' + port);
});