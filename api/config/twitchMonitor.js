var req = require('request');
var fs = require('fs');
var io = require('../app').io;
var fs = require('fs');

//var moment = require('moment');
//moment().format();
//var now = moment();
//console.log(moment().format());

var moment = require('moment-timezone');


var redis = require('redis');
//var redisclient = redis.createClient(); //creates a new client
var redisclient = redis.createClient(process.env.REDIS_PORT_6379_TCP_PORT, process.env.REDIS_PORT_6379_TCP_ADDR);


redisclient.on('connect', function() {
    console.log('connected');

});

var config = require('../twitch.json');
var configWhisper = require('../twitchWhisper.json');
var twitter = require('../twitter.json');
var commands = require('../commands.json');
var irc = require("tmi.js");
var isStreamStarted = false;

//twitch chatroom
var client = new irc.client(config);
client.connect();
//twitch whisper needs diff config
var groupClient = new irc.client(configWhisper);
groupClient.connect();


var channelName = config.channels[0];
var channelNameShort = channelName.slice(1);

//console.log(config.channels[0]);
//console.log(channelName);
//console.log(channelNameShort);
//console.log(twitter.identity.consumer_key);

var Twit = require('twit');
var stream = {};

T = new Twit({

    consumer_key: twitter.identity.consumer_key,
    consumer_secret: twitter.identity.consumer_secret,
    access_token: twitter.identity.access_token,
    access_token_secret: twitter.identity.access_token_secret

});
stream = T.stream('statuses/filter', {track: twitter.search ,language: 'en'});

var nbOpenSockets = 0;
var tweetsBuffer = [];
var oldTweetsBuffer = [];
var TWEETS_BUFFER_SIZE = 1;
var SOCKETIO_TWEETS_EVENT = 'tweet-io:tweets';
var SOCKETIO_START_EVENT = 'tweet-io:start';
var SOCKETIO_STOP_EVENT = 'tweet-io:stop';

var SOCKETIO_CHAT_EVENT = 'twitch-io:chat';
var SOCKETIO_NEWSUB_EVENT = 'twitch-io:sub';

var SOCKETIO_TIMER_EVENT = 'timer-io:start';
var SOCKETIO_TIMESEND_EVENT = 'timer-io:get';
//        io.sockets.emit(SOCKETIO_TIMER_EVENT, "March 10, 2016 5:00:00");
//        io.sockets.emit(SOCKETIO_TIMESEND_EVENT, "March 10, 2016 5:00:00");
//todo need to add a limit on message queue

var _=require("underscore");

//var commandList = JSON.parse(commands);
console.log(commands);
var commandList = [];
for(var i = 0; i < commands.main.command.length; i++) {
    console.log(commands.main.command[i]);
    commandList.push(commands.main.command[i].name);
    //allocate points function
    //add timestamp for potential future pruning features
}

//getFollowers();
//process.exit();
getViewers();
setInterval(getViewers,300000);
setInterval(getFollowers,350000);

//dont thihnk this is available/happens
//twitchnotify: someone just subscribed! twitchnotify: someone just subscribed! 2

var handleClient = function(data, socket) {
    if (data == true) {
        console.log('Client connected !');

        if (nbOpenSockets <= 0) {
            nbOpenSockets = 0;
            console.log('First active client. Start streaming from Twitter');
            //  stream.start();
            //    StartStream();
        }

        nbOpenSockets++;

        //Send previous tweets buffer to the new client.
        if (oldTweetsBuffer != null && oldTweetsBuffer.length != 0) {
            socket.emit(SOCKETIO_TWEETS_EVENT, oldTweetsBuffer);
        }
    }
};
var handleTimer = function(data, socket) {
    if (data == true) {
        console.log('Client connected !');

        if (nbOpenSockets <= 0) {
            nbOpenSockets = 0;
            console.log('First active client. Start streaming from Twitter');
            //  stream.start();
            //    StartStream();
        }

        nbOpenSockets++;

        //Send previous tweets buffer to the new client.
        if (oldTweetsBuffer != null && oldTweetsBuffer.length != 0) {
            socket.emit(SOCKETIO_TWEETS_EVENT, oldTweetsBuffer);
        }
    }
};
io.sockets.on('connection', function(socket) {

    socket.on(SOCKETIO_START_EVENT, function(data) {
        handleClient(data, socket);
    });
	


});

