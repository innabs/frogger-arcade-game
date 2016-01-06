//Configuration variables:
var STEP_X = 101;
var STEP_Y = 83;
var OFFSET_X = -70;
var OFFSET_Y = 20;
var MAX_ROW = 5;

// Entity superclass:
var Entity = function(sprite, x, y) {
    // The image/sprite for entities (enemies and player)
    this.sprite = sprite;
    //Set the Entitiy initial location:
    this.x = x;
    this.y = y;
}

Entity.prototype.update = function() {
}

Entity.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Enemies our player must avoid
var Enemy = function() {
    this.row = Math.floor((Math.random() * 3) + 1);
    
    //Set the Enemy initial location:
    Entity.call(this, 'images/enemy-bug.png', OFFSET_X, (this.row * STEP_Y) - OFFSET_Y);

    //Set the Enemy speed:
    this.speed = (Math.random() * 100) + 50;
};

Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    //Update the Enemy location:
    var newX = this.speed * dt;
    if(this.x + newX < ctx.canvas.width) {
        this.x += newX;
    } else { //if out of canvas, reset to initial x position on the left side of the screen
        this.x = -70;
    }
    
    //Handle collision with the Player:
    if (this.row == player.row && player.x < this.x + 50 && player.x + 50 > this.x) {
        // collision detected!
        player.reset();
    }
};

// Draw the enemy on the screen, required method for game
/*Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};*/

function addEnemies(gameLevel) {
    gameLevel = (gameLevel)? gameLevel : 4;
    
    for (var i=0; i < gameLevel; i++) {
        allEnemies.push(new Enemy());
    }
}

// Player class
var Player = function(avatar) {
    // The image/sprite for our player:
    this.sprite = (avatar)? avatar : 'images/char-boy.png';
    
    //Entity.call(this, (avatar)? avatar : 'images/char-boy.png', 2 * 101, (MAX_ROW * STEP_Y) - OFFSET_Y);

    //Setting the Player initial location:
    this.reset();
};

//Player.prototype = Object.create(Entity.prototype);
//Player.prototype.constructor = Player;

//Update player sprite/avatar:
Player.prototype.updateAvatar = function(PlayerIcon) {
    this.sprite = PlayerIcon;
};

//Reset the player's initial location:
Player.prototype.reset = function() {
    this.x = 2 * 101; 
    this.row = MAX_ROW;
    this.y = (this.row * STEP_Y) - OFFSET_Y;
};

// Update the player's position, required method for game
Player.prototype.update = function() {
    
};

// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(direction) {
    //Check only allowed keys were pressed:
    if (!direction) {
        return;
    }
    
    //Check that the player doesn't move off screen, 
    //If in boundries: Left key should move the player to the left, right key to the right, up should move the player up and down should move the player down.
    switch (direction) {
        case 'left':
            if(this.x - STEP_X >= 0) {
                this.x -= STEP_X;
            }
            break;
        case 'up':
            if(this.row > 0) {
                this.y -= STEP_Y;
                this.row--;
                //If the player reaches the water the game should be reset
                if(this.row === 0) { //win!
                    game.updateLevel();
                    this.reset();
                }
            }
            break;
        case 'right':
            if(this.x + STEP_X < ctx.canvas.width) {
                this.x += STEP_X;
            }
            break;
        case 'down':
            if(this.row < MAX_ROW) {
                this.y += STEP_Y;
                this.row++;
            }
            break;
        default:
            break;    
    }
};

//Game class:
var Game = function() {
    this.score = 0;
};

//update the game's level:
Game.prototype.updateLevel = function() {
    // Add one more enemy every time player wins 5 times:
    if(++this.score % 5 === 0){
        allEnemies.push(new Enemy());
    }
};

//Reset the game:
Game.prototype.reset = function() {
    allEnemies = [];
    if(player != undefined) {
        player.reset();
    }
    this.score = 0;
   
    $(document).off("keyup", handleKeyUp);
    $(".glyphicon-play").parent().attr("disabled", false);
    $(".glyphicon-stop").parent().attr("disabled", true);
};

//Start the game:
Game.prototype.start = function() {
    if(player === undefined) {
        player = new Player();
    }
    addEnemies();
    $(document).on("keyup", handleKeyUp);
    $(".glyphicon-play").parent().attr("disabled", true);
    $(".glyphicon-stop").parent().attr("disabled", false);
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
var player;
var game = new Game();

$(document).ready(function(){
    $('[data-toggle="popover"]').popover();
    $("#PlayerIcon").imagepicker();
    Parse.initialize("dHY3lGqXyYbhyyh1soXN1eVDf75TYsow2ooJPCBH", "0HdnMFrq8NL07AWClyFR2rQCtbJD5vv4Neyn7DPO");
    
    //Start game button handler:
    $("#startButton").click(function(){
        game.reset();
        game.start();
        main();
    });

    //Stop game button handler:
    $("#stopButton").click(function(){
        game.reset();
    });
    
    //"Apply" button handler in the "Choose Player" modal, to save & update the chosen player avater:
    $("#choosePlayer").click(function(){
        var chosenAvatar = $("#choosePlayerModal").find(".selected img").attr("src");
        Resources.load(chosenAvatar);
        if(player === undefined) {
            player = new Player(chosenAvatar);
        }
        else {
            player.updateAvatar(chosenAvatar);
        }
        
        $('#choosePlayerModal').modal('hide');
    });
});

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
//document.addEventListener('keyup', function(e) {
var handleKeyUp = function(e) {
   //console.log(e); 
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
//});
};