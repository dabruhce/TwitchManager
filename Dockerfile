FROM    centos:centos7

# Enable Extra Packages for Enterprise Linux (EPEL) for CentOS
RUN     yum install -y epel-release
# Install Node.js and npm
RUN     yum install -y nodejs npm git

# Install app dependencies
#COPY package.json /src/package.json
#RUN cd /src; npm install

# node
COPY /api/config/twitchMonitor.js /api/config/twitchMonitor.js
COPY /api/twitch.json /api/twitch.json
COPY /api/twitchWhisper.json /api/twitchWhisper.json
COPY /api/twitter.json /api/twitter.json
COPY /api/commands.json /api/commands.json
COPY /api/package.json /api/package.json
COPY /api/app.js /api/app.js
RUN cd /api; npm install; npm install -g bower

# ang
COPY /app/css /app/css
COPY /app/img /app/img
COPY /app/js /app/js
COPY /app/bower.json /app/bower.json
COPY /app/index.html /app/index.html
COPY /app/timer.html /app/timer.html
COPY /app/calendar.html /app/calendar.html
RUN cd /app; bower install --allow-root


EXPOSE 80
EXPOSE 3000
EXPOSE 8000
#http://192.168.99.100:8000/index.html
#docker run --link mongo:mongo twitch

CMD ["node", "/api/app.js"]
