var data = {
    "snakes": [{
        "body": [{
            "x": 3,
            "y": 6
        }, {
            "x": 4,
            "y": 6
        }, {
            "x": 4,
            "y": 5
        }],
        "name": "TestTestTest",
        "dir": 1,
        "score": 10
    }, {
        "body": [{
            "x": 41,
            "y": 42
        }, {
            "x": 42,
            "y": 42
        }, {
            "x": 42,
            "y": 43
        }, {
            "x": 42,
            "y": 44
        }, {
            "x": 42,
            "y": 45
        }, {
            "x": 42,
            "y": 46
        },{
            "x": 42,
            "y": 47
        },{
            "x": 42,
            "y": 48
        },{
            "x": 42,
            "y": 49
        },{
            "x": 42,
            "y": 50
        },{
            "x": 43,
            "y": 50
        },{
            "x": 43,
            "y": 51
        },{
            "x": 44,
            "y": 51
        }],
        "name": "YesYesYes",
        "dir": "",
        "score": 21
    }],

    "food": {
        "pos": [{
            "x": 2,
            "y": 1
        }, {
            "x": 56,
            "y": 34
        }, {
            "x": 79,
            "y": 3
        }]
    }
};

var config = {

    resolution: { W: 800, H: 800 },

    mapResolution: { W: 800, H: 800 },

    mapSize: { W: 80, H: 80 },

};

var mainState = function(game) {
    this.soc;

    this.gameState;
    this.shouldUpdate;

    this.dx, this.dy;

    this.snakes;
    this.food;
    this.scores;

    this.backgroundImage;
};

mainState.prototype = {
    preload: function() {
        /*this.soc = new WebSocket('ws://localhost:8000', ['game_state', 'key', 'new_user']);
        this.soc.onmessage = function(event) {
            this.gameState = JSON.parse(event.data);
            this.shouldUpdate = true;
        }*/

        this.backgroundImage = game.load.image('background', 'img/background.jpg');
        this.shouldUpdate = true;
    },

    create: function() {
        this.dx = config.mapResolution.H / config.mapSize.H;
        this.dy = config.mapResolution.W / config.mapSize.W;

        game.add.image(0, 0, 'background');

        this.snakes = game.add.group();
        this.food = game.add.group();

        this.scores = [];

    },

    update: function() {
        this.gameState = data;

        if (this.shouldUpdate) {
            this.renderFood();
            this.renderSnakes();
            this.shouldUpdate = false;
        }

    },

    renderFood: function() {
        this.food.removeAll(true);
        this.gameState.food.pos.map((food) => {
            this.food.add(this.renderSection(food.x * this.dx, food.y * this.dy, 0xF4DC42, 'food'));
        });
    },

    renderSnakes: function() {
        // Clear the previously rendered snakes
        this.snakes.removeAll(true);

        this.gameState.snakes.map((snake) => {
            let color = parseInt(Util.intToRgb(Util.hashCode(snake.name)), 16);
            snake.body.map((section, i) => {
                let sectionImg = this.renderSection(section.x * this.dx, section.y * this.dy, color, 'snake');
                sectionImg.addChild(this.renderSection(0, 0, 0xFFFFFF, 'snake-overlay', i))
                this.snakes.add(sectionImg);
                console.log(sectionImg.tint);
            });
        });
    },

    renderSection: function(x, y, color, type, i=0) {
        let img = game.add.image(x, y);
        let graphics = game.add.graphics(0, 0);
        graphics.beginFill(color);
        if (type.startsWith('snake')) {
            graphics.drawRect(0, 0, this.dx, this.dy);
        } else if (type === 'food') {
            let d = Math.min(this.dx, this.dy);
            graphics.drawCircle(d/2, d/2, d);
        }
        graphics.endFill();
        img.addChild(graphics);
        if (type === 'snake-overlay'){
            img.alpha = Math.max(0, 0.8 / (i + 1));
        }
        
        return img;
    },
};

var game = new Phaser.Game(config.resolution.W, config.resolution.H, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');