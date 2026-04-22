import * as Phaser from 'phaser';
import Player from '../objects/Player.js';
import GreasePath from '../objects/GreasePath.js';

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
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 580, 'ground').setScale(2).refreshBody();    

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

    this.player = new Player(this, 100, 450);

    this.physics.add.collider(this.player.sprite, this.platforms);
    this.grease = new GreasePath(this, 400, 500, 200, 50);
    this.grease.setTexture('ground'); 
    this.grease.setDisplaySize(200, 50);
    this.grease.setTint(0xff0000);
    this.grease.setDepth(1);
    this.grease.setAlpha(0.5);
    this.grease.setAlpha(0.3);

    this.physics.add.overlap(this.player.sprite, this.grease, () => {
        this.grease.applyEffect(this.player);
        this.player.isOnGrease = true;
        console.log('ON GREASE');
    });

}

    update(time, delta) {
        this.player.update(time, delta);
    }
}