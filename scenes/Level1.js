import * as Phaser from 'phaser';
import Player from '../objects/Player.js';
export default class Level1 extends Phaser.Scene {
    constructor() {
        super('level1');
    }

    preload() {
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');

    this.load.spritesheet('player', 'assets/sprites/Player.png', {
        frameWidth: 192,
        frameHeight: 192
    });
}

create() {
    const mapWidth = 2400;
    const mapHeight = 1200;

    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    this.platforms = this.physics.add.staticGroup();
    
    // repeat the floor my dudes
    for (let x = 0; x < mapWidth; x += 800) {
        this.platforms.create(x + 400, mapHeight - 20, 'ground').setScale(2).refreshBody();
    }

    // Flappy bird style vertical platforms
    for (let x = 600; x < mapWidth; x += 400) {
        // Raise the gap so the bottom pipe actually sticks out of the floor!
        let gapY = Phaser.Math.Between(mapHeight - 450, mapHeight - 300); 
        let gapSize = 250; // Gap for the player to pass through
        
        // The image is 64px tall. Scaled by 20, it's 1280px tall. So the center offset is 640px.
        // Top pipe
        this.platforms.create(x, gapY - gapSize / 2 - 640, 'ground').setScale(0.2, 20).refreshBody();
        
        // Bottom pipe
        this.platforms.create(x, gapY + gapSize / 2 + 640, 'ground').setScale(0.2, 20).refreshBody();
    }
    

    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
    key: 'startRun',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
    frameRate: 10,
    repeat: 0
    });

    this.anims.create({
        key: 'runHold',
        frames: [{ key: 'player', frame: 2 }],
        frameRate: 1,
        repeat: -1
    });

    this.anims.create({
        key: 'stopRun',
        frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
        frameRate: 10,
        repeat: 0
    });

    this.player = new Player(this, 100, mapHeight - 150);

    this.physics.add.collider(this.player.sprite, this.platforms);

    // Camera setup Basically GJ-7
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
}

    update(time, delta) {
        this.player.update(time, delta);
    }
}