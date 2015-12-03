// neural network painter server
//

var async = require('async');
var jot = require('json-over-tcp');

var chanID = '';
var password = '';
var ctx = {
    server: jot.createServer(),
    painters: []
};


exports.help = [
    ["paint <http://cuck.com/style1.jpg> <http://cuck.com/stlye2.jpg> http://quibs.info/content.jpg", "Create art."]
];

exports.config = function(config){
    ctx.server.listen(config.port);
    chanID = config.chanID;
    password = config.password;
};

exports.init = function(dobby){
    ctx.server.on('connection', function(socket){
        var auth = false;
        socket.on('error', function() {
            
        })
        socket.on('close', function(){
            //TODO fix this
            ctx.painters.pop()
        });
        socket.on('data', function(data){
            if (auth == false){
                if (data.password == password){
                    auth = true;
                    ctx.painters.push(socket)
                } else {
                    socket.end()
                }
            } else {
                dobby.with(function(supervisor){
                    supervisor.move_to_channel(chanID, function(err){
                        supervisor.send_channel_message(data.msg, function(){})
                    })
                })
            }
        })
    });
};

exports.onMessage = function(msg, dobby) {
    var terms = msg.split(" ");
    var command = terms.shift();
    //terms = terms.join(" ");

    var content = terms.pop();

    if ((command == '.paint' || command == '.p') && dobby.cid == chanID) {
        if (ctx.painters.length != 1){
            dobby.respond('No painters available.')
        } else {
            ctx.painters[0].write({
                styles: [terms],
                content: content
            })
        }
    }
};