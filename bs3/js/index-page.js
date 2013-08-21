$(function () {

    var formatURL = function (data) {
        var entry = "";
        switch(data.type) {
            case "yt":
                entry = "http://youtube.com/watch?v=" +data.id;
                break;
            case "vi":
                entry = "http://vimeo.com/"+data.id;
                break;
            case "dm":
                entry = "http://dailymotion.com/video/"+data.id;
                break;
            case "sc":
                entry = data.id;
                break;
            case "li":
                entry = "http://livestream.com/"+data.id;
                break;
            case "tw":
                entry = "http://twitch.tv/"+data.id;
            case "jt":
                entry = "http://justin.tv/"+data.id;
                break;
            case "us":
                entry = "http://ustream.tv/" + data.id;
                break;
            case "rt":
            case "jw":
                entry = data.id;
                break;
            case "cu":
                entry = "";
            default:
                break;
        }
        return entry;
    };

    var refresh = function () {
        $.getJSON(WEB_URL + "/api/allchannels/public?callback=?", function (data) {
            data.sort(function (a, b) {
                var x = a.usercount;
                var y = b.usercount;
                if(x == y) {
                    var c = a.name.toLowerCase();
                    var d = b.name.toLowerCase();
                    return c == d ? 0 : (c < d ? -1 : 1);
                }
                return y - x;
            });

            var tbl = $("#channeldata");
            tbl.find("tbody").remove();
            data.forEach(function (d) {
                var tr = $("<tr/>").appendTo(tbl);
                var name = $("<td/>").appendTo(tr);
                $("<a/>", { href: "r/" + d.name })
                    .text(d.pagetitle + " (" + d.name + ")")
                    .appendTo(name);
                $("<td/>").text(d.usercount || 0).appendTo(tr);
                var title = $("<td/>").appendTo(tr);
                if(d.media.id) {
                    var url = formatURL(d.media);
                    if(url === "") {
                        title.text(d.media.title);
                    } else {
                        $("<a/>", { href: url, target: "_blank" })
                            .text(d.media.title)
                            .appendTo(title);
                    }
                } else {
                    title.text("-");
                }
            });
        });
    };

    setInterval(refresh, 10000);
    refresh();

    $("#channel").keydown(function (ev) {
        if(ev.keyCode == 13) {
            if(!$("#channel").val().match(/^\w{1,30}$/)) {
                var al = $("<div/>", { class: "alert alert-danger" })
                    .text("Invalid channel name.  Channel names may only " +
                          "contain A-Z, 0-9, - and _.")
                    .insertAfter($("#channel"));
                $("<button/>", { class: "close pull-right" })
                    .html("&times;")
                    .click(function () {
                        al.remove();
                    })
                    .prependTo(al);
                return;
            }

            location.href = "r/" + $("#channel").val();
        }
    });

    // Check for old URL scheme
    var query = window.location.search.substring(1);
    if(query.match(/^channel=\w{1,30}$/)) {
        location.href = "r/" + query.replace("channel=", "");
    }

});
