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

    // for testings fr
    this.platforms.create(600, mapHeight - 150, 'ground').refreshBody();
    this.platforms.create(1000, mapHeight - 300, 'ground').refreshBody();
    this.platforms.create(400, mapHeight - 450, 'ground').refreshBody();
    this.platforms.create(800, mapHeight - 600, 'ground').refreshBody();
    this.platforms.create(1200, mapHeight - 750, 'ground').refreshBody();
    this.platforms.create(1600, mapHeight - 350, 'ground').refreshBody();
    this.platforms.create(2000, mapHeight - 500, 'ground').refreshBody();
    this.platforms.create(1800, mapHeight - 800, 'ground').refreshBody();
    

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