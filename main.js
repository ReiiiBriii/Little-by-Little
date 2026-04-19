import * as Phaser from 'phaser';

//Movement

//dash variables
let canDash = true;
let isDashing = false;

let dashSpeed = 500;
let dashTime = 150;
let dashCooldown = 400;

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'app',
    backgroundColor: '#87CEEB',

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: true
        }
    },

    scene: {
        preload,
        create,
        update
    }
};

new Phaser.Game(config);

let player;
let platforms;
let keys;

function preload() {
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

function create() {
    // platforms
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 580, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');

    // player
    player = this.physics.add.sprite(100, 450, 'player');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // collision
    this.physics.add.collider(player, platforms);

    keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,SHIFT');
}
function update() {

    if (!isDashing) {

        if (keys.A.isDown) {
            player.setVelocityX(-160);
        } 
        else if (keys.D.isDown) {
            player.setVelocityX(160);
        } 
        else {
            player.setVelocityX(0);
        }

        if (keys.SPACE.isDown && player.body.touching.down) {
            player.setVelocityY(-330);
        }
    }

    // ⚡ DASH
    if (Phaser.Input.Keyboard.JustDown(keys.SHIFT) && canDash) {

    isDashing = true;
    canDash = false;

    let x = 0;
    let y = 0;

    if (keys.A.isDown) x = -1;
    else if (keys.D.isDown) x = 1;

    if (keys.W.isDown) y = -1;
    else if (keys.S.isDown) y = 1;

    if (x === 0 && y === 0) x = 1;

    const length = Math.sqrt(x * x + y * y);
    x /= length;
    y /= length;

    player.setVelocity(x * dashSpeed, y * dashSpeed);

    this.time.delayedCall(dashTime, () => {
        isDashing = false;
    });

    this.time.delayedCall(dashCooldown, () => {
        canDash = true;
    });
}
}