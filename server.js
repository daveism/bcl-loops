var express = require('express');
    bcl = require('./routes/bcl');

var app = express();

app.get('/bcl/trail/:id/', bcl.trail);
app.get('/bcl/trail/:id',bcl.trail);
app.get('/bcl/trailsegment/:id/', bcl.trailSegment);
app.get('/bcl/trailsegment/:id',bcl.trailSegment); 
app.get('/bcl/loop/:nodeid/:distance', bcl.trail);
app.get('/bcl/loop/:nodeid/:distance/',bcl.loop);

app.listen(3000);
console.log('Listening on port 3000');