import * as Phaser from 'phaser';
import Player from '../objects/Player.js';
export default class Level1 extends Phaser.Scene {
    constructor() {
        super('level1');
    }

    preload() {
        this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    }

    create() {
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 580, 'ground').setScale(2).refreshBody();

        this.player = new Player(this, 100, 450);

        this.physics.add.collider(this.player.sprite, this.platforms);
    }

    update() {
        this.player.update();
    }
}