import * as Phaser from 'phaser';
export default class MainMenu extends Phaser.Scene {
    constructor() {
        super('mainMenu');
    }

    preload() {
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/space3.png');
        this.load.audio('menuMusic', 'assets/music/Robot Theme.mp3');
    }

    create() {
        this.add.image(400, 300, 'bg');
        this.sound.play('menuMusic', { loop: true });
        this.add.text(400, 200, 'MY GAME', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const playText = this.add.text(400, 350, 'PRESS SPACE TO PLAY', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('level1');
        });
    }
}