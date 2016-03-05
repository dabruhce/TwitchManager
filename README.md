# Setup
- Download [Docker Toolbox](https://www.docker.com/products/docker-toolbox)
- Get twitch auth tokens [Twitch Apps](https://twitchapps.com/tmi/) - required
- Get twitter auth tokens [Twitter Apps](https://apps.twitter.com/) - required
- Get Google Api key [Google Developer console](https://console.developers.google.com/) - optional

# Configure
- Launch Docker Quickstart Terminal
- git clone https://github.com/tkntobfrk/TwitchManager.git

# Configure Twitch Chat
- update twitch.json with twitch auth tokens
- update twitchWhisper.json with twitch auth tokens

# Configure Twitter search
- update twitter.json with twitter auth tokens
- update twitter.json with search term(s), can be comma seperated

# Configure Google Calendar - optional
- update calendarCtrl in controllers.js with api tokens googleCalendarApiKey
- get the share value of the calendar you'd like to share and add to controller on googleCalendarId

# Configure IP - maybe
- depending on how you setup Docker Toolbox change to /app/services/services.js may be needed
- In docker toolbox execute docker-machine ip default
- this IP must match /app/service/services.js
```javascript
appServices.factory('socket', function ($rootScope) {
    var socket = io.connect('http://192.168.99.100:8000');
    console.log('connected to socket');
```

# Configure commands.json
- Users can add commands as necessary, !debit & !credit should remain static
- This is generally a work in progress but basic commands should work fine if added with restict: none, value: whatever needs to be said, and name: !mycommand or !whatevercommand
```json    
	{
        "name": "!mycommand",
        "description": "This is my command",
        "restrict": "none",
        "type": "info",
        "value": "This will be chatted!!"
    },
```

# Run the bot
- cd TwitchManager
- docker rm -f $(docker ps -a -q)
- docker rmi $(docker images -q)
- docker-compose up -d

# Use bot notifications
- point clr or streaming browser items at http://192.168.99.100:8000/index.html
- Note if you have a different docker ip the ip above should be changed to that value

# Use bot calendar
- point clr or streaming browser items at http://192.168.99.100:8000/calendar.html
- work inprogress

# TwitchManager
- Google Calendar for Stream schedule (complete)
- Timer countdown display
- Twitter notifications (complete)
- Twitch Chat notification (complete)
- Added linked Redis for follower check/notifier (complete)
- Redis for credit tracking, saves to filesystem for persistence (complete)

# Twitch Chat bot base
- user defined commands (complete)
- in stream rewards (complete)
- follow notification (complete)

# Twitch chat bot V2
- giveaways
- polls - port from vote code
- gui interface to setup commands
- implement timers
- redis interface for accounts

# Cleanup
- clean code of api keys before upload (complete)
- create tutorial for api keys (calendar, twitter, twitch)
- create video tutorial for misc setup

# Twitter enhancements
- wire up the tweet command
- check webrtc to twitter?

# TBD - items below require integration & rework as time permits 
- Twitch Chat trivia, w/ Text to Speech - port from http://trivia.juiry.com/ & standalone app - requires rework
- Android/Iphone App notifier - port from http://trivia.juiry.com/ & standalone app - requires rework
- Android/Iphone/Web video uploader - port from http://trivia.juiry.com/ & standalone app - requires rework
- Xsplit Runner - port from local src requires rework
- rtmp stream user videos from S3 - port from local src requires rework
