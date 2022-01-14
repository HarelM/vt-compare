var VectorTile = require('@mapbox/vector-tile').VectorTile;
var Protobuf = require('pbf');
var https = require('https');
var zlib = require('zlib');

const options1 = {
    hostname: 'israelhiking.osm.org.il',
    port: 443,
    path: '/vector/data/Contour/14/9786/6621.pbf',
    method: 'GET'
};

const options2 = {
    hostname: 'israelhiking.osm.org.il',
    port: 443,
    path: '/vector/data/Contour/14/9786/6621.pbf',
    method: 'GET'
};

function getAllFeatures(data) {
    let features = [];
    var tile1 = new VectorTile(new Protobuf(data));
    for (let layerKey of Object.keys(tile1.layers)) {
        let layer = tile1.layers[layerKey];
        for (let i=0; i < layer.length; i++) {
            features.push(layer.feature(i).toGeoJSON());
        }
    }
    return features;
}

function getTileData(options, cb) {
    const req = https.request(options, res => {
        res.on('data', data => {
            let isGzipped = data[0] === 0x1f && data[1] === 0x8b;
            if (isGzipped) {
                zlib.gunzip(data, function(err, buffer) {
                    cb(buffer);
                });
            } else {
                cb(data);
            }
        });
    });
    
    req.end();
}

// this is the main code:
getTileData(options1, (data1) => {
    var features1 = getAllFeatures(data1);
    getTileData(options2, (data2) => {
        var features2 = getAllFeatures(data2);
        console.log(features1);
        console.log(features2);
    });
})

