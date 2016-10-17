/**
 * Created by Inoku on 2016/8/26.
 */

var msql = require('mssql');
var events = require('events');

var sqlconfig = {
    user: 'sa',
    password: 'go0970391578',
    server: 'localhost',
    database: 'SuntiumQA',
    options: {}
}


msql.connect(sqlconfig)
    .then(function () {
        Init();
    })
    .catch(function (err) {
        console.log(err);
    });

var Buz = function () {};

var MainModeStatus = function () {
    var _self = this;
    this.infoGroup = new GroupInfo();//GroupInfo
    this.src = new MainModeSource();//MainModeSource
    this.Lot = [];
    function SourcePrase() {
        var aryLot = [];
        var iLot = Math.ceil(_self.src.QtyOfMachine / _self.infoGroup.MaxDevQty);
        for(var i = 0; i < iLot; i++){
            var objLot = {};
            var iQtyDev = i * _self.infoGroup.MaxDevQty;
            var aryMchinfo = _self.src.Machines.slice(iQtyDev, iQtyDev + _self.infoGroup.MaxDevQty);
            objLot.MaxImgQty = 0;
            for(var j = 0; j < aryMchinfo.length; j++){
                if(aryMchinfo[j].NowProductInfo.Images.length > objLot.MaxImgQty){
                    objLot.MaxImgQty = aryMchinfo[j].NowProductInfo.Images.length;
                }
            }
            var iPage =  Math.ceil(objLot.MaxImgQty / _self.infoGroup.MaxImgQty);
            for(var j = 0; j < aryMchinfo.length; j++){
                var objMchInfo = aryMchinfo[j];
                objMchInfo.Pages = [];
                for(var k = 0; k < iPage; k++){
                    var objPage = {};
                    var iPageImgQty = k * _self.infoGroup.MaxImgQty;
                    var aryImgs = objMchInfo.images.slice(iPageImgQty, iPageImgQty + _self.infoGroup.MaxImgQty);
                    objPage.Images = aryImgs;
                    objMchInfo.Pages.push(objPage);
                }
            }
            objLot.Machines = aryMchinfo;
            aryLot.push(objLot);
        }
        _self.Lot = aryLot;
    }
}

var GroupInfo = function () {
    this.id = '';
    this.ipreDevImgQty = 4;
    this.ipreDevMchQty = 3;
    this.xMaxDevQty = 1;
    this.yMaxDevQty = 4;
    this.MaxDevQty = this.ipreDevMchQty * this.xMaxDevQty;
    this.MaxImgQty = this.ipreDevImgQty * this.yMaxDevQty;
    this.Devices = [];//DeviceInfo[]
}

var DeviceInfo = function () {
    this.id = '';
    this.x = 0;
    this.y = 0;
}

var MainModeSource = function () {
    this.QtyOfMachine = '';
    this.MaxQtyOfImage = '';
    this.Machines = [];//MachineInfo[]
    //Renew();
}

var MachineInfo = function (Name) {
    this.Name = Name;
    this.bChanged = false;
    this.NowProductInfo = new ProductInfo(this.Name);
}

var ProductInfo = function () {
    this.Name = '';
    this.Images = [];
}

//exports = module.exports = Buz;

Buz.prototype.log = function () {
    console.log('buz!');
};
function Init() {
    printPostsToConsole();
}

function getPosts() {
    setTimeout(function () {
        return '555';
    }, 3000);
}