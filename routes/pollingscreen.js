/**
 * Created by Inoku on 2016/7/5.
 */
var express = require('express');
var router = express.Router();
var sql = require('mssql');
var url = require('url');

router.post('/', function (req, res, next) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var sqlconfig = {
        user: 'sa',
        password: '123456',
        server: '192.168.0.114',
        database: 'TestDB',
        options: {}
    }
    sql.connect(sqlconfig).then(function () {
        //<editor-fold desc="SQL Query">
        new sql.Request()
            .input('devid', sql.NChar(2), query.devid)
            .query('select * from [TestDB].[dbo].[sys_devstatus]' +
                'WHERE devid = @devid').then(function (recordset) {
            res.json(recordset[0]);
        }).catch(function (err) {
            console.log(err);
        });
        //</editor-fold>
    })
});
router.post('/:actions/:devid', function (req, res, next) {
    var objQuery = {
        Action: req.params.actions,
        DeviceID: req.params.devid
    }
    switch (objQuery.Action) {
        case 'checkflag':
            CheckFlag(res, objQuery);
            break;
        case 'getrender':
            GetRender(res, objQuery);
            break;
        default:
            next();
            break;
    }
});

function CheckFlag(res, objQuery) {
    //<editor-fold desc="SQL Query">
    new sql.Request()
        .input('id', sql.NChar(2), objQuery.DeviceID.trim())
        .query('select * from [SuntiumQA].[dbo].[info_ScreenDevice]' +
            'WHERE id = @id').then(function (recordset) {
        if (recordset.length > 0) {
            res.json(recordset[0]);
        }
        else {
            var nullObject = {};
            res.json(nullObject);
        }
    }).catch(function (err) {
        console.log(err);
    });
    //</editor-fold>
}
function GetRender(res, objQuery) {
    var infoWorkpiece = {};
    GetCMDMaster();
    function GetCMDMaster() {
        //<editor-fold desc="SQL Query">
        new sql.Request()
            .input('pkDev', sql.NChar(2), objQuery.DeviceID.trim())
            .query('SELECT TOP 1 * '+
                ' FROM [SuntiumQA].[dbo].[v_q_cmd]' +
                ' WHERE bValid = 1 AND pkDev = @pkDev' +
                ' ORDER BY dtQuery DESC')
            .then(function (recordset) {
                if (recordset.length > 0) {
                    var objCmdMaster = recordset[0];
                    infoWorkpiece.WorkpieceNum = objCmdMaster.pkRenan;
                    infoWorkpiece.Renen = objCmdMaster.pkRenan;
                    switch (objCmdMaster.iDisplayQty){
                        case 1:
                            infoWorkpiece.ColumnCount = 12;
                            infoWorkpiece.mode = 'big';
                            break;
                        case 2:
                            infoWorkpiece.ColumnCount = 6;
                            infoWorkpiece.mode = 'default';
                            break;
                        case 6:
                            infoWorkpiece.ColumnCount = 4;
                            infoWorkpiece.mode = 'default';

                            break;
                        case 12:
                            infoWorkpiece.ColumnCount = 3;
                            infoWorkpiece.mode = 'default';

                            break;
                        case 24:
                            infoWorkpiece.ColumnCount = 2;
                            infoWorkpiece.mode = 'default';
                            break;
                        case 120:
                            infoWorkpiece.ColumnCount = 1;
                            infoWorkpiece.mode = 'default';
                            break;
                        default:
                            infoWorkpiece.ColumnCount = 4;
                            infoWorkpiece.mode = 'default';
                            break;
                    }
                    infoWorkpiece.ImageQty = objCmdMaster.ImgQty;
                    infoWorkpiece.FlagIndex = objCmdMaster.flagIndex > objCmdMaster.ImageQty
                        ? objCmdMaster.ImageQty : objCmdMaster.flagIndex;
                    GetCMDDetail(objCmdMaster);
                }
                else {
                    res.json({});
                }
            })
            .catch(function (err) {
            console.log(err);
        });
        //</editor-fold>
    }
    function GetCMDDetail(cmdMaster) {
        //<editor-fold desc="SQL Query">
        new sql.Request()
            .input('pkParent', sql.NVarChar(50), cmdMaster.dtString)
            .query('SELECT * FROM [SuntiumQA].[dbo].[q_cmddetail]' +
                ' WHERE pkParent = @pkParent' )
            .then(function (recordset) {
                if (recordset.length > 0) {
                    infoWorkpiece.ObjImage = recordset;
                    ReSetCommand();
                }
                else {
                    res.json({});
                }
            })
            .catch(function (err) {
                console.log(err);
            });
        //</editor-fold>
    }
    function ReSetCommand() {
        //<editor-fold desc="SQL Query">
        new sql.Request()
            .input('id', sql.NChar(2), objQuery.DeviceID.trim())
            .query('UPDATE [SuntiumQA].[dbo].[info_ScreenDevice]' +
                ' SET [bStatusChange] = 0' +
                ' WHERE [id] = @id'
            )
            .then(function (recordset) {
                RenderHtml();
            })
            .catch(function (err) {
                console.log(err);
            });
        //</editor-fold>
    }
    function RenderHtml() {
        var Images = infoWorkpiece.ObjImage;
        var aryImages = [];
        for (var i = 0; i < Images.length; i++) {
            var tempImageObj = {
                Path: '/images/suntium/' + Images[i].pkImage + '.jpg',
                Description: '說明'
            }
            aryImages.push(tempImageObj);
        }
        infoWorkpiece.cmd = '';
        infoWorkpiece.ObjImage = aryImages;
        res.render('info/rsprender', infoWorkpiece);
    }
}

module.exports = router;
