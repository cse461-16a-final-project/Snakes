var config = {

    resolution: { W: 1024, H: 800 },

    mapResolution: { W: 800, H: 800 },

    mapSize: { W: 80, H: 80 },

};

var mainState = function(game) {
    this.gameState;
    this.soc;

    this.dx, this.dy;

    this.snakes;
    this.food;
    this.scores;
};

mainState.prototype = {
    preload: function() {
        this.soc = new WebSocket('ws://localhost:8000', ['game_state', 'key', 'new_user']);
        this.soc.onmessage = function(event) {
            this.gameState = JSON.parse(event.data);
        }
    },

    create: function() {
        this.dx = config.mapResolution.H / config.mapSize.H;
        this.dy = config.mapResolution.W / config.mapSize.W;

        this.snakes = game.add.group();
        this.food = game.add.group();

        this.scores = [];
    },

    update: function() {

    },
    
    renderFood: function() {
        
    }

    renderSnakes: function() {
        let newSnakes = [];
        this.gameState.snakes.map((snake) => {
            let color = Util.intToRgb(Util.hashCode(snake.name));
            snake.body.map((section) => {
                let sectionSprite = game.add.sprite();
                newSnakes.push(this.renderSection(section.x, section.y, color));
            });
        });
    },

    renderSection: function(x, y, color) {
        let img = game.add.image(x, y);
        let graphics = game.add.graphic(x, y);
        graphics.beginFill(color);
        graphics.drawRect(0, 0, dx, dy);
        graphics.endFill();
        img.addChild(graphics);
        return img;
    }
};

var game = new Phaser.Game(config.resolution.W, config.resolution.H, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');