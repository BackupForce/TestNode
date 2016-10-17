/**
 * Created by Inoku on 2016/6/10.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var sql = require('mssql');

/* GET users listing. */
router.get('/', function(req, res, next) {
    var sqlconfig = {
        user: 'sa',
        password: '123456',
        server: '192.168.0.114',
        database: 'PurchaseSalesStock',
        options:{}
    }
    sql.connect(sqlconfig).then(function(){
        //<editor-fold desc="SQL Query">
        new sql.Request()
            .input('Number', sql.NVarChar(50), '0010100')
            .query('select * from [PurchaseSalesStock].[dbo].[Info_Product] ' +
                'WHERE Number = @Number')
            .then(function(recordset) {
                //console.dir(recordset);
            })
            .catch(function(err) {
                console.log(err);
            });
        //</editor-fold>
        //<editor-fold desc="SQL Procedure">
        var request = new sql.Request();
        request.verbose = true;//偷懶用,不用加註資料型別
        request.input('Number', sql.NVarChar(30), '%%');
        request.execute('dbo.TestPro', function(err, recordsets, returnValue, affected) {
            res.json({ user: recordsets[0] });
        });
        //</editor-fold>
    })
});

module.exports = router;



