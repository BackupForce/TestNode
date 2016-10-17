var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var sql = require('mssql');

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.query['mode']){
    console.log(req.query['mode']);
  }
  var objUser = {
    id: '123456',
    name: 'Inoku'
  }
  res.render('info/infouser', { objUsers:[objUser,objUser] });
});

router.post('/', function(req, res, next) {
  var sqlconfig = {
    user: 'sa',
    password: '123456',
    server: '192.168.0.114',
    database: 'TestDB',
    options:{}
  }
  sql.connect(sqlconfig).then(function(){
    //<editor-fold desc="SQL Query">
    new sql.Request()
        .input('devid', sql.NChar(2), '01')
        .query('select * from [TestDB].[dbo].[sys_devstatus]' +
            'WHERE devid = @devid')
        .then(function(recordset) {
          res.json(recordset[0]);
          next();
        })
        .catch(function(err) {
            console.log(err);
        });
    //</editor-fold>
  })
});

router.get('/:id/:name', function(req, res, next) {
  console.log(req);
  var objUser = {
    Number:  req.params.id,
    Name: req.params.name
  }
  res.render('info/infouser', { users:[objUser,objUser] });
});

module.exports = router;
