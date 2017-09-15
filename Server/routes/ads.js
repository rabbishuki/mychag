var router = require('express')().Router(),
    sql = require('./../db/mysql.js');

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

router.route('/').post(function (req, res) {
    if (req.body.lastName) return res.json({
        message: 'GIS is better than LEV'
    });

    var object = {
        "type": Number.parseInt( req.body.type),
        "formatted_address": req.body.location.formatted_address,
        "lat": Number.parseFloat( req.body.location.lat),
        "lng":  Number.parseFloat( req.body.location.lng),
        "date": req.body.date,
        "json": JSON.stringify({
            "title": req.body.title,
            "moreInfo": req.body.moreInfo,
            "imgFile": req.body.imgFile,
            "comment": req.body.comment,
            "userInfo": req.body.userInfo,
            "out": req.body.out,
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
                    "moreInfo": req.body.moreInfo,
                    "date": req.body.date,
                    "imgFile": req.body.imgFile,

                    "outLink": req.body.out.outLink,
                    "outLinkText": req.body.out.outLinkText,
                    
                    "name": req.body.userInfo.name,
                    "phone": req.body.userInfo.phone,
                    "email": req.body.userInfo.email,
                    "comment": req.body.comment
                }]
            });
        }
    });
});

router.route('/allUnaproved').post(function (req, res) {
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
                    message: 'שגיאה באישור האירוע',
                    id : req.params.id
                });
            } else {
                res.send({
                    message: 'האירוע אושר בהצלחה',
                    id : req.params.id
                });
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
                    message: 'שגיאה באישור האירוע',
                    id : req.params.id
                });
            } else {
                res.send({
                    message: 'האירוע אושר בהצלחה',
                    id : req.params.id
                });
            }
        });
    }
});

module.exports = router;