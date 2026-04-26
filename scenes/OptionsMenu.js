import * as Phaser from 'phaser';

export default class OptionsMenu extends Phaser.Scene {
    constructor() {
        super('optionsMenu');
    }

    preload() {
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/space3.png');
    }

    create() {
        this.add.image(400, 300, 'bg');

        this.add.text(400, 150, 'OPTIONS', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.volumeText = this.add.text(400, 250, 'Volume: 100%', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const bar = this.add.rectangle(400, 350, 300, 6, 0xffffff);

        const knob = this.add.circle(550, 350, 12, 0xff0000)
            .setInteractive({ useHandCursor: true });

        this.input.setDraggable(knob);

        let volume = this.sound.volume;

        const minX = 250;
        const maxX = 550;

        const updateVolume = (value) => {
            this.sound.volume = value;
            this.volumeText.setText(`Volume: ${Math.round(value * 100)}%`);
        };

        this.input.on('drag', (pointer, gameObject, dragX) => {
            if (gameObject === knob) {

                gameObject.x = Phaser.Math.Clamp(dragX, minX, maxX);

                volume = (gameObject.x - minX) / (maxX - minX);

                updateVolume(volume);
            }
        });

        const back = this.add.text(400, 450, 'BACK', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        back.on('pointerdown', () => {
            this.scene.start('mainMenu');
        });
    }
}