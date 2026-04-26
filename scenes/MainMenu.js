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

        if (!this.sound.get('menuMusic')) {
            this.sound.play('menuMusic', { loop: true });
        }

        this.add.text(400, 200, 'MY GAME', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const playText = this.add.text(400, 350, 'PRESS SPACE TO PLAY', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const optionsText = this.add.text(400, 400, 'OPTIONS', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        playText.setInteractive({ useHandCursor: true });
        optionsText.setInteractive({ useHandCursor: true });

        const addHover = (obj) => {
            obj.on('pointerover', () => {
                obj.setStyle({ color: '#ffff00' });
                obj.setScale(1.1);
            });

            obj.on('pointerout', () => {
                obj.setStyle({ color: '#ffffff' });
                obj.setScale(1);
            });
        };

        addHover(playText);
        addHover(optionsText);

        // click events
        playText.on('pointerdown', () => {
            this.scene.start('level1');
        });

        optionsText.on('pointerdown', () => {
            this.scene.start('optionsMenu');
        });

    }
}