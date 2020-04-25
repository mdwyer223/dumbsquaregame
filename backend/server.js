/*
  NPM Libraries
*/
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
var io = require('socket.io');
const path = require('path');

/* 
  Services
*/
const player = require('./services/player');
const game = require('./services/game');

const app = express();
const port = 80;

app.use(bodyParser.json({
  type: "*"
}));
app.use(express.static('./frontend'));

const server = http.Server(app);
let socketListener = io.listen(server);
let defaultNamespace = socketListener.of('/');

/*
  ROUTES
*/
app.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, './frontend', 'index.html')
  );
});

app.get('/games', (req, res) => {
  let newGameId = game.generateNewId();
  res.json({ gameId: newGameId});
})

app.post('/games/:gameId', (req, res) => {
  let gameCreated = game.create(req.params);
  if(gameCreated) {
    res.json({gameId: req.params.gameId});
  } else {
    res.json({message: 'room in use'});
  }
});

app.post('/players', (req, res) => {
  let newPlayerId = player.generateNewId();
  res.json({ playerId: newPlayerId });
});


/* 
  NAMESPACES
*/
defaultNamespace.on('connection', function (socket) {

  socket.on('disconnect', function (socket) {
    console.log('user disconnected');
  });

  socket.on('join-room', function (gameId) {
    socket.join(gameId);
    console.log(`Player joined the room ${gameId}`);
  });

  socket.on('player-joined', (data) => {
    console.log(`Player joined ${data.player.name} ${data.player.id}`);

    let gameData = {
      gameId: data.gameId,
      player: {
        id: data.player.id,
        name: data.player.name
      },
      players: null
    };
    let players = game.addPlayer(gameData);

    gameData.players = players;

    defaultNamespace.to(data.gameId).emit('player-joined', gameData);
  });

  socket.on('player-left', (data) => {
    console.log(`Player left ${data.player.name} ${data.player.id}`)
    let playerInfo = {
      player: data.player
    }
    defaultNamespace.to(data.gameId).emit('player-left', playerInfo);
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
  });

  socket.on('player-ready', (data) => {
    let gameData = {
      gameId: data.gameId,
      player: data.player
    };
    let gameReady = game.readyPlayer(gameData);

    if (gameReady) {
      defaultNamespace.to(gameData.gameId).emit('round-ready');
      game.startGame(defaultNamespace, gameData);
    } else {
      defaultNamespace.to(gameData.gameId).emit('waiting-for-players');
    }
  });

  socket.on('player-scored', (data) => {
    defaultNamespace.to(data.gameId).emit('player-scored', {
      player: data.player,
      score: data.score
    });
  });

  socket.on('send-message', (data) => {
    console.log(`Sending message ${data.msg}...`);
    defaultNamespace.to(data.gameId).emit('message-sent', data)
  });
});


/*
  SERVER INITIALIZATION
*/
server.listen(port, function () {
  console.log(`server started on localhost:${port}`);
});
