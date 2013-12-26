var pg = require('pg');
var conString = "postgres://postgres@192.168.1.100:5432/yonder_trails";  //local install no pwd needed

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
          res.send({type: "feature",crs: crsobj, geometry: JSON.parse(result.geojson), properties:{"iso": req.params.id, "representation": "extent"}});
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
          res.send({type: "feature",crs: crsobj, geometry: JSON.parse(result.geojson), properties:{"iso": req.params.id, "representation": "extent"}});
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
          res.setHeader('Content-Type', 'application/json');
        }
      }); 
    query.on("end", function (result) {
        featureCollection = makeGeoJson(result);
        res.send(featureCollection);
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
        res.send(featureCollection);
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
    //for(j=0;j<result.rows[i].length;j++){
    var t = 0
    for (r in result.rows[i])
    {
      t=t+1
    }  
      feature.properties = {"CNT":result.rows[i].length,
                            "NAME":result.rows[i].name,
                            "ID":result.rows[i].ogc_fid,
                            "NUMBER":result.rows[i].rte_no,
                            "TYPE":result.rows[i].rte_type,
                            "MILES":result.rows[i].gis_miles,
                            "SOURCE":result.rows[i].datasource};
    //}
    featureCollection.features.push(feature);
  }  
  return featureCollection
}