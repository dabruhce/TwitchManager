appServices.factory('socket', function ($rootScope) {
    var socket = io.connect('http://192.168.99.100:8000');
    console.log('connected to socket');
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {  
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
})
.service('Util', [
        function() {
            return {
                dhms: function(t) {
                    var days, hours, minutes, seconds;
                    days = Math.floor(t / 86400);
                    t -= days * 86400;
                    hours = Math.floor(t / 3600) % 24;
                    t -= hours * 3600;
                    minutes = Math.floor(t / 60) % 60;
                    t -= minutes * 60;
                    seconds = t % 60;
                    if(days > 0) {return [days + 'd', hours + 'h', minutes + 'm', seconds + 's'].join(' ');}
                    if(hours > 0) {return [hours + 'h', minutes + 'm', seconds + 's'].join(' ');}
                    return [minutes + 'm', seconds + 's'].join(' ');
//                    return [hours + 'h', minutes + 'm', seconds + 's'].join(' ');
//                    return [days + 'd', hours + 'h', minutes + 'm', seconds + 's'].join(' ');
                }
            };
        }
    ]);