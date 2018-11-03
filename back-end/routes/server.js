var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var moment = require('moment');
var session = require('express-session');
var jwt = require("jsonwebtoken");
var passport = require('passport');
var morgan = require("morgan");
var envs = require('envs');

var User     = require('../models/User');

var DB_NAME = 'NG';
var REQEST_DATA_COLLECTOIN_NAME = 'data';
var LOGIN_COLLECTOIN_NAME = 'login';
var PRODUCT_COLLECTOIN_NAME = 'product';

process.env['JWT_SECRET'] = 'e177920e88165bd0090b1c6b544cf7';
//db connect
mongoose.connect('mongodb://localhost:27017/'+DB_NAME);
var db = mongoose.connection;

//db connection check
db.on('error', function() { console.log('DB Connection Failed..'); });
db.once('open', function() { console.log('DB Connected..'); });

//schema
var data = new mongoose.Schema({
      id: 'string',
      link: 'string',
      comment: 'string',
      picture : 'string',
      time : 'string',
      ban : 'string'
});
var product = new mongoose.Schema({
      product_ID: 'string',
      product_name: 'string',
      comment: 'string',
      product_price : 'string',
      product_image : 'string'
});

module.exports = function(app, fs)
{

  // data
  app.set('environment', envs('NODE_ENV', 'production'));

  // body parser
  app.use(bodyParser.urlencoded({extended:false}));
  app.use(bodyParser.json());

  app.use(morgan("dev")); // 모든 요청을 console에 기록

  app.use(function(req, res, next) {
    //모든 도메인의 요청을 허용하지 않으면 웹브라우저에서 CORS 에러를 발생시킨다.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
  });


  //request data
  app.post('/datadd',function(req,res){
    // json format input
    var arr = JSON.stringify(req.body).replace(/\"/gi,"").replace("{","").replace("}","");
    arr = arr.replace("id:","").replace("link:","").replace("comment:","").replace("app:","");
    arr = arr.split(",");
    //compile data
    var date = moment().format("YYYY-MM-DD HH:mm:ss");
    var Data = mongoose.model(REQEST_DATA_COLLECTOIN_NAME, data);
    var newdata = new Data({id:arr[0], link:arr[1], comment:arr[2], picture:arr[3], time:date, ban:false});
    console.log(newdata);

    //save data
    newdata.save(function(error, data){
      if(error){
        console.log(error);
        res.send(true);
      }else{
        console.log('Data saved at '+REQEST_DATA_COLLECTOIN_NAME+'.');
        res.send(false);
      }
    });
  });
  app.post('/datlist',function(req,res){
      var Data = mongoose.model(REQEST_DATA_COLLECTOIN_NAME, data);
      Data.find({}, function(err, docs) {
          if (!err){
            arr = docs;
            fs.writeFileSync("data_lists.txt", '\ufeff' + arr, {encoding: 'utf8'});
            res.send(arr);
          } else {throw err;}
      });
      /*var data = new Data({
            id: 'string',
            link: 'string',
            comment: 'string',
            picture : 'string',
            time : 'string',
            ban : 'string'
      });
      Data.find().all(function(data) {
        sys.puts(data);
      });;*/
    })

  //product
  app.post('/proadd',function(req,res){
    // json format input
    var arr = JSON.stringify(req.body).replace(/\"/gi,"").replace("{","").replace("}","");
    arr = arr.replace("product_ID:","").replace("product_name:","").replace("product_price:","").replace("product_scription:","").replace("product_image:","");
    arr = arr.split(",");
    //compile data
    var Data = mongoose.model(PRODUCT_COLLECTOIN_NAME, product);
    var newdata = new Data({product_ID:arr[0], product_name:arr[1], product_price:arr[2], product_scription:arr[3], product_image:arr[4]});
    console.log(newdata);
    //save data
    newdata.save(function(error, data){
      if(error){
        console.log(error);
        res.send(true);
      }else{
        console.log('Data saved at '+PRODUCT_COLLECTOIN_NAME+'.');
        res.send(false);
      }
    });
  });
  app.post('/prolist',function(req,res){
    var Data = mongoose.model(PRODUCT_COLLECTOIN_NAME, product);
    Data.find({}, function(err, docs) {
        if (!err){
          arr = JSON.stringify(docs);
          res.send(arr);
        } else {throw err;}
    });
  });

  app.post('/auth', function(req, res) {
      User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
          if (err) {
              res.json({
                token: false,
                type: false
              });
          } else {
              if (user) {
                 res.json({
                    token: user.token,
                    type: true
                  });
              } else {
                  res.json({
                    token: false,
                    type: false
                  });
              }
          }
      });
  });
  app.post('/signin', function(req, res) {
      User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
          if (err) {
              res.json({
                  token: false,
                  type: false
              });
          } else {
              if (user) {
                  res.json({
                      token: false,
                      type: false
                  });
              } else {
                  var userModel = new User();
                  userModel.email = req.body.email;
                  userModel.password = req.body.password;
                  userModel.point = 300;
                  userModel.save(function(err, user) { // DB 저장 완료되면 콜백 함수 호출
                    user.token = jwt.sign(user.email, process.env.JWT_SECRET); // user 정보로부터 토큰 생성
                    console.log(user);
                    user.save(function(err, user1) {
                          res.json({
                              token: user1.token,
                              type: true
                          });
                      });
                  })
              }
          }
      });
  });

  app.get('/report', function(req, res){
      var Data = mongoose.model(REQEST_DATA_COLLECTOIN_NAME, data);
      var query;
      var value = JSON.stringify(req.body);

      switch (value) {
        case 'url':
          query = {};
          break;
        case 'capture':

          break;
        case 'recommand':

          break;
        case 'full':

          break;

        case 'time':

          break;
        case 'best':

          break;

        case 'ban':

          break;
        default:

          break;
      }
      Data.find(query, function(err, docs) {
          if (!err){
            arr = JSON.stringify(docs);
            console.log(arr[0]);
            fs.writeFileSync("data_lists.txt", '\ufeff' + arr, {encoding: 'utf8'});
            res.send(arr);
          } else {throw err;}
      });
  });
  function ensureAuthorized(req, res, next) {
      var bearerToken;
      var bearerHeader = req.headers["authorization"];
      if (typeof bearerHeader !== 'undefined') {
          var bearer = bearerHeader.split(" ");
          bearerToken = bearer[1];
          req.token = bearerToken;
          next(); // 다음 콜백함수 진행
      } else {
          res.send(403);
      }
  }

  process.on('uncaughtException', function(err) {
      console.log(err);
  });

  // list
  app.get('/list',function(req,res){
      res.render('index', {
         title: "MY HOMEPAGE",
         length: 5
      });
  })
}
