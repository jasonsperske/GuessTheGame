/* globals $, ejs, clippy, RandomVictory */
;(window => {
  'use strict'
  const RandomVictory = {
    ui: {
      template(id, data) {
        const output = $('#' + id)
        const template = ejs.compile($('#' + output.data('template')).html())
        output.append(template(data))
      },
      compileTemplate(id) {
        return ejs.compile($('#' + id).html())
      }
    }
  }

  RandomVictory.offerChoices = (team) => {
    clippy.load({name:'Clippy', path:'images/agents/'}, (agent) => {
      agent.show()
      agent.speak('Welcome to your doom!')
    })
    document.onkeypress = (e) => {
      const game = $('a[data-choice='+(e.charCode - 48)+']')
      if (game.length === 1) {
        window.location.href = game.attr('href')
      }
    }
  }

  RandomVictory.playRound = (round) => {
    const buttons = $('#Buttons')
    const clock = $('#Clock')
    const start = new Date()
    const player
    const agent

    let current_track
    let score = 0

    function play(track) {
      current_track = track
      if (round.song[track].show) {
        $('html').css({
          'background-image':`url(/games/${round.game.guid}/${round.song[track].wallpaper})`
        })
        buttons.hide()
      } else {
        $('html').removeAttr('style')
        buttons.show()
      }
      console.log(round.song[current_track].name)
      $('#jp_container_1').fadeIn()
      player.jPlayer('setMedia', {
        mp3: `/games/${round.game.guid}/${round.song[track].song}`
      }).jPlayer('play')
    }

    function time(start, end) {
      const duration = (6*60)-((end.getTime() - start.getTime())/1000) //6:00 on the clock
      if (duration > 0) {
        const min = Math.floor((duration / 60) << 0)
        const sec = Math.floor(duration % 60)
        return min + ':' + (sec < 10 ? '0' + sec : sec)
      } else {
        return '0:00'
      }
    }

    buttons.hide()
    clippy.load({name:'Clippy', path:'/images/agents/'}, (_agent) => {
      agent = _agent
      agent.show()
      player = $('#jplayer_1').jPlayer({
	      ready: () => {
          $('#No').on('click', () => {
            player.jPlayer('play')
            $('html').removeClass('guessing')
            if (round.song[current_track].hint.length > 0) {
              const hint = round.song[current_track].hint.shift()
              console.log(round.song[current_track].name+':'+hint)
              agent.speak(hint)
            } else {
              agent.speak('There are no more hints!')
              round.song[current_track].show = true
              $('html').css({
                'background-image': `url(/games/${round.game.guid}/${round.song[current_track].wallpaper})`
              })
              $('[data-track='+current_track+']').html(round.song[current_track].name)
              buttons.hide()
            }
          })
          $('#Yes').on('click', () => {
            let points = round.song[current_track].hint.length+1
            player.jPlayer('play')
            $('html').removeClass('guessing')
            score += points
            $('#Score').html(score)
            agent.speak('+'+points+' points!')
            round.song[current_track].show = true
            $('html').css({
              'background-image': `url(/games/${round.game.guid}/${round.song[current_track].wallpaper})`
            })
            $('[data-track='+current_track+']').html(round.song[current_track].name)
            buttons.hide()
          })
        $('[data-track]').on('click', function () {
          play($(this).data('track'))
        })
        setInterval(() => {
          clock.html(time(start, new Date()))
        }, 500)
        $('[data-track=0]').trigger('click')
        agent.speak(rount.game.hint)
        console.log(round.game.hint)
			},
      swfPath: '/js',
      supplied: 'mp3'
    }).on($.jPlayer.event.ended, () => {
		 play(current_track)
    })
  })
  document.onkeypress = function (e) {
    var event = e || window.event
    var keyMap = {
      110: function () {
        $('#No').trigger('click')
      },
      121: function () {
        $('#Yes').trigger('click')
      },
      103: function () {
        // GUESS
        if(!round.song[current_track].show) {
          player.jPlayer('pause')
          $('html').addClass('guessing')
        }
      }
    }
    if (event.charCode >= 48 && event.charCode <= 57) {
      if(round.song[current_track].show) {
        if (event.charCode == 48) {
          $('[data-track=9]').trigger('click')
        } else {
          $('[data-track='+(event.charCode-49)+']').trigger('click')
        }
      }
    } else if (keyMap.hasOwnProperty(event.charCode)) {
      keyMap[event.charCode]()
    }
  }
  }
}
  window.RandomVictory = RandomVictory
})(window)
$(() => {

})
