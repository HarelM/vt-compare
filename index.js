var VectorTile = require('@mapbox/vector-tile').VectorTile;
var Protobuf = require('pbf');
var https = require('https');
var zlib = require('zlib');

function getAllFeatures(data, x, y, z) {
    let features = [];
    var tile1 = new VectorTile(new Protobuf(data));
    for (let layerKey of Object.keys(tile1.layers)) {
        let layer = tile1.layers[layerKey];
        for (let i=0; i < layer.length; i++) {
            features.push(layer.feature(i).toGeoJSON(x, y, z));
        }
    }
    return features;
}

function getTileData(x, y, z, cb) {
    const options = {
        hostname: 'israelhiking.osm.org.il',
        port: 443,
        path: `/vector/data/IHM/${z}/${x}/${y}.pbf`,
        method: 'GET'
    };
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

// This is the main code:
getTileData(9787,6621,14, (data1) => {
    let features1 = getAllFeatures(data1, 9787,6621,14);
    getTileData(9787,6621,14, (data2) => {
        let features2 = getAllFeatures(data2, 9787,6621,14);
        let index = 0;
        for(let feature1 of features1) {
            let feature2 = features2[index];
            let str1 = JSON.stringify(feature1);
            let str2 = JSON.stringify(feature2);
            if (str1 != str2) {
                console.log(`diff at index: ${index}\n${str1}\n${str2}`);
                break;
            }
            index++;
        }
    });
})

