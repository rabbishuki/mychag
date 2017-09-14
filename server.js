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
    res.sendFile(__dirname +'/public/index.html');
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
                var ads = data.results.map(function (ad) {
                    var json = {};
                    try {
                        json = JSON.parse(ad.json);
                    } catch (e) {
                        console.log(`Error parsing ad with id #${ad.id}`);
                    };

                    return {
                        id: ad.id,
                        date: ad.date,
                        title: json.title || '',
                        imgFile: json.imgFile || '',
                        comment: json.comment || '',
                        type: ad.type,
                        location: {
                            lat: ad.lat,
                            lng: ad.lng,
                            formatted_address: ad.formatted_address,
                            distance: ad.distance
                        },
                        userInfo: {
                            name: json.name || '',
                            phone: json.phone || '',
                            email: json.email || ''
                        },
                        out: {
                            Link: json.Link || '',
                            LinkText: json.LinkText || ''
                        }
                    }
                });

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
            "comment": req.body.comment
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
                }]
            });
        }
    });
});

var port = process.env.PORT || 770;

app.listen(port, function () {
    console.log('myChag(tm) is running on http://localhost:' + port);
});