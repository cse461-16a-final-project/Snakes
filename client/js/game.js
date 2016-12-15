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
    this.shouldUpdate;

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
    this.colors;
    this.rankTexts;
};

var log = function(head, o) {
    console.log('===== ' + head + ' =====');
    console.log(o);
    console.log('=================');
}

mainState.prototype = {
    preload: function() {
        this.soc = io({transports: ['websocket'], upgrade: false});

        var updateState = function(event) {
            //log('event', event);
            this.gameState = JSON.parse(event);
            //log('local', this.gameState);
            this.shouldUpdate = true;
        }.bind(this);

        this.soc.on('game_state', updateState);

        this.backgroundImage = game.load.image('background', 'img/background.jpg');
        game.load.spritesheet('button', 'img/startButton.png');
        /*this.shouldUpdate = true;*/
        
        this.colors = ["#ffd700", "#c0c0c0", "#b87333"];
        this.rankTexts = [null, null, null];
    },

    create: function() {
        this.dx = config.mapResolution.H / config.mapSize.H;
        this.dy = config.mapResolution.W / config.mapSize.W;

        game.add.image(0, 0, 'background');

        this.snakes = game.add.group();
        this.foods = game.add.group();

        this.scores = [];

        var keyPressed = function(keyCode) {
            this.soc.emit('key', keyCode);
        }

        this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

        this.upKey.onDown.add(() => { this.soc.emit('key', Phaser.KeyCode.UP); }, this);
        this.downKey.onDown.add(() => { this.soc.emit('key', Phaser.KeyCode.DOWN); }, this);
        this.leftKey.onDown.add(() => { this.soc.emit('key', Phaser.KeyCode.LEFT); }, this);
        this.rightKey.onDown.add(() => { this.soc.emit('key', Phaser.KeyCode.RIGHT); }, this);

        this.startButton = game.add.button(810, 725, 'button', this.actionOnClick, this, 2, 1, 0);
        this.startButton.width = 180;
        
        for ( var i = 0; i < 3; i++ ) {
            game.add.text(800, 100*i, (i+1) + "th place:", {font: "30px Arial", fill: this.colors[i]} );
        }
    },

    update: function() {
        /*this.gameState = data;*/

        if (this.shouldUpdate) {
            //log('state', this.gameState);
            this.renderfoods();
            this.renderSnakes();
            this.renderScores();
            this.shouldUpdate = false;
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
    
    renderScores: function() {
        this.scores = [];
        
        let first_score = 0;
        let second_score = 0;
        let third_score = 0;
        let first_name = "";
        let second_name = "";
        let third_name = "";
        
        this.gameState.snakes.map((snake) => {
            let score = snake.body.length;
            
            if (score > first_score) {
                // update the 2ed and 3rd place before update itself
                third_name = second_name;
                third_score = second_score;
                second_name = first_name;
                second_score = first_score;
                
                first_name = snake.name;
                first_score = score;
            } else if (score > second_score) {
                // update the 3rd place before update itself
                third_name = second_name;
                third_score = second_score;
                
                second_name = snake.name;
                second_score = score;
            } else if (score > third_score) {
                third_name = snake.name;
                third_score = score;
            }
            
        });
        
        this.displayScore(first_name, first_score, second_name, second_score, third_name, third_score);
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
            img.alpha = Math.max(0, 1 - 1 / Math.log((i + 1), 2));
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
    
    displayScore: function(fn, fs, sn, ss, tn, ts) {
        var names = [fn, sn, tn];
        var scores = [fs, ss, ts];
        
        for ( var i = 0; i < 3; i++ ) {
            if (names[i] != "") {
                if (this.rankTexts[i] != null)
                    this.rankTexts[i].destroy();
                this.rankTexts[i] = game.add.text(800, 50+100*i, names[i] + "    "+ scores[i], {font: "20px Arial", fill: this.colors[i]} );
            }
        }
    }
};

var game = new Phaser.Game(config.resolution.W, config.resolution.H, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');