StartStream();

function sendChat(channel, message) {
    if(client.userstate.hasOwnProperty(channel)) {
        client.say(channel, message);
    }
    else {
        setTimeout(sendChat, 10, channel, message); // Try again in 10ms
    }
}

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

function twitchNotify(message) {

    //follows & donates?

    var info = message.split(" ");

    var jsonobj = {};
    jsonobj.user = info[0];
    jsonobj.type = info[2];
    jsonobj.message = "woot";


    client.api({
        url: "https://api.twitch.tv/kraken/users/" + info[0]
    }, function(err, res, body) {
        var jsonObj = JSON.parse(body);
        jsonobj.logo = jsonObj.logo;
        io.sockets.emit(SOCKETIO_CHAT_EVENT, jsonobj);
    });

}

function checkFollowers(user) {

    redisclient.exists(user, function(err, reply) {
        if (reply === 1) {
            console.log('exists');
        } else {
            console.log('doesnt exist ' + user);
            //                       redisclient.set(currentUser, "true");

            redisclient.set(user, 'true', function(err, reply) {
                console.log("callback " + reply);
            });
            var jsonobj = {};
            jsonobj.user = user;
            jsonobj.type = "chat";
            jsonobj.message = "Followed WOot!";

            //NEW user add to notify queue todo
             io.sockets.emit(SOCKETIO_CHAT_EVENT, jsonobj);

        }
    });
}

function getFollowers() {

  //https://api.twitch.tv/kraken/channels/test_user1/follows
    //GET /channels/:channel/follows

    //  var jsonObj = JSON.parse(body);
    //for (var i = 0; i < jsonObj.chatters.viewers.length; i++) {

    client.api({
        url: "https://api.twitch.tv/kraken/channels/" + channelNameShort + "/follows?limit=100"
    }, function(err, res, body) {

        if(res.statusCode == 200) {
            console.log(JSON.stringify(body));
            var jsonObj = JSON.parse(body);

            for (var i = 0; i < jsonObj.follows.length; i++) {
                console.log(jsonObj.follows[i].user.name);
                console.log(jsonObj.follows[i]);
                var currentUser = jsonObj.follows[i].user.name;

                checkFollowers(currentUser);

            }

            //todo pagination
            console.log(jsonObj._links.next);
        }
    });


}


