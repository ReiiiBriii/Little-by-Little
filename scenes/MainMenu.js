import * as Phaser from 'phaser';

export default class MainMenu extends Phaser.Scene {

    constructor() {
        super('mainMenu');
    }

    preload() {
        this.load.image('bg', 'assets/backgrounds/MenuBg.png');
        this.load.audio('menuMusic', 'assets/music/Robot Theme.mp3');
    }

    create() {
        // Add background image that fits entire screen while maintaining aspect ratio
        this.add.image(0, 0, 'bg')
            .setOrigin(0, 0)
            .setDisplaySize(this.scale.width, this.scale.height);
        
        // Ensure audio context is resumed for browser compatibility
        if (this.sound.context && this.sound.context.state === 'suspended') {
            this.sound.context.resume();
        }
        
        // Only create and play music if it's not already playing
        if (!this.sound.get('menuMusic')) {
            this.menuMusic = this.sound.add('menuMusic');
            
            // Get saved music volume or use default
            const musicVolume = this.registry.get('musicVolume') || 0.5;
            
            // Play menu music with seamless looping
            this.menuMusic.play({ 
                loop: true, 
                volume: musicVolume
            });
            
            // Set up seamless loop by restarting immediately when near end
            this.menuMusic.on('complete', () => {
                if (this.menuMusic && this.scene.isActive('mainMenu')) {
                    this.menuMusic.play({ 
                        loop: true, 
                        volume: musicVolume
                    });
                }
            });
        } else {
            // Music is already playing, just get reference and update volume
            this.menuMusic = this.sound.get('menuMusic');
            const musicVolume = this.registry.get('musicVolume') || 0.5;
            this.menuMusic.setVolume(musicVolume);
        }
        
        console.log('Menu music playing:', this.menuMusic);
        
        // Center text properly using screen dimensions
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'Little by Little', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const playText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 50, 'PRESS SPACE TO PLAY', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const optionsText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, 'OPTIONS', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive();

        optionsText.on('pointerdown', () => {
            this.scene.start('options');
        });

        this.input.keyboard.once('keydown-SPACE', () => {
            this.sound.stopAll();
            this.scene.start('level1');
        });

        this.input.keyboard.on('keydown-O', () => {
            this.scene.start('options');
        });
    }
}