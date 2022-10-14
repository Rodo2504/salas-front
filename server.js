const express   = require('express');
const path      = require('path');

const app       = express();

app.use(express.static('./dist/front-reservacion'));

app.get('/*', function(req, res){
    res.sendFile(path.join(__dirname, '/dist/front-reservacion/index.html'));
});