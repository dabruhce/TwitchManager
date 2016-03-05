appControllers.controller('MainCtrl', function($scope,$timeout,$interval,socket) {


    $scope.messageArray = [];
    $scope.hideAlert = true;


    //Timer start function.
    $scope.StartTimer = function () {
        //Set the Timer start message.
        console.log("timer started");
        $scope.Message = "Timer started. ";
        //   console.log($scope.Message + ' ' + $scope.roundSpeed.automationLoopTime);

        //Initialize the Timer to run every 1000 milliseconds i.e. one second.
        $scope.Timer = $interval(runMessageQueue, 30000);
    };


    //Timer stop function.
    $scope.StopTimer = function () {

        //Set the Timer stop message.
        $scope.Message = "Timer stopped.";
        console.log($scope.Message);
        //Cancel the Timer.
        if (angular.isDefined($scope.Timer)) {
            $interval.cancel($scope.Timer);
        }
    };

    function monitorSocket() {
        socket.emit('tweet-io:start', true);
        socket.on('twitch-io:chat', function (data) {
            console.log(JSON.stringify(data));
            $scope.messageArray.push(data);
        });
    }

    monitorSocket();

    $scope.isTweet = function(){
        //alert($scope.checked);
        //console.log($scope.messageArray[0].length);
       // if($scope.messageArray[0].length < 1)
        if(typeof $scope.messageArray[0] == 'undefined' )
        {
            return false;
        }
        if($scope.messageArray[0].type == 'tweet')
        {
            return true;
        }
        return false;
    }
    $scope.isTwitchChat = function(){
        console.log("type is: " + $scope.messageArray[0].type);

        if(typeof $scope.messageArray[0] == 'undefined' )
        {
            return false;
        }

        if($scope.messageArray[0].type == 'chat')
        {
            return true;
        }
        return false;
    }
    $timeout(function () {$scope.StartTimer();}, 30);

    $scope.remove = function(index){
        //alert($scope.checked);
        $scope.messageArray.splice(index, 1);
    };

    function runMessageQueue() {

        if($scope.messageArray.length > 0) {
            console.log('we have a message ' + $scope.messageArray.length);
            console.log(JSON.stringify($scope.messageArray[0]));

            $scope.alertType = $scope.messageArray[0].type;
            $scope.user = $scope.messageArray[0].user;
            $scope.message = $scope.messageArray[0].message;
            $scope.logo = $scope.messageArray[0].logo;
            $scope.remove(0);

            if($scope.hideAlert == false) {

                $scope.hideAlert =  true;
            }
            else {
                $scope.hideAlert = false;
            }
        }
        else
        {
            if($scope.hideAlert == false) {
                $scope.hideAlert =  true;
            }
        }
    }

})
appControllers.controller('CalendarCtrl', function($scope) {


    $scope.eventSource = {
        googleCalendarApiKey: 'GET THIS FROM GOOGLE DEV CONSOLE',
        googleCalendarId: 'GET THIS FROM SHARE LINK IN GOOGLE CALENDAR'

    };
    $scope.eventSources = [ $scope.eventSource ];


    $scope.uiConfig = {
        calendar:{
            height: 200,
            editable: true,
            header: false,
            //{
           //     left: 'title',
           //     center: '',
           //     right: 'today prev,next'
           // },
        //    agendaFourDay: {
        //        type: 'agenda',
        //        duration: { days: 4 },
        //        buttonText: '4 day'
        //    },
            theme: 'true',
            defaultView: 'basicWeek',
            dayClick : $scope.setCalDate,
            eventClick: $scope.alertOnEventClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventRender: $scope.eventRender
        }
    };

})
    .run(function($ionicPlatform) {
        $ionicPlatform.ready(function() {
            if(window.cordova && window.cordova.plugins.Keyboard) {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

                // Don't remove this line unless you know what you are doing. It stops the viewport
                // from snapping when text inputs are focused. Ionic handles this internally for
                // a much nicer keyboard experience.
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if(window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    })