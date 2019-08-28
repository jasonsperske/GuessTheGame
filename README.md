# GuessTheGame
A simple game to play with a room full of awesome people.

## How to run a full panel
This software will run a full panel by reading the contents of a file called `rootPath/games/index.json` file (which is .gitignored).  The contents are an array of the available games like this:

    {
      "games": [
        "AsSeenOnTV",
        "ComicsGames",
        "ThumbsArntEnought"
      ]
    }

## How to create a round
Games are defined in folders created in the `/rootPath/games` directory.  Simple create a new folder, and add an `index.json` with your game information.  An example of such a game might look like this:

    {
      "guid": "NotAGame",
      "name": "#NotAGame",
      "platforms": "It would give it away",
      "hint": "None of these are games",
      "song": [
        {
          "hint": [
            "This might look like a game but it is in fact BS",
            "Was released on the NES and responsible for ruining Christmas of @SND_TST and @DarkRoadRun",
            "While they aren't bitter they would like you to know this was not a game"
          ],
          "name": "Amagon",
          "song": "Amagon-title-song.mp3",
          "wallpaper": "Amagon.png"
        }
      ]
    }

Next you will need to place the song and wallpaper files inside this directory.  When you startup the node server it will detect this game and add it to the list of available games.

## How to run this software
Any program that can host a static folder on a port via HTTP will work. Here are some approaches that work:

Python 3.6+

    cd rootPath
    python3 -m http.server 9000
