var Logger =  require("./logger");
var IDCHARS = "abcdefghijklmnopqrstuvwxyz" +
              "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
              "0123456789";

var clients = {};
var rooms = {};

var JSONPollSocket = function () {
    this.id = "";
    for(var i = 0; i < 30; i++)
        this.id += IDCHARS[parseInt(Math.random() * (chars.length - 1))];

    this.outgoing = [];
    this.handlers = {};
    this.lastpoll = Date.now();
};

JSONPollSocket.prototype.emit = function (msg, data) {
    var pkt = {
        message: msg,
        data: data
    };
    this.outgoing.push(pkt);
};

JSONPollSocket.prototype.poll = function () {
    this.lastpoll = Date.now();
    var q = Array.prototype.slice.call(this.outgoing);
    this.outgoing.length = 0;
    return q;
};

JSONPollSocket.prototype.on = function (msg, fn) {
    if(!(msg in this.handlers))
        this.handlers[msg] = [];
    this.handlers[msg].push(fn);
};

JSONPollSocket.prototype.recv = function (message, data) {
    if(!(message in this.handlers))
        return;

    this.handlers[message].forEach(function (fn) {
        fn(data);
    });
};

JSONPollSocket.prototype.join = function (rm) {
    if(!rm in rooms)
        rooms[rm] = [];
    rooms[rm].push(this);
};

JSONPollSocket.prototype.leave = function (rm) {
    if(!(rm in rooms))
        return;
    
    var idx = rooms[rm].indexOf(this);
    if(idx >= 0)
        rooms[rm].splice(idx, 1);
};

JSONPollSocket.prototype.disconnect = function () {
    for(var rm in rooms) {
        this.leave(rm);
    }

    this.recv("disconnect");
    this.emit("disconnect");
    clients[this.id] = null;
};

JSONPollSocket.prototype.handleClientPoll = function (res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.type("jsonp");

    res.jsonp(this.poll());
};

JSONPollSocket.prototype.handleClientRecv = function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var message = req.body.message;
    var data = req.body.data;
    try {
        data = JSON.parse(data);
    } catch(e) {
        res.send(400);
        return;
    }

    this.recv(message, data);
    res.send(200);
};
