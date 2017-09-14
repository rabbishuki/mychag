var express = require('express'),
    app = express(),
    router = express.Router(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    sql = require('./Server/mysql.js');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static('public'));

app.use('/api/1.0/ads', router);

router.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});


// middleware to use for all requests
router.use(function (req, res, next) {

    // CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

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
    var location = req.query.location.split(',');
    var formatted_address = req.query.formatted_address || "";
    var radius = req.query.radius || 50.0;
    var limit = req.query.limit || 5;
    var type = req.query.type;

    if (location.length != 2) {
        res.send({
            message: 'כתובת מקור לא תקין'
        });
    } else {
        sql.q(sql.l(location[0], location[1], radius, limit, type), function (data) {
            if (data.error) {
                res.send({
                    message: 'שגיאה בהצגת נתונים'
                })
            } else {
                var ads = sql.f(data.results);
                res.json(ads);
            }
        });
    }
});

router.route('/newAd').post(function (req, res) {
    if (req.body.lastName) return res.json({
        message: 'GIS is better than LEV'
    });

    var object = {
        "type": req.body.type,
        "formatted_address": req.body.formatted_address,
        "lat": req.body.location.lat,
        "lng": req.body.location.lng,
        "date": req.body.date,
        "json": JSON.stringify({
            "title": req.body.title,
            "imgFile": req.body.imgFile,
            "outLink": req.body.outLink,
            "outLinkText": req.body.outLinkText,
            "name": req.body.name,
            "phone": req.body.phone,
            "email": req.body.email,
            "comment": req.body.comment,
            "moreInfo": req.body.moreInfo
        })
    };

    sql.q(sql.i('tb_events', [object]), function (data) {
        if (data.error) {
            res.send({
                message: 'שגיאה בשמירת נתונים'
            })
        } else {
            res.json({
                message: 'new ad created!',
                ad: [{
                    "type": req.body.type,
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
                    "moreInfo": req.body.moreInfo
                }]
            });
        }
    });
});

router.route('/unaprovedAds').post(function (req, res) {
    if (req.body.username !== process.env.auth_user &&
        req.body.password !== process.env.auth_pass) {
        return res.json({
            message: 'UnAuthorized Access'
        });
    } else {
        sql.q('SELECT * FROM tb_events WHERE approved = 0 AND active = 1', function (data) {
            if (data.error) {
                res.send({
                    message: 'שגיאה בהצגת נתונים'
                })
            } else {
                var ads = sql.f(data.results);
                res.json(ads);
            }
        });
    }
});

router.route('/approve/:id').post(function (req, res) {
    if (req.body.username !== process.env.auth_user &&
        req.body.password !== process.env.auth_pass) {
        return res.json({
            message: 'UnAuthorized Access'
        });
    } else {
        sql.q(sql.u(req.params.id, "approved", true), function (data) {
            if (data.error) {
                res.send({
                    message: 'שגיאה באישור האירוע'
                })
            } else {
                res.send({
                    message: 'האירוע אושר בהצלחה'
                })
            }
        });
    }
});

router.route('/delete/:id').post(function (req, res) {
    if (req.body.username !== process.env.auth_user &&
        req.body.password !== process.env.auth_pass) {
        return res.json({
            message: 'UnAuthorized Access'
        });
    } else {
        sql.q(sql.u(req.params.id, "active", false), function (data) {
            if (data.error) {
                res.send({
                    message: 'שגיאה באישור האירוע'
                })
            } else {
                res.send({
                    message: 'האירוע אושר בהצלחה'
                })
            }
        });
    }
});

var port = process.env.PORT || 770;

app.listen(port, function () {
    console.log('myChag(tm) is running on http://localhost:' + port);
});