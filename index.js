const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const game = require('./services/game');
const port = 80;

app.use(bodyParser.json());
//app.engine('html');

app.get('/', (req, res) => {
  res.render('./frontend/index.html');
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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});