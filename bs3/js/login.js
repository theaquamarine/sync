/*
    So, it turns out that $.post causes Firefox to use a GET request
    on cross-site requests.  What the hell?  I'd understand if they just
    made it error instead, but why give me chicken tenders if I ordered a
    cheeseburger and act like everything's peachy?
*/
function postJSON(url, data, callback) {
    $.ajax(url, {
        method: "POST",
        crossDomain: true,
        data: data,
        success: function (data) {
            try {
                data = data.substring(data.indexOf("{"));
                data = data.substring(0, data.lastIndexOf("}") + 1);
                data = JSON.parse(data);
                callback(data);
            } catch(e) {
                return;
            }
        },
        dataType: "text"
    });
}
var theme = USEROPTS.theme;
if(theme != "default") {
    $("<link/>").attr("rel", "stylesheet")
        .attr("type", "text/css")
        .attr("id", "usertheme")
        .attr("href", theme)
        .appendTo($("head"));
}

var source;
var respond = function(e) {
    if(e.data == "cytube-syn") {
        source = e.source;
        source.postMessage("cytube-ack", document.location);
    }
}
window.addEventListener("message", respond, false);

$("#login").click(function() {
    var data = {
        name: $("#username").val(),
        pw: $("#pw").val()
    };
    postJSON(WEB_URL+"/api/login", data, function (data) {
        data.uname = $("#username").val();
        source.postMessage("cytube-login:"+JSON.stringify(data), document.location);
    });
});
