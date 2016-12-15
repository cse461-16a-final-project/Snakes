/*var data = {
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

    "foods": {
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
};*/

var config = {

    resolution: { W: 1000, H: 800 },

    mapResolution: { W: 800, H: 800 },

    mapSize: { W: 80, H: 80 },

};

var mainState = function(game) {
    this.soc;

    this.gameState = {foods: [], snakes: []};
    //    this.shouldUpdate;

    this.dx, this.dy;

    this.snakes;
    this.foods;
    this.scores;

    this.backgroundImage;

    // user input
    this.upKey;
    this.downKey;
    this.leftKey;
    this.rightKey;

    this.startButton;
};

mainState.prototype = {
    preload: function() {
        this.soc = io({transports: ['websocket'], upgrade: false});
        this.soc.on('game_state', function(event) {
            console.log('===== event =====');
            console.log(event);
            console.log('=================');
            this.gameState = JSON.parse(event);
            //            this.shouldUpdate = true;
        });

        this.backgroundImage = game.load.image('background', 'img/background.jpg');
        game.load.spritesheet('button', 'img/startButton.png');
        /*this.shouldUpdate = true;*/
    },

    create: function() {
        this.dx = config.mapResolution.H / config.mapSize.H;
        this.dy = config.mapResolution.W / config.mapSize.W;

        game.add.image(0, 0, 'background');

        this.snakes = game.add.group();
        this.foods = game.add.group();

        this.scores = [];

        this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

        this.startButton = game.add.button(810, 725, 'button', this.actionOnClick, this, 2, 1, 0);
        this.startButton.width = 180;
    },

    update: function() {
        /*this.gameState = data;*/

        //        if (this.shouldUpdate) {
        console.log('===== state =====');
        console.log(this.gameState);
        console.log('=================');
        this.renderfoods();
        this.renderSnakes();
        //            this.shouldUpdate = false;
        //        }

        // keyboard user input
        if (this.upKey.isDown) {
            this.soc.emit('key', Phaser.KeyCode.UP);
        } else if (this.downKey.isDown) {
            this.soc.emit('key', Phaser.KeyCode.DOWN);
        } else if (this.leftKey.isDown) {
            this.soc.emit('key', Phaser.KeyCode.LEFT);
        } else if (this.rightKey.isDown) {
            this.soc.emit('key', Phaser.KeyCode.RIGHT);
        }

        // get the next round of socket
        this.soc.onmessage = function(event) {

            this.gameState = JSON.parse(event.data);
            //            this.shouldUpdate = true;
        }

    },

    renderfoods: function() {
        this.foods.removeAll(true);
        this.gameState.foods.map((foods) => {
            this.foods.add(this.renderSection(foods[0] * this.dx, foods[1] * this.dy, 0xF4DC42, 'foods'));
        });
    },

    renderSnakes: function() {
        // Clear the previously rendered snakes
        this.snakes.removeAll(true);

        this.gameState.snakes.map((snake) => {
            let color = parseInt(Util.intToRgb(Util.hashCode(snake.name)), 16);
            snake.body.map((section, i) => {
                let sectionImg = this.renderSection(section[0] * this.dx, section[1] * this.dy, color, 'snake');

                sectionImg.addChild(this.renderSection(0, 0, 0xFFFFFF, 'snake-overlay', i))
                this.snakes.add(sectionImg);
            });
        });
    },

    renderSection: function(x, y, color, type, i=0) {

        let img = game.add.image(x, y);
        let graphics = game.add.graphics(0, 0);
        graphics.beginFill(color);
        if (type.startsWith('snake')) {
            graphics.drawRect(0, 0, this.dx, this.dy);
        } else if (type === 'foods') {
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

    generateRandomUserId: function(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i = 0; i < length; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },

    actionOnClick: function() {
        this.soc.emit('new_user', this.generateRandomUserId(8));
    },
};

var game = new Phaser.Game(config.resolution.W, config.resolution.H, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');