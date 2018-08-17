'use strict'
const settings = require('nconf').argv().env().file({file: 'settings.json'}).defaults({
  port: 3000
})
const fs = require('fs')
const path = require('path')
const _ = require('underscore')
const express = require('express')
const ejs = require('ejs')
const app = express()

let {games, gamesData} = (() => {
  var games = []
  var gamesData = {}
  fs.readdirSync('static/games').forEach((i) => {
    if (fs.lstatSync(`static/games/${i}`).isDirectory()) {
      games.push(i)
      gamesData[i] = require(`./static/games/${i}/index.json`)
    }
  })
  return {games, gamesData}
})()

ejs.delimiter = ':'

app.set('view engine', 'html')
app.engine('html', ejs.renderFile)
app.locals.layout = 'layout'
app.locals.ui = require('./randomvictory_ui')

app.use('/static', express.static('static'))
app.use(require('express-ejs-layouts'))
app.use(require('serve-favicon')(path.join(__dirname, '/static/favicon.ico')))

app.get('/', (req, res) => {
  games = _.shuffle(games)
  let choices = []
  _.first(games, 3).forEach((game) => {
    choices.push(gamesData[game])
  })
  res.render('pages/index', {
    games: choices
  })
})

app.get('/:guid', (req, res) => {
  try {
    games = _.without(games, req.params.guid)
    res.render('pages/round', {
      game: gamesData[req.params.guid]
    })
  } catch (e) {}
})

app.listen(settings.get('port'), () => {
  console.log(`Listening for requests at http://localhost:${settings.get('port')}/`)
})
