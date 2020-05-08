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
});

app.get('/games/count', (req, res) => {
  res.json(game.getRoomsAndPlayers());
})

app.post('/games/:gameId/:maxPlayers/:pointsPerRound', (req, res) => {
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

app.get('/players/names', (req, res) => {
  let newPlayerName = player.generateName();
  res.json({ playerName: newPlayerName });
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
      player: data.player,
      players: null
    };
    let players = game.addPlayer(gameData);

    if (players.error) {
      let rejectData = {
        gameId: gameData.gameId,
        player: data.player,
        error: players.error
      };
      defaultNamespace.to(data.gameId).emit('player-cannot-join', rejectData);
    }

    gameData.players = players;

    console.log(gameData.players);

    defaultNamespace.to(data.gameId).emit('player-joined', gameData);
  });

  socket.on('player-left', (data) => {
    console.log(`Player left ${data.player.name} ${data.player.id}`)
    let playerInfo = {
      player: data.player
    }

    let gameData = {
      gameId: data.gameId,
      player: data.player
    };
    game.removePlayer(gameData);

    defaultNamespace.to(data.gameId).emit('player-left', playerInfo);
  });

  socket.on('player-not-ready', (data) => {
    let gameData = {
      gameId: data.gameId,
      player: data.player
    };
    let readyState = game.unReadyPlayer(gameData);
    defaultNamespace.to(gameData.gameId).emit('waiting-for-players', readyState);
  });

  socket.on('player-ready', function(data) {
    let gameData = {
      gameId: data.gameId,
      player: data.player
    };

    console.log('Readying player from socket event!');
    console.log(gameData.player.id);

    let readyState = game.readyPlayer(gameData);

    if (readyState.gameReady) {
      let squareData = game.spawnSquare(gameData);
      defaultNamespace.to(gameData.gameId).emit('square-spawn', squareData);
      defaultNamespace.to(gameData.gameId).emit('round-ready', readyState);
      defaultNamespace.to(gameData.gameId).emit('round-start');
    } else {
      defaultNamespace.to(gameData.gameId).emit('waiting-for-players', readyState);
    }
  });

  socket.on('player-scored', (data) => {
    console.log(`Player (${data.player.id}) scored`);

    let scoreData = {
      gameId: data.gameId,
      player: data.player
    };

    scoreData = game.score(scoreData);

    if(!scoreData) { return; }

    if (scoreData.winner) {
      defaultNamespace.to(scoreData.gameId).emit('player-won-round', scoreData);
      game.resetRounds({gameId: scoreData.gameId});
    } else {
      defaultNamespace.to(data.gameId).emit('player-scored', scoreData);
    }    
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
