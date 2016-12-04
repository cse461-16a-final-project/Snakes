# Snakes
## Frameworks
* Client-side: Phaser.io
* Server-side: Socket.io

## Gamestate
```js
GameState: {
  Snake: {
    body, // Array[(x, y)]
    name,
    dir
  },
  Food: {
    pos
  },
  Map: {
    size
  }
}
```
## Workflow
Enter website -> Enter player name -> Play the game -> Death, respawn

## Components
* Main canvas managed by Phaser
* Rank board
* Killfeed/Notifications
