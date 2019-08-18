/* globals $, ejs, clippy */
(function (window) {
  const RandomVictory = {
    ui: {
      compileTemplate (id) {
        return ejs.compile($('#' + id).html());
      },
      wallpaper (src, optTrack) {
        let path;
        if (optTrack) {
          path = `games/${src.game.guid}/${src.song[track].wallpaper}`;
        } else {
          path = `images/${src}`;
        }
        $('html').css({ 'background-image': `url(${path})` });
      },
      template: {},
      teams: [
        { guid: '000', name: 'Mortal Kombat' },
        { guid: '001', name: 'Tetris' },
        { guid: '002', name: 'Super Metroid' },
        { guid: '003', name: 'Sonic' },
        { guid: '004', name: 'Star Fox' },
        { guid: '005', name: 'Skulls' },
        { guid: '006', name: 'Mega Man' },
        { guid: '007', name: 'Mario' },
        { guid: '008', name: 'Donkey Kong' },
        { guid: '009', name: 'Space Invaders' }
      ]
    }
  };

  RandomVictory.ui.template.leaderBoard = RandomVictory.ui.compileTemplate('leaderBoard');

  RandomVictory.showLeaderboard = () => {

  };
  RandomVictory.offerChoices = (team) => {
    clippy.load({ name: 'Clippy', path: 'images/agents/' },
      (agent) => {
        agent.show();
        agent.speak('Welcome to your doom!');
      });

    document.onkeypress = (e) => {
      const game = $('a[data-choice=' + (e.charCode - 48) + ']');
      if (game.length === 1) {
        window.location.href = game.attr('href');
      }
    };
  };

  RandomVictory.playRound = (round) => {
    const buttons = $('#Buttons');
    const clock = $('#Clock');
    const start = new Date();

    let player;
    let agent;
    let currentTrack;
    let score = 0;

    function play (track) {
      currentTrack = track;
      if (round.song[track].show) {
        RandomVictory.ui.wallpaper(round, track);
        buttons.hide();
      } else {
        $('html').removeAttr('style');
        buttons.show();
      }
      console.log(round.song[currentTrack].name);
      $('#jp_container_1').fadeIn();
      player.jPlayer('setMedia', {
        mp3: `games/${round.game.guid}/${round.song[track].song}`
      });
      player.jPlayer('play');
    }

    function time (start, end) {
      // 6:00 on the clock
      const duration = (6 * 60) - ((end.getTime() - start.getTime()) / 1000);
      if (duration > 0) {
        const min = Math.floor((duration / 60) << 0);
        const sec = Math.floor(duration % 60);
        return min + ':' + (sec < 10 ? '0' + sec : sec);
      } else {
        return '0:00';
      }
    }

    buttons.hide();

    clippy.load({ name: 'Clippy', path: 'images/agents/' }, (_agent) => {
      agent = _agent;
      agent.show();
      player = $('#jplayer_1').jPlayer({
        ready() {
          $('#No').on('click', () => {
            player.jPlayer('play');
            $('html').removeClass('guessing');
            if (round.song[currentTrack].hint.length > 0) {
              const hint = round.song[currentTrack].hint.shift();
              console.log(round.song[currentTrack].name + ':' + hint);
              agent.speak(hint);
            } else {
              agent.speak('There are no more hints!');
              round.song[currentTrack].show = true;
              RandomVictory.ui.wallpaper(round, track);
              $('[data-track=' + currentTrack + ']').html(round.song[currentTrack].name);
              buttons.hide();
            }
          });
          $('#Yes').on('click', () => {
            let points = round.song[currentTrack].hint.length + 1;
            player.jPlayer('play');
            $('html').removeClass('guessing');
            score += points;
            $('#Score').html(score);
            agent.speak('+' + points + ' points!');
            round.song[currentTrack].show = true;
            RandomVictory.ui.wallpaper(round, track);
            $('[data-track=' + currentTrack + ']').html(round.song[currentTrack].name);
            buttons.hide();
          });
          $('[data-track]').on('click', () => {
            play($(this).data('track'));
          });
          setInterval(() => {
            clock.html(time(start, new Date()));
          }, 500);
          $('[data-track=0]').trigger('click');
          agent.speak(round.game.hint);
          console.log(round.game.hint);
        },
        swfPath: 'js',
        supplied: 'mp3'
      }).on($.jPlayer.event.ended, () => {
        play(currentTrack);
      });
    });

    document.onkeypress = (e) => {
      let keyMap = {
        '110' () {
          $('#No').trigger('click');
        },
        '121' () {
          $('#Yes').trigger('click');
        },
        '103' () {
          // GUESS
          if (!round.song[currentTrack].show) {
            player.jPlayer('pause');
            $('html').addClass('guessing');
          }
        }
      };
      if (e.charCode >= 48 && e.charCode <= 57) {
        if (round.song[currentTrack].show) {
          if (e.charCode === 48) {
            $('[data-track=9]').trigger('click');
          } else {
            $('[data-track=' + (e.charCode - 49) + ']').trigger('click');
          }
        }
      } else if (keyMap.hasOwnProperty(e.charCode)) {
        keyMap[e.charCode]();
      }
    };
  };

  window.RandomVictory = RandomVictory;
})(window);
