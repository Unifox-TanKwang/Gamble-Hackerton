var app = require('express')();
var fs = require('fs');
var router = require('./routes/server.js')(app, fs);


var port = process.env.PORT || 3389;
var ip = '0.0.0.0';

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.listen(port, ip, function(){
  console.log("Server is running on port."+port);
});
