/**
 * Created by Inoku on 2016/7/7.
 */
var express = require('express');
var router = express.Router();
var sql = require('mssql');

router.get('/', function (req, res, next) {
    res.render('info/SocketTest');
    //res.render('info/controller');
});



router.post('/:actions/:devid', function (req, res, next) {
    var objQuery = {
        Action: req.params.actions,
        DeviceID: req.params.devid
    }
    var temp = InsertCmd(res, objQuery);
    if(temp){
        console.log('Yes Return')
    }

});

function UpdateFlag(res, objQuery) {
    //<editor-fold desc="SQL Query">
    new sql.Request()
        .input('devid', sql.NChar(2), objQuery.DeviceID)
        .query(
            'UPDATE [TestDB].[dbo].[sys_devstatus]' +
            ' SET [flageChanged] = 1' +
            ' WHERE [devid] = @devid'
        )
        .then(function () {
            res.json(true);
        })
        .catch(function (err) {
            console.log(err);
        });
    //</editor-fold>
}

function InsertCmd(res, objQuery) {
    var dtNow = new Date();
    dtNow.setTime(dtNow.getTime() + (8*60*60*1000));
    //<editor-fold desc="SQL Query">
    new sql.Request()
        .input('devid', sql.NChar(2), objQuery.DeviceID)
        .input('dtQuery', sql.DateTime(), dtNow)
        .input('cmd', sql.NVarChar(50), objQuery.Action)
        .query(
            'INSERT INTO [TestDB].[dbo].[sys_cmdq]' +
            ' ([devid], [dtQuery], [cmd]) ' +
            ' VALUES (@devid, @dtQuery, @cmd)'
        )
        .then(function () {
            return true;
            // UpdateFlag(res, objQuery);
        })
        .catch(function (err) {
            console.log(err);
        });
    //</editor-fold>
}

module.exports = router;