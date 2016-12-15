var config = {

    resolution: { W: 1000, H: 800 },

    mapResolution: { W: 800, H: 800 },

    mapSize: { W: 80, H: 80 },

};

var mainState = function(game) {
    this.soc;

    this.gameState = {foods: [], snakes: []};
    this.dx, this.dy;

    this.snakes;
    this.foods;
    this.scores;
    this.isAlive;

    this.backgroundImage;

    // user input
    this.upKey;
    this.downKey;
    this.leftKey;
    this.rightKey;

    this.startButton;
    this.colors;
    this.rankTexts;
    this.clientScoreText;
    this.nameInput;
    this.colorStr;
    this.pingText;
};

var log = function(head, o) {
    console.log('===== ' + head + ' =====');
    console.log(o);
    console.log('=================');
}

mainState.prototype = {
    preload: function() {
        game.add.plugin(Fabrique.Plugins.InputField);
        this.renderfoods = this.renderfoods.bind(this);
        this.renderSnakes = this.renderSnakes.bind(this);
        this.renderScores = this.renderScores.bind(this);
        this.renderPing = this.renderPing.bind(this);

        this.soc = io({transports: ['websocket'], upgrade: false});

        var updateState = function(event) {
            this.gameState = JSON.parse(event);
            this.renderfoods();
            this.renderSnakes();
            this.renderScores();
            this.renderPing();
        }.bind(this);

        this.soc.on('game_state', updateState);

        this.backgroundImage = game.load.image('background', 'img/background.jpg');
        game.load.spritesheet('button', 'img/startButton.png');

        this.colors = [null, null, null];
        this.rankTexts = [null, null, null];
        this.clientScoreText = null;
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

        this.nameInput = this.renderUserNameInputField();

        var titleColors = ["#ffd700", "#c0c0c0", "#b87333"];
        for ( var i = 0; i < 3; i++ ) {
            game.add.text(800, 100*i, (i+1) + "th place:", {font: "30px Arial", fill: titleColors[i]} );
        }
    },

    update: function() {
    },

    renderfoods: function() {
        if (!this.foods) return;
        this.foods.removeAll(true);
        this.gameState.foods.map((foods) => {
            this.foods.add(this.renderSection(foods[0] * this.dx, foods[1] * this.dy, 0xF4DC42, 'foods'));
        });
    },

    renderSnakes: function() {
        // Clear the previously rendered snakes
        if (!this.snakes) return;
        this.snakes.removeAll(true);

        this.gameState.snakes.map((snake) => {
            this.colorStr = Util.intToRgb(Util.hashCode(snake.name));
            let color = parseInt(this.colorStr, 16);
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

        let user_score = 0;

        this.gameState.snakes.map((snake) => {
            let score = snake.body.length;
            let clientColor = "#" + Util.intToRgb(Util.hashCode(snake.name));

            if (score > first_score) {
                // update the 2ed and 3rd place before update itself
                third_name = second_name;
                third_score = second_score;
                this.colors[2] = this.colors[1];
                second_name = first_name;
                second_score = first_score;
                this.colors[1] = this.colors[0];

                first_name = snake.name;
                first_score = score;
                this.colors[0] = clientColor;
            } else if (score > second_score) {
                // update the 3rd place before update itself
                third_name = second_name;
                third_score = second_score;
                this.colors[2] = this.colors[1];

                second_name = snake.name;
                second_score = score;
                this.colors[1] = clientColor;
            } else if (score > third_score) {
                third_name = snake.name;
                third_score = score;
                this.colors[2] = clientColor;
            }

            if (this.nameInput.text.text === snake.name) {
                user_score = score;
            }
        });

        this.displayRankScore(first_name, first_score, second_name, second_score, third_name, third_score);
        this.displayClientScore(user_score);
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
        this.soc.emit('new_user', this.nameInput.text.text);
    },

    displayRankScore: function(fn, fs, sn, ss, tn, ts) {
        var names = [fn, sn, tn];
        var scores = [fs, ss, ts];

        for ( var i = 0; i < 3; i++ ) {
            if (this.rankTexts[i] != null) {
                this.rankTexts[i].destroy();
            }
            if (names[i] != "") {
                this.rankTexts[i] = game.add.text(800, 50+100*i, names[i] +
                                                  "    " + scores[i], {font: "20px Arial", fill: this.colors[i]} );
            }
        }
    },

    displayClientScore: function(score) {
        if (this.clientScoreText != null) {
            this.clientScoreText.destroy();
        }

        this.clientScoreText = game.add.text(810, 660, "Current score:" +
                                             "    " + score, {font: "20px Arial", fill: "#" + this.colorStr} );
    },

    renderUserNameInputField: function() {
        var inputBox = game.add.inputField(810, 690, {
            width: 170,
            height: 20,
            padding: 4,
            borderColor: '#fff',
            placeHolder: 'The name of your snake',
        });
        return inputBox;
    },

    renderPing: function() {
        var serverTime = this.gameState.ping;
        var localTime = Date.now();
        var ping = Math.max(0, (localTime - serverTime));

        if (this.pingText) {
            this.pingText.destroy();
        }

        this.pingText = game.add.text(810, 640, "Ping: " + ping + ' ms', { font: "20px Arial", fill: '#FFF' });
    },
};

var game = new Phaser.Game(config.resolution.W, config.resolution.H, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');
