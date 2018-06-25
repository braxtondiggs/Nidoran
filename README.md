# Nidoran ![Nidoran](cryptonym.png)

Integration with [Pixel Ambient Services - Now Playing](https://play.google.com/store/apps/details?id=com.google.intelligence.sense) to grab data for [my personal website](http://braxtondiggs.com)

## Getting Started

### Prerequisites

- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7
- [Heroku CLI](https://devcenter.heroku.com/articles/getting-started-with-nodejs) Heroku ^5.6.8
- [Node Foreman](https://github.com/strongloop/node-foreman) (`npm install --global foreman`)
- [nodemon](https://nodemon.io/) (`npm install --global nodemon`)

### Developing

1. Run `npm install` to install server dependencies.

2. Run `heroku config:get MONGODB_URI -s  >> .env -a nidoran && heroku config:get SPOTIFY_ID -s  >> .env -a nidoran && heroku config:get SPOTIFY_SECRET -s  >> .env -a nidoran` to install Heroku Environment Variables.

3. Run `nf run nodemon index.js` to start the development server.
