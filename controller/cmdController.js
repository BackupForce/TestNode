/**
 * Created by Inoku on 2016/7/16.
 */
var express = require('express');
var router = express.Router();
var sql = require('mssql');

router.get('/', function (req, res, next) {
    res.render('info/controller');
});

router.get('/:actions', function (req, res, next) {
    res.render('info/SocketTest');
});

router.get('/:actions/:do', function (req, res, next) {
    res.render('mobile/RemoteControl');
});

router.post('/:groupid/:modeid/:actions', function (req, res, next) {
    var objQuery = {
        GroupID: req.params.groupid,
        ModeID: req.params.modeid,
        Action: req.params.actions,
    }
    var objRsp = {
        Mode: true,
        Info: '',
        Data: ''
    }
    GetGroup();
    function GetGroup() {
        //<editor-fold desc="SQL Query">
        new sql.Request()
            .input('id', sql.NChar(2), objQuery.GroupID)
            .query('SELECT * FROM [SuntiumQA].[dbo].[vinfo_Group] WHERE id = @id')
            .then(function (records) {
                if(records.length > 0){
                    var infoGroup = records[0];
                    if(infoGroup.modeDisplay == null){
                        //GetLastRenon
                    }
                    else {
                        if(objQuery.ModeID == infoGroup.modeDisplay){
                            switch (objQuery.Action){
                                case 'forward':
                                    DoForward(infoGroup);
                                    break;
                                case 'backward':
                                    DoBackward(infoGroup);
                                    break;
                                case 'next':
                                    DoNext(infoGroup);
                                    break;
                                case 'previous':
                                    DoPrevious(infoGroup);
                                    break;
                                default:
                                    break;
                            }
                        }
                        else{

                        }
                    }
                }
                else {
                    objRsp.Mode = false;
                    objRsp.Info = 'Group ID is not exist.';
                    res.json(objRsp);
                }
            })
            .catch(function (err) {
                console.log(err);
            });
        //</editor-fold>
    }

    function DoForward(infoGroup){
        if(infoGroup.flagIndex < infoGroup.ImgQty -1){
            var pkRenan = infoGroup.pkM;
            GetRenanImg(pkRenan);
        }
        else {
            objRsp.Mode = false;
            objRsp.Info = 'be at an end of this lot.';
            res.json(objRsp);
        }
        function GetRenanImg(pkRenan) {
            //<editor-fold desc="SQL Query">
            new sql.Request()
                .input('pkParent', sql.NChar(7), pkRenan.trim())
                .query('SELECT * FROM [SuntiumQA].[dbo].[m_WorkpieceImages] ' +
                    'WHERE pkParent = @pkParent ORDER BY id ASC')
                .then(function (records) {
                    if(records.length > 0){
                        var RenanImages = records;
                        var startIndex = infoGroup.flagIndex;
                        var endIndex = startIndex + infoGroup.SumDisplayQty > infoGroup.ImgQty
                            ? infoGroup.ImgQty -1 :　startIndex + infoGroup.SumDisplayQty;
                        var aryImages = RenanImages.slice(startIndex, endIndex);
                        //console.log(aryImages);
                        GetGroupDevs(aryImages);
                    }
                    else {
                        objRsp.Mode = false;
                        objRsp.Info = 'No Image exist. Please call system manager.';
                        res.json(objRsp);
                    }
                })
                .catch(function (err) {
                    console.log(err);
                });
            //</editor-fold>
            function GetGroupDevs(aryImages) {
                //<editor-fold desc="SQL Query">
                new sql.Request()
                    .input('pkGroup', sql.NChar(7), objQuery.GroupID.trim())
                    .query('SELECT * FROM [SuntiumQA].[dbo].[info_ScreenDevice] ' +
                        'WHERE pkGroup = @pkGroup ORDER BY iGSN ASC')
                    .then(function (records) {
                        if (records.length > 0) {
                            var objGroupDevs = {
                                nowIndex: 0,
                                Devices: records
                            }
                            var idxImage = 0;
                            for (var i = 0; i < objGroupDevs.Devices.length; i++) {
                                var devDisplayQty = objGroupDevs.Devices[i].iDisplayQty;
                                objGroupDevs.Devices[i].Images = aryImages.slice(idxImage, idxImage + devDisplayQty);
                                objGroupDevs.Devices[i].nowIndex = 0;
                                idxImage += devDisplayQty;
                            }
                            ForeachDevs(objGroupDevs);
                        }
                        else {
                            objRsp.Mode = false;
                            objRsp.Info = 'No device in this group.';
                            res.json(objRsp);
                        }
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                //</editor-fold>
            }
            function ForeachDevs(objGroupDevs) {
                if(objGroupDevs.nowIndex < objGroupDevs.Devices.length){
                    InsertCmdMaster(objGroupDevs);
                }
                else {
                    UpdateGroupFlag();
                }
            }
            function UpdateGroupFlag() {
                //<editor-fold desc="SQL Query">
                new sql.Request()
                    .input('id', sql.NChar(5), infoGroup.id.trim())
                    .input('flagIndex', sql.NChar(5), infoGroup.flagIndex + infoGroup.SumDisplayQty)
                    .input('pkM', sql.NChar(12), infoGroup.pkM)
                    .query(
                        'UPDATE [SuntiumQA].[dbo].[info_Group] ' +
                        'SET flagIndex = @flagIndex, pkM = @pkM ' +
                        'WHERE id = @id'
                    )
                    .then(function () {
                        objRsp.info = 'Success!!!!!'
                        res.json(objRsp);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                //</editor-fold>
            }
            
            function InsertCmdMaster(objGroupDevs) {
                var dtNow = new Date();
                dtNow.setTime(dtNow.getTime() + (8*60*60*1000));
                var objDevice = objGroupDevs.Devices[objGroupDevs.nowIndex];
                //<editor-fold desc="SQL Query">
                new sql.Request()
                    .input('pkDev', sql.NChar(2), objDevice.id.trim())
                    .input('pkRenan', sql.NChar(7), pkRenan.trim())
                    .input('dtQuery', sql.DateTime(), dtNow)
                    .input('dtString', sql.NVarChar(50), dtNow.toISOString())
                    .input('bValid', sql.NVarChar(50), false)
                    .query(
                        'INSERT INTO [SuntiumQA].[dbo].[q_cmd]' +
                        ' ([pkDev], [dtQuery], [bValid], [dtString], [pkRenan]) ' +
                        ' VALUES (@pkDev, @dtQuery, @bValid, @dtString, @pkRenan)'
                    )
                    .then(function () {
                        InsertImage(dtNow, objGroupDevs);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                //</editor-fold>
            }
            function InsertImage(dtNow, objGroupDevs) {
                var objDevice = objGroupDevs.Devices[objGroupDevs.nowIndex];
                var objImages = objDevice.Images[objDevice.nowIndex];
                //<editor-fold desc="SQL Query">
                new sql.Request()
                    .input('pkImage', sql.NChar(13), objImages.id.trim())
                    .input('pkParent', sql.NVarChar(50), dtNow.toISOString())
                    .query(
                        'INSERT INTO [SuntiumQA].[dbo].[q_cmddetail]' +
                        ' ([pkImage], [pkParent]) ' +
                        ' VALUES (@pkImage, @pkParent)'
                    )
                    .then(function () {
                        if(objDevice.nowIndex == objDevice.Images.length -1){
                            UpdateCMDMaster(dtNow, objGroupDevs);
                        }
                        else {
                            objDevice.nowIndex++;
                            InsertImage(dtNow, objGroupDevs);
                        }
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                //</editor-fold>
            }
            function UpdateCMDMaster(dtNow, objGroupDevs) {
                //<editor-fold desc="SQL Query">
                new sql.Request()
                    .input('dtQuery', sql.DateTime(), dtNow)
                    .query(
                        'UPDATE [SuntiumQA].[dbo].[q_cmd] ' +
                        'SET [bValid] = 1 ' +
                        'WHERE dtQuery = @dtQuery'
                    )
                    .then(function () {
                        UpdateDevStatus(dtNow, objGroupDevs);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                //</editor-fold>
            }
            function UpdateDevStatus(dtNow, objGroupDevs) {
                var NowDevice = objGroupDevs.Devices[objGroupDevs.nowIndex];
                //<editor-fold desc="SQL Query">
                new sql.Request()
                    .input('id', sql.NChar(5), NowDevice.id.trim())
                    .query(
                        'UPDATE [SuntiumQA].[dbo].[info_ScreenDevice] ' +
                        'SET [bStatusChange] = 1 ' +
                        'WHERE id = @id'
                    )
                    .then(function () {
                        objGroupDevs.nowIndex++;
                        ForeachDevs(objGroupDevs);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                //</editor-fold>
            }

        }
    }
    function DoBackward(infoGroup){
        if(infoGroup.flagIndex > 0){
            var pkRenan = infoGroup.pkM;
            GetRenanImg(pkRenan);
        }
        else {
            objRsp.Mode = false;
            objRsp.Info = 'be at an end of this lot.';
            res.json(objRsp);
        }
        function GetRenanImg(pkRenan) {
            //<editor-fold desc="SQL Query">
            new sql.Request()
                .input('pkParent', sql.NChar(7), pkRenan.trim())
                .query('SELECT * FROM [SuntiumQA].[dbo].[m_WorkpieceImages] ' +
                    'WHERE pkParent = @pkParent ORDER BY id ASC')
                .then(function (records) {
                    if(records.length > 0){
                        var RenanImages = records;
                        infoGroup.flagIndex = infoGroup.flagIndex >= RenanImages.length? RenanImages.length : infoGroup.flagIndex;
                        var endIndex = infoGroup.flagIndex;
                        var startIndex = endIndex - infoGroup.SumDisplayQty * 2 < 0
                            ? 0 :　endIndex - infoGroup.SumDisplayQty * 2;
                        var aryImages = RenanImages.slice(startIndex, endIndex);
                        //console.log(aryImages);
                        GetGroupDevs(aryImages);
                    }
                    else {
                        objRsp.Mode = false;
                        objRsp.Info = 'No Image exist. Please call system manager.';
                        res.json(objRsp);
                    }
                })
                .catch(function (err) {
                    console.log(err);
                });
            //</editor-fold>
            function GetGroupDevs(aryImages) {
                //<editor-fold desc="SQL Query">
                new sql.Request()
                    .input('pkGroup', sql.NChar(7), objQuery.GroupID.trim())
                    .query('SELECT * FROM [SuntiumQA].[dbo].[info_ScreenDevice] ' +
                        'WHERE pkGroup = @pkGroup ORDER BY iGSN ASC')
                    .then(function (records) {
                        if (records.length > 0) {
                            var objGroupDevs = {
                                nowIndex: 0,
                                Devices: records
                            }
                            var idxImage = 0;
                            for (var i = 0; i < objGroupDevs.Devices.length; i++) {
                                var devDisplayQty = objGroupDevs.Devices[i].iDisplayQty;
                                objGroupDevs.Devices[i].Images = aryImages.slice(idxImage, idxImage + devDisplayQty);
                                objGroupDevs.Devices[i].nowIndex = 0;
                                idxImage += devDisplayQty;
                            }
                            ForeachDevs(objGroupDevs);
                        }
                        else {
                            objRsp.Mode = false;
                            objRsp.Info = 'No device in this group.';
                            res.json(objRsp);
                        }
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                //</editor-fold>
            }
            function ForeachDevs(objGroupDevs) {
                if(objGroupDevs.nowIndex < objGroupDevs.Devices.length){
                    InsertCmdMaster(objGroupDevs);
                }
                else {
                    UpdateGroupFlag();
                }
            }
            function UpdateGroupFlag() {
                var devflag = infoGroup.flagIndex - infoGroup.SumDisplayQty < 0 ? 0 :infoGroup.flagIndex - infoGroup.SumDisplayQty;
                //<editor-fold desc="SQL Query">
                new sql.Request()
                    .input('id', sql.NChar(5), infoGroup.id.trim())
                    .input('flagIndex', sql.NChar(5), devflag)
                    .input('pkM', sql.NChar(12), infoGroup.pkM)
                    .query(
                        'UPDATE [SuntiumQA].[dbo].[info_Group] ' +
                        'SET flagIndex = @flagIndex, pkM = @pkM ' +
                        'WHERE id = @id'
                    )
                    .then(function () {
                        objRsp.info = 'Success!!!!!'
                        res.json(objRsp);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                //</editor-fold>
            }

            function InsertCmdMaster(objGroupDevs) {
                var dtNow = new Date();
                dtNow.setTime(dtNow.getTime() + (8*60*60*1000));
                var objDevice = objGroupDevs.Devices[objGroupDevs.nowIndex];
                //<editor-fold desc="SQL Query">
                new sql.Request()
                    .input('pkDev', sql.NChar(2), objDevice.id.trim())
                    .input('pkRenan', sql.NChar(7), pkRenan.trim())
                    .input('dtQuery', sql.DateTime(), dtNow)
                    .input('dtString', sql.NVarChar(50), dtNow.toISOString())
                    .input('bValid', sql.NVarChar(50), false)
                    .query(
                        'INSERT INTO [SuntiumQA].[dbo].[q_cmd]' +
                        ' ([pkDev], [dtQuery], [bValid], [dtString], [pkRenan]) ' +
                        ' VALUES (@pkDev, @dtQuery, @bValid, @dtString, @pkRenan)'
                    )
                    .then(function () {
                        InsertImage(dtNow, objGroupDevs);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                //</editor-fold>
            }
            function InsertImage(dtNow, objGroupDevs) {
                var objDevice = objGroupDevs.Devices[objGroupDevs.nowIndex];
                var objImages = objDevice.Images[objDevice.nowIndex];
                //<editor-fold desc="SQL Query">
                new sql.Request()
                    .input('pkImage', sql.NChar(13), objImages.id.trim())
                    .input('pkParent', sql.NVarChar(50), dtNow.toISOString())
                    .query(
                        'INSERT INTO [SuntiumQA].[dbo].[q_cmddetail]' +
                        ' ([pkImage], [pkParent]) ' +
                        ' VALUES (@pkImage, @pkParent)'
                    )
                    .then(function () {
                        if(objDevice.nowIndex == objDevice.Images.length -1){
                            UpdateCMDMaster(dtNow, objGroupDevs);
                        }
                        else {
                            objDevice.nowIndex++;
                            InsertImage(dtNow, objGroupDevs);
                        }
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                //</editor-fold>
            }
            function UpdateCMDMaster(dtNow, objGroupDevs) {
                //<editor-fold desc="SQL Query">
                new sql.Request()
                    .input('dtQuery', sql.DateTime(), dtNow)
                    .query(
                        'UPDATE [SuntiumQA].[dbo].[q_cmd] ' +
                        'SET [bValid] = 1 ' +
                        'WHERE dtQuery = @dtQuery'
                    )
                    .then(function () {
                        UpdateDevStatus(dtNow, objGroupDevs);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                //</editor-fold>
            }
            function UpdateDevStatus(dtNow, objGroupDevs) {
                var NowDevice = objGroupDevs.Devices[objGroupDevs.nowIndex];
                //<editor-fold desc="SQL Query">
                new sql.Request()
                    .input('id', sql.NChar(5), NowDevice.id.trim())
                    .query(
                        'UPDATE [SuntiumQA].[dbo].[info_ScreenDevice] ' +
                        'SET [bStatusChange] = 1 ' +
                        'WHERE id = @id'
                    )
                    .then(function () {
                        objGroupDevs.nowIndex++;
                        ForeachDevs(objGroupDevs);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                //</editor-fold>
            }

        }
    }

    function DoNext(infoGroup) {
        GetNextRenan();
        function GetNextRenan() {
            //<editor-fold desc="SQL Query">
            new sql.Request()
                .input('pkParent', sql.NChar(7), infoGroup.pkM.trim())
                .query('SELECT TOP 1 * FROM [SuntiumQA].[dbo].[vinfo_Renan]' +
                    'WHERE pkParent > @pkParent ORDER BY pkParent ASC')
                .then(function (records) {
                    if(records.length > 0){
                        infoGroup.pkM = records[0].pkParent;
                        infoGroup.ImgQty = records[0].ImgQty;
                        infoGroup.flagIndex = 0;
                        DoForward(infoGroup);
                    }
                    else {
                        objRsp.Mode = false;
                        objRsp.Info = 'be at an end of Renans.';
                        res.json(objRsp);
                    }
                })
                .catch(function (err) {
                    console.log(err);
                });
            //</editor-fold>
        }
    }
    function DoPrevious(infoGroup) {
        GetPreviousRenan();
        function GetPreviousRenan() {
            //<editor-fold desc="SQL Query">
            new sql.Request()
                .input('pkParent', sql.NChar(7), infoGroup.pkM.trim())
                .query('SELECT TOP 1 * FROM [SuntiumQA].[dbo].[vinfo_Renan]' +
                    'WHERE pkParent < @pkParent ORDER BY pkParent DESC')
                .then(function (records) {
                    if(records.length > 0){
                        infoGroup.pkM = records[0].pkParent;
                        infoGroup.ImgQty = records[0].ImgQty;
                        infoGroup.flagIndex = 0;
                        DoForward(infoGroup);
                    }
                    else {
                        objRsp.Mode = false;
                        objRsp.Info = 'be at an end of Renans.';
                        res.json(objRsp);
                    }
                })
                .catch(function (err) {
                    console.log(err);
                });
            //</editor-fold>
        }
    }
});
module.exports = router;

