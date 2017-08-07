"use strict";
var settings = require('nconf').argv().env().file({file: 'settings.json'}).defaults({
      "port": 3000
    }),
    fs = require('fs'),
    _ = require('underscore'),
    express = require('express'),
    ejs = require('ejs'),
    urlencodedParser = require('body-parser').urlencoded({
      extended: true
    }),
    app = express(),
    games = (() => {
      var games = [];
      fs.readdirSync('static/games').forEach((i) => {
        if(fs.lstatSync(`static/games/${i}`).isDirectory()) {
          games.push(i);
        }
      });
      return games;
    })();

ejs.delimiter = ':';

app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
app.locals.layout = 'layout';
app.locals.ui = require('./randomvictory_ui');

app.use('/static', express.static('static'));
app.use(require('express-ejs-layouts'));

app.get('/', (req, res) => {
  games = _.shuffle(games);
  res.render('pages/index', {
    games: _.first(games, 3)
  });
});

app.listen(settings.get('port'), () => {
  console.log('Listening for requests at http://localhost:'+settings.get('port')+'/');
});
