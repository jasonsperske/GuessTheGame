/* globals $, ejs, clippy */
(function (window) {
  const ROUND_LENGTH = 6 * 60; //6:00 Per Round
  const RandomVictory = {
    ui: {
      compileTemplate (id) {
        return ejs.compile($('#' + id).html());
      },
      wallpaper (src, optTrack) {
        let path;
        if (typeof optTrack === 'undefined') {
          path = `images/${src}`;
        } else {
          path = `games/${src.game.guid}/${src.game.song[optTrack].wallpaper}`;
        }
        $('html').css({ 'background-image': `url(${path})` });
      },
      teams: [
        { guid: '000', name: 'Flower' },
        { guid: '001', name: 'Kooper' },
        { guid: '002', name: 'Spyhunter' },
        { guid: '003', name: 'Doom (night vision)' },
        { guid: '004', name: 'Knight' },
        { guid: '005', name: 'Mario Axe' },
        { guid: '006', name: 'Castlevania' },
        { guid: '007', name: 'Tetris' },
        { guid: '008', name: 'Mario Coin' },
        { guid: '009', name: 'Comix Zone' }
      ],
      async loadData (path) {
        return (async (path) => {
          const response = await fetch(path);
          return response.json();
        })(path);
      },
      /** adapted from https://stackoverflow.com/a/2450976/16959 */
      shuffle (array) {
        let currentIndex = array.length;
        let temporaryValue;
        let randomIndex;

        while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;

          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
        return array;
      }
    }
  };
  const canvas = $('#main');
  const template = {
    Leaderboard: RandomVictory.ui.compileTemplate('Leaderboard'),
    GameSelect: RandomVictory.ui.compileTemplate('GameSelect'),
    PlayRound: RandomVictory.ui.compileTemplate('PlayRound')
  };
  let cohost;

  RandomVictory.createNewPanel = async () => {
    const unplayedGames = await RandomVictory.ui.loadData('games/index.json');
    return {
      teams: RandomVictory.ui.shuffle(RandomVictory.ui.teams),
      unplayedGames: unplayedGames.games,
      playedCount: 0
    };
  };

  RandomVictory.loadPanel = async () => {
    let paxData = window.localStorage.getItem('GuessTheGame');
    if (paxData) {
      return JSON.parse(paxData);
    } else {
      let pax = await RandomVictory.createNewPanel();
      RandomVictory.savePanel(pax);
      return pax;
    }
  }
  RandomVictory.savePanel = (panel) => {
    window.localStorage.setItem('GuessTheGame', JSON.stringify(panel));
  }

  RandomVictory.showLeaderboard = async (panel) => {
    RandomVictory.ui.wallpaper('titlescreen.gif');
    panel.teams = panel.teams.sort((a, b) => {
      if (a.score && b.score) {
        return b.score - a.score;
      } else if (a.score) {
        return -1;
      } else if (b.score) {
        return 1;
      } else {
        return -1;
      }
    });
    canvas.html(template.Leaderboard(panel));
    document.onkeypress = async (e) => {
      if (e.charCode >= 48 && e.charCode <= 57) {
        if (e.charCode === 48) {
          panel.currentTeamIndex = 9;
        } else {
          panel.currentTeamIndex = e.charCode - 49;
        }

        panel.unplayedGames = RandomVictory.ui.shuffle(panel.unplayedGames);
        let games = panel.unplayedGames.slice(0,3);
        panel.games = [];
        for (let i = 0; i < games.length; i++) {
          panel.games[i] = await RandomVictory.ui.loadData(`games/${games[i]}/index.json`);
        }
        RandomVictory.offerChoices(panel);
      }
    };
  };

  RandomVictory.offerChoices = (panel) => {
    canvas.html(template.GameSelect(panel));

    clippy.load({ name: 'Clippy', path: 'images/agents/' },
      (agent) => {
        cohost = agent;
        cohost.show();
        cohost.speak('Welcome to your doom!');
      });

    document.onkeypress = (e) => {
      if (e.charCode >= 49 && e.charCode <= 51) {
        const gameIndex = e.charCode - 49;
        const game = $(`a[data-choice=${gameIndex}]`);
        if (game.length === 1) {
          let selected = game.attr('href').split('#')[1];
          panel.unplayedGames = panel.unplayedGames.filter(g => g !== selected);
          panel.game = panel.games[gameIndex];
          RandomVictory.playRound(panel);
        }
      }
    };
  };

  RandomVictory.playRound = (panel) => {
    RandomVictory.savePanel(panel);
    canvas.html(template.PlayRound(panel));

    const buttons = $('#Buttons');
    const clock = $('#Clock');
    const start = new Date();

    let gameTimer;
    let player;
    let currentTrack;
    let score = 0;

    function play (track) {
      currentTrack = track;
      $('[data-track].jp-playing-track').removeClass('jp-playing-track');
      $('[data-track=' + currentTrack + ']').addClass('jp-playing-track');
      if (panel.game.song[track].show) {
        RandomVictory.ui.wallpaper(panel, track);
        buttons.hide();
      } else {
        $('html').removeAttr('style');
        buttons.show();
      }
      console.log(panel.game.song[currentTrack].name);
      $('#jp_container_1').fadeIn();
      player.jPlayer('setMedia', {
        mp3: `games/${panel.game.guid}/${panel.game.song[currentTrack].song}`
      });
      player.jPlayer('play');
    }

    function time (start, end) {
      const duration = ROUND_LENGTH - ((end.getTime() - start.getTime()) / 1000);
      if (duration > 0) {
        const min = Math.floor((duration / 60) << 0);
        const sec = Math.floor(duration % 60);
        return min + ':' + (sec < 10 ? '0' + sec : sec);
      } else {
        return '0:00';
      }
    }
    function totalScore (optForceSave) {
      let revealed = 0;
      panel.game.song.forEach((song) => {
        if (song.show) {
          revealed += 1;
        }
      });
      if (optForceSave || revealed === panel.game.song.length) {
        panel.teams[panel.currentTeamIndex].score = score;
        RandomVictory.savePanel(panel);
      }
    }
    buttons.hide();

    player = $('#jplayer_1').jPlayer({
      ready() {
        $('#No').on('click', () => {
          player.jPlayer('play');
          $('html').removeClass('guessing');
          if (panel.game.song[currentTrack].hint.length > 0) {
            const hint = panel.game.song[currentTrack].hint.shift();
            console.log(panel.game.song[currentTrack].name + ':' + hint);
            cohost.speak(hint);
          } else {
            cohost.speak('There are no more hints!');
            panel.game.song[currentTrack].show = true;
            RandomVictory.ui.wallpaper(panel, currentTrack);
            $('[data-track=' + currentTrack + ']').html(panel.game.song[currentTrack].name);
            buttons.hide();
            totalScore();
          }
        });
        $('#Yes').on('click', () => {
          if (!panel.game.song[currentTrack].show) {
            let points = panel.game.song[currentTrack].hint.length + 1;
            player.jPlayer('play');
            $('html').removeClass('guessing');
            score += points;
            $('#Score').html(score);
            cohost.speak('+' + points + ' points!');
            panel.game.song[currentTrack].show = true;
            RandomVictory.ui.wallpaper(panel, currentTrack);
            $('[data-track=' + currentTrack + ']').html(panel.game.song[currentTrack].name);
            buttons.hide();
            totalScore();
          }
        });
        $('li[data-track]').on('click', (e) => {
          play($(e.currentTarget).data('track'));
        });
        gameTimer = setInterval(() => {
          let timeRemaining = time(start, new Date());
          clock.html(timeRemaining);
          if (timeRemaining === '0:00') {
            clearInterval(gameTimer);
            totalScore(true);
          }
        }, 500);
        $('li[data-track=0]').trigger('click');
        cohost.speak(panel.game.hint);
        console.log(panel.game.hint);
      },
      swfPath: 'js',
      supplied: 'mp3'
    }).on($.jPlayer.event.ended, () => {
      play(currentTrack);
    });

    document.onkeypress = (e) => {
      let keyMap = {
        '110' () {
          $('#No').trigger('click');1
        },
        '121' () {
          $('#Yes').trigger('click');
        },
        '103' () {
          // GUESS
          if (!panel.game.song[currentTrack].show) {
            player.jPlayer('pause');
            $('html').addClass('guessing');
          }
        }
      };
      if (e.charCode >= 48 && e.charCode <= 57) {
        if (e.charCode === 48) {
          $('[data-track=9]').trigger('click');
        } else {
          $('[data-track=' + (e.charCode - 49) + ']').trigger('click');
        }
      } else if (keyMap.hasOwnProperty(e.charCode)) {
        keyMap[e.charCode]();
      }
    };
  };

  RandomVictory.start = async () => {
    let paxData = await RandomVictory.loadPanel();
    RandomVictory.showLeaderboard(paxData);
  };

  window.RandomVictory = RandomVictory;
})(window);