function getViewers() {

//    var url = "https://api.twitch.tv/kraken/streams?channel=juirytrivia&callback=JSON_CALLBACK";
//    $http.defaults.headers.common["X-Custom-Header"] = "Angular.js";
//    url: "https://api.twitch.tv/kraken/streams?channel=" + user.username
//var username = 'juirytrivia';


 //   {"streams":[],"_total":0,"_links":{"self":"https://api.twitch.tv/kraken/streams?channel=juirytrivia\u0026limit=25\u0026offset=0",
 //       "next":"https://api.twitch.tv/kraken/streams?channel=juirytrivia\u0026limit=25\u0026offset=25","featured":"https://api.twitch.tv/kraken/streams/featured",
 // "summary":"https://api.twitch.tv/kraken/streams/summary","followed":"https://api.twitch.tv/kraken/streams/followed"}}
//https://tmi.twitch.tv/group/user/juirytrivia/chatters
//        url: "https://api.twitch.tv/kraken/streams?channel=juirytrivia"

    /*
     {
     "_links": {},
     "chatter_count": 3,
     "chatters": {
     "moderators": [
     "creditkeeper",
     "juirytrivia"
     ],
     "staff": [],
     "admins": [],
     "global_mods": [],
     "viewers": [
     "babyzdati"
     ]
     }
     }
     */


    client.api({
        url: "https://tmi.twitch.tv/group/user/" + + channelNameShort + + "/chatters"
    }, function(err, res, body) {
        //todo check res bail if error
        console.log("result " + JSON.stringify(res));
        console.log("result " + res.statusCode);
        console.log("err " + err);
        console.log("body " + body);


//        console.log(jsonObj);
//        console.log(jsonObj.chatters.viewers);




        if(res.statusCode == 200) {
            var jsonObj = JSON.parse(body);

            for (var i = 0; i < jsonObj.chatters.viewers.length; i++) {
                console.log(jsonObj.chatters.viewers[i]);

                //allocate points
                redisclient.incrby(jsonObj.chatters.viewers[i] + "_credit", 10, function (err, reply) {
                    //    console.log(reply.toString()); // Will print `OK`
                });

            }
        }

    });

}
function modNotify(user,message) {

    var jsonobj = {};
 //   var jsonObj = JSON.parse(user);

    jsonobj.user = user.username;
    jsonobj.type = "chat";
    jsonobj.message = message;

 // todo add image url to redis and avoid api call below if exists

    client.api({
        url: "https://api.twitch.tv/kraken/users/" + user.username
    }, function(err, res, body) {
        var jsonObj = JSON.parse(body);
        jsonobj.logo = jsonObj.logo;
        io.sockets.emit(SOCKETIO_CHAT_EVENT, jsonobj);
    });

}
function subNotify(user,message) {

    var jsonobj = {};
    jsonobj.user = user.display_name;
    jsonobj.type = user.message-type;
    jsonobj.message = message;

    // todo add image url to redis and avoid api call below if exists

    client.api({
        url: "https://api.twitch.tv/kraken/users/" + info[0]
    }, function(err, res, body) {
        var jsonObj = JSON.parse(body);
        jsonobj.logo = jsonObj.logo;
        io.sockets.emit(SOCKETIO_CHAT_EVENT, jsonobj);
    });
}

function tweetNotify(user,message,logo) {

    var jsonobj = {};
    jsonobj.user = user;
    jsonobj.type = "tweet";
    jsonobj.message = message;
    jsonobj.logo = logo;
    io.sockets.emit(SOCKETIO_CHAT_EVENT, jsonobj);

}

function setTimer(date) {
    io.sockets.emit(SOCKETIO_TIMESEND_EVENT, date);
}

