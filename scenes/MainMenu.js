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
        
        // Ensure audio context is resumed for browser compatibility
        if (this.sound.context && this.sound.context.state === 'suspended') {
            this.sound.context.resume();
        }
        
        this.menuMusic = this.sound.add('menuMusic');
        
        // Play menu music with seamless looping
        this.menuMusic.play({ 
            loop: true, 
            volume: 0.5
        });
        
        // Set up seamless loop by restarting immediately when near end
        this.menuMusic.on('complete', () => {
            if (this.menuMusic && this.scene.isActive('mainMenu')) {
                this.menuMusic.play({ 
                    loop: true, 
                    volume: 0.5
                });
            }
        });
        
        console.log('Menu music playing:', this.menuMusic);
        
        this.add.text(400, 200, 'MY GAME', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const playText = this.add.text(400, 350, 'PRESS SPACE TO PLAY', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.sound.stopAll();
            this.scene.start('level1');
        });
    }
}