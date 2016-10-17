/**
 * Created by Inoku on 2016/7/7.
 */
var supportsVibrate = "vibrate" in navigator;
var timer1;
var teatiem = 0;
function SendNavCmd (navcmd) {
    $.ajax({
        url: '/cmd/99/01/' + navcmd,
        method: "POST",
        dataType: "json",
        contentType: 'application/json',
    }).done(function (rsp) {
        if(supportsVibrate){
            if(rsp.Mode){
                navigator.vibrate(1000);
            }
            else {
                navigator.vibrate([500,100,200,100,200]);
            }
        }
        navigator.getBattery().then(function(battery) {
            $('#rsp').text(rsp.Mode + '/' + rsp.Info + '/' + teatiem + 'ms/' + battery.level);
            clearInterval(timer1);
            teatiem = 0;
            battery.onlevelchange = function() {
                console.log(this.level);
            };
        });
    }).fail(function (jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.log("Update Data Request Failed: " + err);
        $('#rsp').text("Update Data Request Failed: " + err);
    }).always(function () {
    });
}
function addtime () {
    teatiem++;
}
$(document).ready(function () {
    $('.btnnav').on('click', function () {
        timer1 = setInterval(addtime,1);
        $('#rsp').text('Sending');
    })
    $('#btnforward').on('click', function () {
        SendNavCmd('forward');
    })
    $('#btnbackward').on('click', function () {
        SendNavCmd('backward');
    })
    $('#btnnext').on('click', function () {
        SendNavCmd('next');
    })
    $('#btnprevious').on('click', function () {
        SendNavCmd('previous');
    })
})
