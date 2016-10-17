/**
 * Created by Inoku on 2016/10/15.
 */
var msql = require('mssql');
var sqlconfig = {
    user: 'sa',
    password: 'go0970391578',
    server: 'localhost',
    database: 'SuntiumQA',
    options: {}
}


msql.connect(sqlconfig)
    .then(function () {
        GetGroups(function (GroupData) {
            console.log(GroupData);
        })
    })
    .catch(function (err) {
        console.log(err);
    });
function GetGroups(fncallback) {
    //<editor-fold desc="SQL Query">
    new msql.Request()
        .query('SELECT * FROM [SuntiumQA].[dbo].[infoGroup]')
        .then(function (records) {
            fncallback(records);
        })
        .catch(function (err) {
            console.log(err);
        });
    //</editor-fold>
}
