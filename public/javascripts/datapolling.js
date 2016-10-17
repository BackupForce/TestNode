/**
 * Created by Inoku on 2016/7/4.
 */
var QueryString = function () {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();

var getdata = function () {
    $.ajax({
        url: '/pollingscreen/getrender/' + QueryString.devid,
        method: "POST",
        contentType: 'html',
    }).done(function (rsp) {
        $('#ctnt').empty();
        $('#ctnt').append(rsp);
        console.log('getted html');
        pollingdata();
    }).fail(function (jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.log("Update Data Request Failed: " + err);
    }).always(function () {
    });
}

var pollingdata = function () {
    $.ajax({
        url: '/pollingscreen/checkflag/' + QueryString.devid,
        method: "POST",
        dataType: "json",
        contentType: 'application/json',
    }).done(function (rsp) {
        if(rsp.bStatusChange){
            getdata();
            console.log('go getdata');
        }
        else {
            setTimeout(function () {
                pollingdata();
            }, 1000);
        }
    }).fail(function (jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.log("Update Data Request Failed: " + err);
    }).always(function () {
    });
}
pollingdata();

