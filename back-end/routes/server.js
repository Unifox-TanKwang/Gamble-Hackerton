var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var moment = require('moment');
var session = require('express-session');
var jwt = require("jsonwebtoken");
var passport = require('passport');
var morgan = require("morgan");
var envs = require('envs');
var http = require('http');
var fs = require('fs');
var ejs = require('ejs');
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
      product_price : 'string',
      product_scription: 'string',
      product_image : 'string'
});

module.exports = function(app, fs)
{

  // data
  app.set('environment', envs('NODE_ENV', 'production'));
  app.get('/logo', function(req, res){
    fs.readFile('./logo.png',function(err,data){
      res.writeHead(200, {'Comtemt-Type' : 'text/html'});
      res.end(data);
    });
  });
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
            fs.writeFileSync("data_lists.txt", '\ufeff' + docs, {encoding: 'utf8'});
            res.send(docs);
          } else {throw err;}
      });
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
          res.send("{\"data\":["+docs+"]}");
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

  app.post('/store', function(req, res){

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
  app.post('/barcode',function(req,res){
      res.send({image:"base64,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AJAyAgsAACBlBBYAAEDKCCwAAICUEVgAAAApI7AAAABSRmABAACkjMACAABIGYEFAACQMgILAAAgZQQWAABAyggsAACAlBFYAAAAKSOwAAAAUkZgAahN5s6de+21137++ef+MwD8n0Rg1T6rV68eN27cX//6179lGZJR8EfJ+/H2228fOXLksmXLfNBgr7/+evU4eWOKfrzlllvuu+++r776yhcoybRp03QLBw8ebGOa6lWIJj3yyCPff/+9L1CMd955Z9CgQTZO9phiP5rqf9F/hw4d+sEHH/jyYWbPnq1lbUVV4/2PqiHzfxT9/2233abt9vXXX/vypXrzzTcHDhxoYxpbhej/9eiMGjXq3//+t89dqldeeUUPgT1ApnoVRg/fAw888O233/oCpXrjjTe0DatXdOedd3bp0mXjjTe+7LLL7r77bluppurf3333XV8mwLPPPpu8g4n9KHk/in7U43XPPfd8/PHHPmK8BQsWaP/Je1CkatT8tYjmHDZs2GeffebLF+/JJ5+01VXLXsX/PGyDBz/++OM+d5G0Y+u+V48pNqz4z7l3Teu66667Pv30U18+2Pz587XdtLiNkz2m2I/iP1etSLvBokWLfPmUvP/++3o4tBPaWvJWqn+/9957ly5d6nMDWQis2kfn4Hbt2q211lrrZVk3o+CPkvfjOuus06xZs7feessHrckPP/wwffr0yZMnd+3atXqcvDFFP6699tqNGzcePnz41KlTlTK+fJhVq1a9+OKLOvmdeOKJuoU2eNVK/kf1Kszuu+8+evRozRx4Kvrxxx9fe+21KVOmXH755T5EZEz70VT/i/5bp06dPn36LF682MeKp3Z5+eWXX3jhhQsuuCB7EFPwR9H/6/5qu40YMaKoKFFOPfbYY7pT8kyViy++uHrTGVuF6P/16LRs2bLk88F3332nB0j5+7vf/a56TJP3o27Dtttu+/e//103KWS75dGDNXPmzJdeeql79+7ZI+uB0F34xS9+ofH1/zZJNthgg169ej399NOvvvqqD5GoW7duNe5g9qPk/Sj60R6v559/3keM0IXQrFmzdBeuvvrq9ddfP+9BkapR89cimnPDDTe86aabir1K0ZFBt0d1dcghh9jqquWtQtq2bas957nnnivqKuvtt9/Wjp13X2xA8Z9z75r+Z5NNNrn11lu1J4RH8MKFC9XQdevWzR6n+v/FfhT/uepftBv069dPx4R58+b5QGXTVtpss82qV1S1zpyVbrfddjqw+NxAFgKr9tFhdP/999c5pkxbb721Ts8+aE3mzp2700476Txhp7ca6ciog915550X/mLJf/7zHzXZNttsowV/+ctf+kCJ6tWr96tf/er222/XycxHiadwOf744zW4jom+fDF0Or/uuut0ztP2/+mnn3zQiAULFqhgdIIM3FB5tN10Fb5ixYqVK1dqg/igMTRD586d9aDoTlXTyc/HitG8efMSXk4wyoUdd9xR905978Mlst3g+uuvV5n5EGG0Z+6xxx5FbUY9rFrXAQccEBLcXbp08cXKoG5QoPiIEQqXI488UnehtP1NJ+9rrrlGe4L224T9rZqSdMKECUoB7Q8+RE00p+YfOXKklvVREulmqHdL27H19NGjo64NPCBcddVVNe7JBWm7aUVnnnlm+a+eiu7y/fffrzF99EI233xzlbQvAGQhsGofneAPPPBAf3KXQRdeyiYfNJFOqwcddJAvVoyNNtrooosu+vLLL32geDqQjRkzRud+X7IYjRo16t279w8//OBjxdABt127dr5MSZSkrVu3Pv3005csWeKDRrzzzjs77LCDL1CSpk2btmnTpmfPnjX+AlSBdcopp/hiwXbdddfSfv00efJkRY+PUgz7jV7gCc86e5999int/Crt27d/++23fbgY5557rs9dhoYNG+qm+ogRX3zxhWrPZy1J48aNtSeoBWt8vFRI6vImTZr4ksXQJY0uUUIaS0/Ss846yxcriZLu7LPPDul77f++TEm0opNPPrnYX+vn0a543333tWjRwgeNocNC4Oum+LkhsGqfNRxYL774Yjld0qBBAzWWTjY+XIzRo0e3atXKlyneFlts0a9fv+SThE7whx9+uC9QBgXQRx995INGvPvuuzUekUMceeSRNb5uoRPAaaed5gsEKy2wJk6cuO+++/oQxdNucOWVV4a80PjUU08dcsghvlhJVGYdOnRI/vX0mgms0i5L8ujxqvGdXsOGDSvt4sToUDBo0CAfK552yHPOOceXKZXSp2vXrjX+9lNF7guUat1111UOJjxVk+lgoq2qje/DxSOwEIfAqn3SCqyNNtpo9uzZPmghOsQ8++yzqfw68o9//OP8+fN93Fzff/+96mr33Xf3WUv1q1/9qn///gkH7rQCa7PNNuvTp48PGpFWYO2www46vie/LLdmAku7wbhx4/bcc09fvlT16tXr3bt38qsXTzzxRJl1VU2N9a9//UubyIfOlUpg/fKXv3z66ad9xIi0AmvzzTfXxcPy5ct93Fzaq++66y4Vks9dqkaNGg0ZMmTlypU+biGpBJbp3r37+++/7+MWUn5gmc6dO7/33ns+aJEOPfRQHyURgYU4BFbtExdYOvHvvffe++67r/5bo9atW59wwgkLFy70QQvRyal9+/Y+esROO+2k9vLh9t57n3320X91MvDJESNGjPBxcy1dunSvvfbymXKpmXRet5GrHXDAAVtssYXPkatu3bo6p/q4EdHAUsS0bdvWx83Q+CGXrTfeeGPBTIkG1s4775x3F0T/0rRpU58jRp06dbTREn7BGhdY66yzzi677KKA9p9zFRtY33zzTVz0rL/++r/5zW/y7t1+++3XuHFjnyNi0qRJPm4hHTt29PkKadKkSfa6lC9bbrmlTyukW7ducS9qFgysDTfcsGXLlm3atPEVJNKeeeSRRyacWaOBtf322xfcE0KKXBcPBdt03rx5cXW16aab6pnlq8nQ6urXr+9z5NLGTP4IngLrjDPO0JxrrbVWq1at9ED7oBFai6bq+WsjF/TXv/7Vxy3kD3/4g80W3cGy6XAnG2+8sc1c0LXXXuuDFuP1118PvKggsBCHwKp94gLr2GOP1YlTh3X9t0Y6WGvO5BdIdLSNe8lHJ+lp06bp3O/DffbZ559/rv/qoKmzVMG3qA8YMKDg+1t1M3Qs9ply6dCpXrGRq3311Vfnn3++z5Frgw02GD9+fNw5VYF12GGHabb11ltP5x6d7TTzihUrfNwMjf/aa6/pRGtjxtEgaiwfOotusP2ypl69ejqTaZznn38+7y6I/mXs2LE6pSW/nb9Ro0a6kT50hALrt7/9rWZTUWld6s4GDRroZNOhQwc9OnFbtdjA0nZTSfjCuRTZr7zySt69W7Zs2aWXXupzRCgZE97wfvLJJ/t8uXRGb9iwoZbNXpeeCLfddltcR0r37t2LCiydUOfOnasdwFdQiK4H7H+WLFmiXTfhl56aas9T7Sp6dLbddttHHnlEt18jVA8i+pepU6dqSyZ/bkCxMnjwYB86i/a3Zs2a+Uy5dEDQjcxel/5fqzvxxBN9jlzaf1588cWEX0xrkrpHt0SHhffee093MHvwbFqLpl588cUJbw/XAcHHLaR37956kupqZ86cOdkPeh6tRexzwT5uxHXXXeeDBtMRQJegvnxNCCzEIbBqn7jA0rnW50iDTpM6EBc8e6l74j6WrNt25513KnR81izbbLPNwIEDfb4sqq6436RoRQUTsEePHj5HrrXXXlvZdP/99/t8uRQKbdq00WzKrH/96186cMedfUXdoHOeDRtH5w+fO8v8+fN1TzX1tNNOmzVrVsK7rbX2p59+usY3Jt93332+QIQC64QTTtA8LVq0mDJlyuzZs/W46JZ/+OGHqoS2bdvaCHmKDSyt5bjjjvOFcyklCw519dVX+xy5VJPbbbfd8OHDNabPmst6MUrnsAkTJkTLTI/poEGD1o/53NxFF11UVGBp9wj/0GuNlAX20qx27+nTpyfvb3rgany9pOAvphcvXrzLLrv4HLnat2/vM+WK28hqFO1I//znP32+QrRrzZgxY8GCBf5zIuVXr1694j6scOutt/p8hXz88cd6kiof/edE2tv79+8f11h/+ctffL4wuoNxm7QgAgtxCKzaJy6w1ENx560SLFq0SAcOHzpXx44dfaZCdKqIe8W+e/fuPlOGDqA6CzZo0MDnyKK6Gj16dMHA0ulKJ4m4j4vH/UZAQ40bN+7mm29O+O6ibM8991zyu/v//Oc/+6xZli9fPnLkyBtuuCHwk9v/+Mc/El4tq1OnjmbwWQt54okn+vXrN3HiRP85Q92zzz77+Ci5igosnVAvu+yygnuCgkDxp8TxWbPMnDmzc+fOcS/OacBiA0slp7O1z5TrxRdf3HTTTX2+XMUGlna5otIz2apVqx5++GH7Wib/p0Q1vv8s+orp66+/3qVLl4JXQbqKUCoV3M7K+mOOOcbnixgyZIjPlwbtvdqHfehcyYFVLD1b69at60PnKjawHn30UV8yY/PNN+/Zs2fcOxkILMQhsGqfNRNYOtPstttuPnSuI488MuFC/5lnnin4Cpb86U9/8pkydKyPm/n8889PuOIfMWJE3G8fCv7mrjS9e/f2QQspGFjFWr169X/913/5iBE1BlacTz75RLngo+QqKrBefvnlgvkrZ511VsIDpDiOK+Drrruu2MDaYYcd4j4k8dhjj8UF/f9uYJVAe5TflEKiO/aoUaPiNvLVV1/tMxWioeLy95577vGZ0jBs2LC452m6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seAHzbKVGViLFi1K+L3DxhtvrO1T/ietHn/8cR+xEG2Tl156SYd1n7tIaQWWbsDLL78cN5SoRPPOLpdeemncV29UqzGw5OOPP9b+mfy+72rrrbde//79tasE3rVUAkvxp8fIRyyDIlUp6YNGaFecMGGCnvU+dxbVkhor7hJlnXXWOfroo7Un+NxV34J74oknxn2zQ7XwwEr4Crc8ypemTZvG/UHSGnXr1s0HCqANcvvtt/uSNRk5cmT0yb7NNtvoIOZzVCGwUAICq/bJCyyV0Nlnn60Dyi25Bg4cqANl9I0F1XR66Nq1a8HXSNZYYMl3332X3IsdO3bs0aOHTts9e/bUcbbGupJyAksbpHPnznGvkDVr1qy0d53nmTp1qu5XwdceRBtE51SftSRpBZY59thjfeFCjjvuOD00eoD0MF144YUJu1y15MCaO3euuurqq69WM8W9LSmPdldtz759++qW9OnTp+DfRc6WHVh6FH7729/eeeed/szJGDx48PXXXx+XL6JSOemkkwK/sj/O7NmzzzrrrLhPbKizk/e3JUuWJP9NJzVQ9dNHK0r+i4emEoFldthhB+0hV111VcIHPAsqKrBEj9rvf//7Xr161fgerOhXsSgEhw8fnle0BBZKQGDVPrpsbdWq1VZbbdW9e/fzzz//4osvfuONN3xarqVLl15++eWNGzf2I0GErpsfffRRnzvLmgyslStX6jya8FakEpQcWDpQdunSxUeJ0NkulS/vmTZtWocOHXzQiP3333/cuHE+a6lSDKzVq1cr1nfccUdfPg0JgaWdWd0fl54hFMdXXnll8n0844wztttuO+0n5513nk75cZ/5WLVq1U033WR/XDJOwh+LrJHVfNxzbeedd7777ruzf8cX9cUXX1xxxRVxn9crTXhg6XH0ZYpRt25d1V7cy+cFFfUrwmoqYB0k582b56NERD9Y8Jvf/OaOO+74T+SbOAgslIDAqn2++eYbXTgqStQQxicUonz505/+FPdGljp16vTr12/58uU+d8aaDCz5/vvvb7jhhpBXPgKVFlg64id8Y4IS8J40/orI3LlzE/7kXIsWLR577DGftQzpvoKlc7waK8UHKC6w3n333YS62nbbbXWn9sk48MAD4y4eNMI111yT8C6cq666qm/fvjpr1vgM0n3Xcy3hV3g9evTI/uaRcIsXL054BahR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bdeuXfQMUbdu3e7du8d97Wq1119/vVOnTnF9pv7Q1Wf5ryVoOyR8Dr/872pPlhxY6kufrzKefPLJo48+2teXRQ/ZWWedpVLx+bIkB1bCVyrMmzfvwgsvTPiL1HmBtXz58ptuuunss88eN25cchVlmz17tioqbp9JDqw5c+aceeaZPmvE7rvvvoZPxvfff3/BfUPb8M9//nONX31elBkzZpx22mlxqZ1iYL399tvateK+46NgYG2f6pcb5yGwIARWLTN37ly7Smvfvr2uNSdOnFjjSeKZZ56Jew+QkuuQQw4p+B4gndKuvPLKgt8QvdNOOylBCr6I9d5771166aXRw5zOrAcccMDDDz/s8+XStfuzzz4b923aeXRr4z7CVqdOnalTp/p8EatXr37ssceGDh2qA7EvEKETz6hRo3yBkqxYsWL06NEjRow48cQTfdCIww8/vKg+LoFuxv777+/ry6UzerEv6vz00096gALfK6b97cgjj/SVRcS9NKgTZIMGDXymXLvsskvC6UqrS/h2roMPPjgvznTlYC/Nas8fPHiwaiP594/y2muvJbx3ao899tDTIfo0VDro6albfu6558Z9g0CrVq20t/gCpdIz8fHHH9dlg/8c78cff9T2b9mypa8+V6NGjRK+9FyBMnbs2DvuuGPIkCG6X/6vibTdTj/99LjrOvnd734XDSxd26h99dDoqTp+/PiQCNbN1kZOWFG0sz/77DMd33QDugbo1q2bijwuyDbYYAM92TWPzaxbcs4556TyRypR2xFYtYwCK/tCf8cdd9Rp76233tIVdpROWqqWhM+v6crykUce8aEjdOAu+DqE6Fw4ZsyYBQsW+Jpmz9Zluv77hz/8weeISPji5pUrV3bq1EnJqD6zcQrSRefzzz/frFkzHzGidevWCd/4pzNEu3btfNZCVIGXXHKJNlrCbaj2yiuvLFmyxIfO8s4779T4q4cBAwYsXLhQN9XHiqHz0xtvvBH3tWHmww8/nDFjhi+QocdF2aGQ8vXl0s1TLWlj+twZWt2iRYt83FxqU52KdGLWltHJzBeI0KabOXNm9NuxqynN9Qj6oLk++OCDI444Iu6ryBo3bjxhwoToqnUvdL6PW2qjjTY6//zz/537B7OrA8toWTWQbrmPmEtr1GY57rjjfO5C4v560hdffJHwC2KjqxE9WHHP32qKJ/037nXHZcuW6XmqB0g7lXYYWyRKT65JkybFfdOEHHrooXHfAiUfffRR9XbbddddX3jhhYQ9QfdIUzt27GjzF7Thhhv26dMn+iUa6t3qb2lp3rz55MmTE54peuC0LmWczV9QvXr1/vjHPya8qyGEbmfcWrbeemvdEp8PyEJg1TIKrOy/PrvuuutuvvnmW221lY6bUXrmb7nllnEvm4tmSPjDLDozdenSpeB1ocpM17ta3NfUuLHdhrhfDtavX//+++/3cSN07LOrfA0Yd1/E7k7cO8natm2b/MtBBdbhhx/uc8fQ7U+4Adl0eij4Zm2d8lu0aOHDxdhss82S76lp2LDhtttum/B3CXVxf8EFF6y//vq+QIYG32KLLeJ+n6UNqKnZj51ow2p1cR/z/OGHHy688EItqznzFsxmk+K+vlL5m/AXRX788cfPPvvsqKOO8rlzRfc3o3/RrhX30oWqPfpuMzVEdnqqqnW1EHen7DFK+Ib0X/3qV3EveSqwEr4tzGy88cZadY17gp7j+q9S0ofO9fXXX3fo0EEP6zbbbGPzF6QVaZy439YpIrXr+oiFZL/RTbuWdpiEm61JErfdtM213XSZUfCVVAVWdaPbvpqwItt6cYUtmhT41TDJ+FM5KAGBVcvkBVY5Ntlkk5EjR+o04ENH6Pw9f/78uD8QEU4H0zvvvPPTTz/1cSO+++678847z+cuyX777fdaTV+mHBJYRdFlsQ+dJSSwipLwpUR6gE6K+erz0qhIfOhcqp+E1yZDqGlCvnrx1JL+eHCciy66yMfNkhdY5ahXr96tt966bNkyHzpXSGAVpV+/fj50LgVWwic2Qhx77LFvvfWWDxcj4ZMExdJlzODBg+N+M5sdWGVS4WmjlfaXIvMQWCgBgVXLpBVYTZo0Cfw89ocffpjwVZw12myzzf72t78lf99BmYF12GGHzZo1y8eKl3pgFfxS+3QDq06dOgnfI6/Aijvol+bss8/2oXPp4bv44ot9puLttddegW9JmTx5csJvtIty/PHH/+tf/4q+gyetwFp77bVvu+22hPdopx5YcV/wVmZgnXjiifPi33pVLcXAkoQ1phhYktYHdQkslIDAqmXmzJkT917gcE2bNo37dUNBn3zySWkvLWy++eb9+/f3UeKtWrWqU6dOvkyRdA6r8bUrQ2DVKCGwunbt6jMVad999y3qL1irsRL+HnYgNfeCBQt8xFyLFy8u//P5jRs3rvFPGqyxwFqxYkXCpwqSHXvssXEbKs8HH3yQ8PbHQGoR7bG6mkpY6VdffbXLLrv4AqXSkUeHrC5duqT17igCCyUgsGqZhQsX6tJ8t91200ko7u9CxFlvvfV23XXXPffcc9CgQcV+6Y6uX229OrX4cPHWWWednXbaSevq3bt38mtXZvXq1f369dMx0ZcPUL9+/d133/2QQw4J/OyhKLAOPfRQXz4NBf8mrgKr/PNQtXXXXffBBx/0oSMUWAnfRF8CnZB86Fw//fTTbbfdtmWhv/cXZ5NNNtEDpMJ49tlnfZRgTz311P7777/HHnsE/uXvatqFWrZsefTRRyf8wmvp0qU6U+6888577bVXsV81udZaa6me995777/85S817tgKrLZt2/qSaYi7VtG5/09/+lPcF1UUtMUWW+i5rCyr8TeD1T777LPTTz894QObCX75y19qU+sB7du3r448En1lsdo333xzzjnnxL2bs0a6emzduvVVV12lo0ryioqijRz3XNMhkcBCQQRWLaNDho50ixYt+vTTT4cPH96wYcM6depsGEAHAhXPSy+9tGTJktI+UPP5559rvbpw36CKjxthB9MpU6ZoZjWNL1wTXYWrsdZee+2EkavpLisF1JrRtzAnWLlyZfv27bVsyCqSaQRtz2uuucaHzvLee+/Zx+B91jIoiNWRY8aM8aEjdPKw3976AmVYf/31tboLLrjAh47Qae+OO+7QHQ/Z3zSaIubDDz/UXlrCGU6LaMH333/fPr7ngyaqV6+ebps64+OPP07+li+FkWbQBcMnn3zy0EMPNWrUSLfWR0mkO7711ls/8cQTWjBkx162bJm9Z9+XL0PdunX13+gfcDTaXF999dUll1yidYXs27q/f/zjH/X0LOrr0BTZerppfwvcXNX00CjNx40bp4cmZLvp7mjTXXTRRVpRUevSfdfz5YEHHtAhrtgvIqmRAkv3Pbrz66Fp3rx5yHdk4GeIwKrFvvzyS3WMjviTA/zzn/9M5atZFi9e/GQVHzdCK5o2bVrIC1d5dPieNGlSwsjVdJfnz5/viwXTTZo1a9bjjz8esopkGmHixIkFv5JRGffCCy88+uijPmsZHnvssaeeekqncx+6kNmzZ48fP94XKIM2qbZMwpdcyPLly3XHQ/Y3zfP222/7YmV44403JkyY4IMm0hpFSedLhtGDFf4M0vZ59tlno18rEOf777+fOXOm9hNfvgx2C1WcPnQhuu9aV+DT54MPPvDFiqTnXeDmqqb5n3nmmWIv6nQLtWBR69LMejRTTyujo4eea9oHfGUZWunUqVPzvmsNMAQWAABAyggsAACAlBFYAAAAKSOwAAAAUkZgAQAApIzAAgAASBmBBQAAkDICCwAAIGUEFgAAQMoILAAAgJQRWAAAACkjsAAAAFJGYAEAAKSMwAIAAEgZgQUAAJAyAgsAACBlBBYAAEDKCCwAAICUEVgAAAApI7AAAABSRmABAACkjMACAABIGYEFAACQMgILAAAgZQQWAABAyggsAACAlBFYAAAAKSOwAAAAUkZgAQAApIzAAgAASBmBBQAAkDICCwAAIGUEFgAAQMoILAAAgJQRWAAAACkjsAAAAFJGYAEAAKSMwAIAAEgZgQUAAJAyAgsAACBlBBYAAEDKCCwAAICUEVgAAAApI7AAAABSRmABAACkjMACAABIGYEFAACQMgILAAAgZQQWAABAyggsAACAlBFYAAAAKSOwAAAAUkZgAQAApIzAAgAASBmBBQAAkKr//u//Bwpll19mXcNUAAAAAElFTkSuQmCC"});
  })
  app.get('/admin', function(req,res){
      res.render('index');
  });
  app.get('/detail', function(req,res){
    var asdf = "보부장";
    var hello = fs.readFileSync('views/detail.ejs', 'utf-8');
    var hello2 = ejs.render(hello, {
      name: "보부장",
      date: "2018.11.04",
      URL:"abet777.com",
      content:"불법 스포츠 도박 사이트 광고 메시지가 왔습니다. 확인후 차단 부탁드려요."
    });
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(hello2);
      res.end();
  });
  app.get('/imgs', function(req,res){
    fs.readFile('report.png',function(error, data){
      res.writeHead(200, { 'Content-Type': 'text/html'});
      res.end(data);
    });
  });
}
