const utils = require('./utils/utils');

const path = require('path');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const app = express();
const game = require('./services/game');
const port = 80;

var io = require('socket.io');

const playerIdLength = 20;

var rooms = [];

let main = this;

app.use(bodyParser.json());
app.use(express.static('./frontend'));
//app.engine('html');

const server = http.Server(app);
io = io.listen(server);
let defaultNamespace = io.of('/');

app.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, './frontend', 'index.html')
  );
});

app.post('/games', (req, res) => {
  let id = game.create();
  res.send({
    gameId: id
  });
});

app.post('/games/:gameId/players', function(req, res) {
  let opts = {
    gameId: req.params.gameId,
    player: {
      id: req.body.player.id,
      name: req.body.player.name
    }
  };

  let content = game.addPlayer(opts);
  res.send(content);
});

app.post('/games/:gameId/players/:playerId', (req, res) => {
  let opts = {
    player: {
      id: req.params.playerId
    },
    gameId: req.params.gameId
  }

  let content = game.update(opts);

  res.send(content);
});

app.post('/players', (req, res) => {
  let playerId = utils.generateId(playerIdLength);

  res.json({playerId: playerId});
});

defaultNamespace.on('connection', function(socket) {
  socket.on('disconnect', function(client) {
    var gameId = null;
    console.log('user disconnected');
    console.log(gameId);
    console.log(socket.adapter.rooms);
    defaultNamespace.to(gameId).emit('player-left', null);
  });

  socket.on('disconnecting', (data) => {
    socket.to(data.gameId).emit('player-disconnecting', data.playerId);
  });

  socket.on('player-ready', (data) => {
    let gameData = {
      gameId: data.gameId,
      player: {
        id: data.playerId
      }
    };
    let gameReady = game.readyPlayer(gameData);

    if (gameReady) {
      socket.to(gameData.gameId).emit('round-ready');
      
      console.log("game ready");
      
      game.startGame(socket, gameData);
    } else {
      socket.to(gameData.gameId).emit('waiting-for-players');
    }
    
    console.log(gameData);
    
  });

  socket.on('player-not-ready', (data) => {
    let gameData = {
      gameId: data.gameId,
      player: {
        id: data.playerId
      }
    };
    
    game.unReadyPlayer(gameData);

    socket.to(gameData.gameId).emit('waiting-for-players');
  
    console.log(gameData);
    
  });

  socket.on('player-scored', (data) => {
    // update game score
    console.log('Player scored!');
    console.log(data);
    defaultNamespace.to('fakeid').emit('player-scored-confirmed', {playerId: data.playerId, score: data.score});
  });

  socket.on('room', function(gameId) {
    console.log(gameId);
    socket.join(gameId, function() {
      let rooms = Object.keys(socket.rooms);
      console.log(rooms);
    });
    console.log(socket.adapter.rooms);
    console.log(`Player joined the room ${gameId}`);
  });

  socket.on('send-message', (messageData) => {
    console.log(messageData);
    defaultNamespace.to('fakeid').emit('message-sent', messageData)
  });
});

server.listen(port, function() {
  console.log(`server started on localhost:${port}`);
});