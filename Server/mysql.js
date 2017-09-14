var mysql = require('mysql'),
    pool = mysql.createPool({
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database
    });

function validate(string) {
    return pool.escape(string) || '';
}

function query(string, callback) {
   pool.getConnection(function (err, connection) {
        if(err) console.error(err);

        connection.query(string, function (error, results = [], fields = []) {
            connection.release();

            if (error) console.error(error);
            callback({
                error,
                results,
                fields
            });
        });
    });
}

function insertArray(table, array, duplicate) {
    // Validate Keys and Values.
    var keys = validate(Object.keys(array[0])),
        splitKeys = keys.split(/\s*'| |,\s*/).filter(Boolean),    
        values = array.map(value => validate(Object.keys(value).map(v => Array.isArray(value[v]) ? JSON.stringify(value[v]) : value[v])));
        //array.map(value => validate(Object.keys(value).map(v => value[v])));

    // Build request string.
    var request = [
        'INSERT INTO',
        table,
        '(',
        splitKeys,
        ') VALUES ',
        values.map(value => '(' + value + ')')
        // array.map(val => `( ${Object.values(val).map(v => v ? "'" + v + "'" : 'null').join(", ")})`)
    ];

    // Upsert.
    if (duplicate) {
        request.push('ON DUPLICATE KEY UPDATE',
            splitKeys.map((x, i) => x + '=VALUES(' + x + ')'))
    }

    return request.join(' ');
}

function location(lat, lng, radius, limit, type) {
    if (type) var typeText = 'AND z.type = ' + type;
    return `SELECT *
            FROM (
               SELECT z.id,
                      z.formatted_address,
                      z.lat, z.lng,
                      z.date, z.json, z.type,
                      z.active, z.approved,
                      p.radius,
                      p.distance_unit
                          * DEGREES(ACOS(COS(RADIANS(p.latpoint))
                          * COS(RADIANS(z.lat))
                          * COS(RADIANS(p.longpoint - z.lng))
                          + SIN(RADIANS(p.latpoint))
                          * SIN(RADIANS(z.lat)))) AS distance
               FROM tb_events AS z
               JOIN (   
                     SELECT  ${lat} AS latpoint,  ${lng} AS longpoint,
                             ${radius} AS radius,  111.045 AS distance_unit
                 ) AS p ON 1=1
               WHERE z.lat
                  BETWEEN p.latpoint  - (p.radius / p.distance_unit)
                      AND p.latpoint  + (p.radius / p.distance_unit)
                 AND z.lng
                  BETWEEN p.longpoint - (p.radius / (p.distance_unit * COS(RADIANS(p.latpoint))))
                      AND p.longpoint + (p.radius / (p.distance_unit * COS(RADIANS(p.latpoint))))
                 ${typeText}
            ) AS d
            WHERE approved = 1 AND active = 1
                 AND distance <= radius
            ORDER BY distance
            LIMIT ${limit}`;
}

function formatAdsForUser(ads) {
    return ads.map(function (ad) {
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
};

function update(id, col, value) {
    return `UPDATE tb_events SET ${col} = ${value} WHERE id = ${id}`;
}

module.exports = {
    v: validate,
    q: query,
    i: insertArray,
    l: location,
    f: formatAdsForUser,
    u: update,
};