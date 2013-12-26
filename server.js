var express = require('express');
    geo = require('./routes/bcl');

var app = express();

app.get('/bcl/trail/:id/', geo.trail);
app.get('/bcl/trail/:id',geo.trail);
app.get('/bcl/trailsegment/:id/', geo.trailSegment);
app.get('/bcl/trailsegment/:id',geo.trailSegment); 

app.listen(3000);
console.log('Listening on port 3000');