function isKnownUser() {
    //call db if in db return true
    return false;
}
function StartStream() {
	isStreamStarted = true;
	console.log('stream configured ' + config.channels);

    client.on("chat", function (channel, user, message, self) {


        console.log(JSON.stringify(channel));
        console.log("user" + JSON.stringify(user));
        console.log(JSON.stringify(message));
        console.log(JSON.stringify(self));


        //split message get first token
        var fields = message.split(' ');

        if (_.contains(commandList,fields[0])) {
            // User is a mod.
           // commandList.indexOf(fields[0])
            console.log('found in ' + message + ' ' + commandList.indexOf(fields[0]));

            //commands.main.command[commandList.indexOf(fields[0])].type
            //commands.main.command[commandList.indexOf(fields[0])].value

            switch(commands.main.command[commandList.indexOf(fields[0])].type)
            {
                case 'award':
                    //send award to fields[1]
                    //should be twitch username
                    //fields[2] should be value
                    //bail if < 3 or not a mod
                    if (user["user-type"] !== "mod") {
                        console.log("mod only command break");
                        break;
                    }
                    if(isNaN(fields[2])) {sendChat(channelName,'command incorrect, should be !credit $username $amount');break;}
                    if(fields.length < 3) {sendChat(channelName,'command incorrect, should be !credit $username $amount');break;}
                    sendChat(channelName,'awarding ' + commands.main.command[commandList.indexOf(fields[0])].value);
                    console.log("user "  + JSON.stringify(user));
                    console.log("val is " + fields[2]);

                    redisclient.incrby(user.username + "_credit", fields[2], function (err, reply) {
                        //    console.log(reply.toString()); // Will print `OK`
                    });
                    break;
                case 'decrease':
                    if (user["user-type"] !== "mod") {
                        console.log("mod only command break");
                        break;
                    }
                    if(isNaN(fields[2])) {sendChat(channelName,'command incorrect, should be !credit $username $amount');break;}
                    if(fields.length < 3) {sendChat(channelName,'command incorrect, should be !credit $username $amount');break;}
                    sendChat(channelName,'awarding ' + commands.main.command[commandList.indexOf(fields[0])].value);
                    console.log("user "  + JSON.stringify(user));
                    console.log("val is " + fields[2]);

                    redisclient.decrby(user.username + "_credit", fields[2], function (err, reply) {
                        //    console.log(reply.toString()); // Will print `OK`
                    });
                    break;
                case 'info':
                    sendChat(channelName,commands.main.command[commandList.indexOf(fields[0])].value);
                    break;
                case 'display':
                    redisclient.get(user.username + "_credit", function (err, reply) {
                        sendChat(channelName,"balance is: " + reply.toString());
                        //    console.log(reply.toString()); // Will print `OK`
                    });
                    break;
                case 'timer':
                    sendChat(channelName, 'not implemented');

                    // $scope.date = "March 8, 2016 5:00:00";
                    if(fields[1] !== 'add') {sendChat(channelName,'command incorrect, should be !timer add $minutes');break;}
                    if(isNaN(fields[2])) {sendChat(channelName,'command incorrect, should be !timer add $minutes');break;}
                    if(fields.length < 3) {sendChat(channelName,'command incorrect, should be !timer add $minutes');break;}

					
					var now = moment().tz("America/Chicago").format();
					console.log(moment(now).format());
					var then = moment(now).add(fields[2], 'minutes');
					var then2 = moment(then).subtract(27, 'seconds');
					console.log(moment(then2).format());

                    setTimer(moment(then2).format());
                    //set
                    //add
                    //stop

                    break;
                case 'whisper':
                    //if command restrict is a number validate user has enough points to execute
                    //else command not restricted whisper value
                    if(!isNaN(commands.main.command[commandList.indexOf(fields[0])].restrict)) {
                        redisclient.get(user.username + "_credit", function (err, reply) {
                            console.log("redis value is " + reply.toString()); // Will print `OK`
                            if(reply.toString() > commands.main.command[commandList.indexOf(fields[0])].restrict)
                            {
                                groupClient.whisper(user.username, commands.main.command[commandList.indexOf(fields[0])].value);

                            }
                            else
                            {
                                //should just send description of command here w/e
                                groupClient.whisper(user.username, "You need " + commands.main.command[commandList.indexOf(fields[0])].restrict + " points for this command");
                            }
                        });
                    }
                    else
                    {
                        groupClient.whisper(user.username, commands.main.command[commandList.indexOf(fields[0])].value);
                    }

                    break;
                default:
                    sendChat(channelName,'action ' + commands.main.command[commandList.indexOf(fields[0])].type + ' undefined');
            }



        }

        if (user["display_name"] === "twitchnotify" ) {
            //I think this only works in a certain version
            twitchNotify(message);
            return;
        }

        if (user["user-type"] === "mod" || user.username === channel.replace("#", "")) {
            // User is a mod.
            modNotify(user,message);
            return;
       //  io.sockets.emit(SOCKETIO_CHAT_EVENT, user);
        }

        if (user["user-type"] === "sub" || user.username === channel.replace("#", "")) {
            // User is a mod.
            return;
            subNotify(user,message);
      //   io.sockets.emit(SOCKETIO_CHAT_EVENT, user);
        }

    });


    client.on("subscription", function (channel, username) {

        io.sockets.emit(SOCKETIO_NEWSUB_EVENT, user);


    });


    stream.on('tweet', function (tweet) {
        console.log(JSON.stringify(tweet));
        console.log(tweet.user.screen_name);
        console.log(tweet.text);
        console.log(tweet.user.profile_image_url);
        tweetNotify(tweet.user.screen_name,tweet.text,tweet.user.profile_image_url)

    });

    stream.on('connect', function (request) {
        console.log('Connected to Twitter API');
    });

    stream.on('disconnect', function (message) {
        console.log('Disconnected from Twitter API. Message: ' + message);
    });

    stream.on('reconnect', function (request, response, connectInterval) {
        console.log('Trying to reconnect to Twitter API in ' + connectInterval + ' ms');
    });


}