var pg = require('pg');
var conString = "postgres://postgres@192.168.1.103:5432/yonder_trails";  //local install no pwd needed

exports.bbox = function(req, res) {
    var client = new pg.Client(conString);
    client.connect();
    var crsobj = {"type": "name","properties": {"name": "urn:ogc:def:crs:EPSG:6.3:4326"}};
    var idformat = "'" + req.params.id + "'";
    idformat = idformat.toUpperCase();  
    var query = client.query("select st_asgeojson(st_envelope(the_geom)) as geojson from yonder_trails where ogc_fid = " + idformat + ";"); 
    var retval = "no data";
    query.on('row', function(result) {
        //console.log(result);
        client.end();
    
        if (!result) {
          return res.send('No data found');
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.json({type: "feature",crs: crsobj, geometry: JSON.parse(result.geojson), properties:{"iso": req.params.id, "representation": "extent"}});
        }
      }); 
    
};

exports.bboxSrid = function(req, res) {
    var client = new pg.Client(conString);
    client.connect();
    var crsobj = {"type": "name","properties": {"name": "urn:ogc:def:crs:EPSG:6.3:" + req.params.srid}};
    var idformat = "'" + req.params.id + "'";
    idformat = idformat.toUpperCase();  
    var query = client.query("select st_asgeojson(st_envelope(st_transform(the_geom, " + req.params.srid + "))) as geojson from yonder_trails where ogc_fid = " + idformat + ";"); 
    var retval = "no data";
    query.on('row', function(result) {
        //console.log(result);
         client.end();
   
        if (!result) {
          return res.send('No data found');
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.json({type: "feature",crs: crsobj, geometry: JSON.parse(result.geojson), properties:{"iso": req.params.id, "representation": "extent"}});
        }
      }); 
};

exports.getLoop = function(req, res) {
    var client = new pg.Client(conString);
    client.connect();
    var crsobj = {"type": "name","properties": {"name": "urn:ogc:def:crs:EPSG:6.3:4326"}};
    var nodeformat = "'" + req.params.nodeid + "'";
    var distanceformat = "'" + req.params.distance + "'";

    nodeformat = nodeformat.toUpperCase(); 
    distanceformat = distanceformat.toUpperCase(); 
    
    var query = client.query("select st_asgeojson(the_geom) as geojson,seq,pass,node,edge,cost,end_node from yonder_getloops(" + nodeformat.toString() + "," + distanceformat.toString() + ")")

    var retval = "no data";

    query.on('error', function(err){
      if(err) {
        console.error('error running query', err);
        //es.setHeader('Content-Type', 'application/json');
        res.json(500, { error: 'error with loop' })
        client.end(); 
        return 
      }
    });

    query.on('row', function(row,result,err) {


        result.addRow(row);
        if (!result) {
          return res.send('No data found');
        } else {
          res.setHeader('Content-Type', 'application/json');
        }
      }); 

    query.on("end", function (result) {
      if (!result) {
         console.log('No data found');
         return
      } else {      


        res.json(200,featureCollection);
        client.end();
      }
    });

  };


exports.trail = function(req, res) {
    //TODO: Flesh this out. Logic will be similar to bounding box.
    var client = new pg.Client(conString);
    client.connect();
    var crsobj = {"type": "name","properties": {"name": "urn:ogc:def:crs:EPSG:6.3:4326"}};
    var idformat = "'TR" + req.params.id + "'";
    idformat = idformat.toUpperCase();  
    var query = client.query("select st_asgeojson(the_geom) as geojson,ogc_fid,rte_no,rte_type,name,gis_miles,datasource from yonder_trails where rte_no = " + idformat.toString() + ";"); 
    var retval = "no data";
    query.on('row', function(row,result) {
        result.addRow(row);
        if (!result) {
          return res.send('No data found');
        } else {
          //res.setHeader('Content-Type', 'application/json');
        }
      }); 
    query.on("end", function (result) {
        featureCollection = makeGeoJson(result);
        res.jsonp(featureCollection);
        client.end();
    });
  };

exports.trailSegment = function(req, res) {
    var client = new pg.Client(conString);
    client.connect();
    var crsobj = {"type": "name","properties": {"name": "urn:ogc:def:crs:EPSG:6.3:4326"}};
    var idformat = "'" + req.params.id + "'";
    idformat = idformat.toUpperCase();  
    var query = client.query("select st_asgeojson(the_geom) as geojson,ogc_fid,rte_no,rte_type,name,gis_miles,datasource from yonder_trails where ogc_fid = " + idformat + ";"); 
    var retval = "no data";
    query.on('row', function(row,result) {
        result.addRow(row);
        if (!result) {
          return res.send('No data found');
        } else {
          res.setHeader('Content-Type', 'application/json');
        }
      }); 
    query.on("end", function (result) {
        featureCollection = makeGeoJson(result);
        res.json(featureCollection);
        client.end();
    });
  };

function FeatureCollection(){
    this.type = 'FeatureCollection';
    this.features = new Array();
}

function Feature(){
    this.type = 'Feature';
    this.geometry = new Object;
    this.properties = new Object;
} 

function makeGeoJson(result){
  var featureCollection = new FeatureCollection();
  for(i=0; i<result.rows.length; i++){
    var feature = new Feature();
    feature.geometry = JSON.parse(result.rows[i].geojson);
    theRow = result.rows[i];

    for (k in theRow){
      if(k  !=  'geojson' ){
        feature.properties[k]=theRow[k];
      }
    }  

    featureCollection.features.push(feature);
  }  
  return featureCollection
}