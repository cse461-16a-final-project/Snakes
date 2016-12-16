# Snakes
## Frameworks
* Client-side: Phaser.io
* Server-side: Socket.io
  * requiredPackages: Flask, eventlet, python-socketio

## Gamestate
```{"ping": 141428290002, "foods": [[13, 49]], "snakes": [{"body": [[66, 33]], "sid": "dc514ab3dafb400bba7edfbfe27c3bd5"}]}```
```js
GameState: {
  snakes: [
    {
      body, // Array[(x, y)]
      name,
      dir,
      score
    },
    {
      body, // Array[(x, y)]
      name,
      dir,
      score
    },
    ...
  ],
  food: {
    pos
  },
  map: {
    size
  }
}
```
## Workflow
Enter website -> Enter player name -> Play the game -> Death, respawn

## Components
* Main canvas managed by Phaser
* Rank board
