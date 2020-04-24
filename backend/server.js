/*
  NPM Libraries
*/
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const path = require('path');

/* 
  Services
*/
const player = require('./services/player');
const game = require('./services/game');

const app = express();
const port = 80;

var io = require('socket.io');

app.use(bodyParser.json({
  type: "*"
}));
app.use(express.static('./frontend'));

const server = http.Server(app);
io = io.listen(server);
let defaultNamespace = io.of('/');

/*
  ROUTES
*/
app.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, './frontend', 'index.html')
  );
});

app.post('/games/:gameId', (req, res) => {
  let gameCreated = game.create(req.params.gameId);

  if(gameCreated) {
    res.json({gameId: req.params.gameId});
  } else {
    res.json({message: 'room in use'});
  }
});

app.post('/players', (req, res) => {
  let playerId = player.generateNewId();

  res.json({
    playerId: playerId
  });
});


/* 
  NAMESPACES
*/
defaultNamespace.on('connection', function (socket) {
  socket.on('disconnect', function (socket) {
    console.log('user disconnected');
  });

  socket.on('player-left', (data) => {
    let playerInfo = {
      player: {
        id: data.playerId,
      }
    }
    defaultNamespace.to(data.gameId).emit('player-left', playerInfo);
  });

  socket.on('player-joined', (data) => {
    console.log('Player joined!');
    console.log(data);

    let gameData = {
      gameId: data.gameId,
      player: {
        id: data.player.id,
        name: data.player.name
      }
    };
    game.addPlayer(gameData);

    defaultNamespace.to(data.gameId).emit('player-joined', gameData);
  });

  socket.on('player-ready', (data) => {
    let gameData = {
      gameId: data.gameId,
      player: {
        id: data.playerId
      }
    };
    console.log('Player ready: ' + gameData);
    let gameReady = game.readyPlayer(gameData);

    if (gameReady) {
      console.log('Round ready!');
      defaultNamespace.to(gameData.gameId).emit('round-ready');
      game.startGame(defaultNamespace, gameData);
    } else {
      defaultNamespace.to(gameData.gameId).emit('waiting-for-players');
    }
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

  socket.on('player-scored', (data) => {
    defaultNamespace.to(data.gameId).emit('player-scored-confirmed', {
      playerId: data.playerId,
      score: data.score
    });
  });

  socket.on('join-room', function (gameId) {
    socket.join(gameId);
    console.log(`Player joined the room ${gameId}`);
  });

  socket.on('send-message', (data) => {
    defaultNamespace.to(data.gameId).emit('message-sent', data)
  });
});


/*
  SERVER INITIALIZATION
*/
server.listen(port, function () {
  console.log(`server started on localhost:${port}`);
});
