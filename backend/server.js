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
const mail = require('./services/mail');
const config = require('./config')

const app = express();
const port = 80;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
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

app.post('/admin/delete/games/:gameId', (req, res) => {
  if (req.query.p !== config.admin.password) {
    res.json({'message': 'nice try hacker'});
    return;
  }

  let data = {
    gameId: req.params.gameId
  };
  defaultNamespace.to(data.gameId).emit('nuke-room');
  game.delete(data);

  res.json({'message': 'room is being destroyed...'});
});

app.post('/feedback', (req, res) => {
  let data = req.body;
  mail.sendmail(data.subject, data.message);
  res.json({'message': 'success'})
});

app.get('/games', (req, res) => {
  let roomResponse = game.getRooms();
  res.json(roomResponse);
});

app.post('/games', (req, res) => {
  let newGameId = game.generateNewId();
  res.json({ gameId: newGameId});
});

app.get('/games/count', (req, res) => {
  res.json(game.getRoomsAndPlayers());
});

app.get('/games/:gameId', (req, res) => {
  res.sendFile(
    path.join(__dirname, './frontend', 'index.html')
  );
});

app.get('/games/:gameId/validate', (req, res) => {
  let password = req.query.p;
  let gameId = req.params.gameId;

  let data = game.checkPassword(gameId, password);
  res.json({error: data})
});

/*
  /games/dog/2/10?p=123
*/
app.post('/games/:playerId/:gameId/:maxPlayers/:pointsPerRound', (req, res) => {
  let password = req.query.p;
  let gameCreated = game.create(req.params, password);
  if(gameCreated) {
    res.json({gameId: req.params.gameId});
  } else {
    res.json({message: 'room in use'});
  }
});

app.get('/leave/:playerId', (req, res) => {
  game.leaver({playerId: req.params.playerId});
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
    console.log(socket);
    console.log('user disconnected');
  });

  socket.on('join-room', function (gameId) {
    socket.join(gameId);
    console.log(`Player joined the room ${gameId}`);
  });

  socket.on('kick-player', (data) => {
    let validKick = game.kickPlayer(data);

    data['validKick'] = validKick;

    defaultNamespace.to(data.gameId).emit('kick-player', data);
  });

  socket.on('player-joined', (data) => {
    console.log(`Player joined ${data.player.name} ${data.player.id}`);

    let gameData = {
      gameId: data.gameId,
      player: data.player,
      players: null,
      password: data.password,
      roundReset: false
    };
    let addPlayerInfo = game.addPlayer(gameData);

    if (addPlayerInfo.error) {
      let rejectData = {
        gameId: gameData.gameId,
        player: data.player,
        error: addPlayerInfo.error
      };
      defaultNamespace.to(data.gameId).emit('player-cannot-join', rejectData);
    }

    gameData.players = addPlayerInfo.players;
    gameData.roundReset = addPlayerInfo.roundReset;
    gameData.numPoints = addPlayerInfo.numPoints;
    defaultNamespace.to(data.gameId).emit('player-joined', gameData);
  });

  socket.on('player-left', (data) => {
    console.log(`Player left ${data.player.id}`)
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
    if(data.msg.includes('!kick')) {
      let kickData = data.msg.split(' ');
      if (kickData.length == 2){
        let opts = {
          gameId: data.gameId,
          player: {
            id: kickData[1]
          },
          owner: data.player.id
        }
        let validKick = game.kickPlayer(opts);
        opts['validKick'] = validKick;

        defaultNamespace.to(opts.gameId).emit('kick-player', opts);
      }
    }
    defaultNamespace.to(data.gameId).emit('message-sent', data)
  });

  socket.on('send-mouse-coords', (data) => {
    defaultNamespace.to(data.gameId).emit('update-mouse-coords', data);
  })
});


/*
  SERVER INITIALIZATION
*/
server.listen(port, function () {
  console.log(`server started on localhost:${port}`);
});
