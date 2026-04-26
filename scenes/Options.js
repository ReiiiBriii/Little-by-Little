import * as Phaser from 'phaser';

export default class Options extends Phaser.Scene {
    constructor() {
        super('options');
    }

    create() {
        // Add background
        this.add.image(0, 0, 'bg')
            .setOrigin(0, 0)
            .setDisplaySize(this.scale.width, this.scale.height);

        // Add overlay for better UI visibility
        const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        // Add options panel
        const panel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 600, 500, 0x222222, 0.9)
            .setOrigin(0.5);

        // Title
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 200, 'OPTIONS', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Volume settings from registry or defaults
        const musicVolume = this.registry.get('musicVolume') || 0.5;
        const generalVolume = this.registry.get('generalVolume') || 0.5;
        const sfxVolume = this.registry.get('sfxVolume') || 0.7;


        // General Volume Slider
        this.createVolumeSlider(
            this.scale.width / 2 - 150,
            this.scale.height / 2 + 50,
            'General Volume',
            generalVolume,
            (value) => {
                this.registry.set('generalVolume', value);
                this.updateGeneralVolume(value);
            }
        );
        
        // Music Volume Slider
        this.createVolumeSlider(
            this.scale.width / 2 - 150,
            this.scale.height / 2 - 50,
            'Music Volume',
            musicVolume,
            (value) => {
                this.registry.set('musicVolume', value);
                this.updateMusicVolume(value);
            }
        );


        // SFX Volume Slider
        this.createVolumeSlider(
            this.scale.width / 2 - 150,
            this.scale.height / 2 + 150,
            'SFX Volume',
            sfxVolume,
            (value) => {
                this.registry.set('sfxVolume', value);
                this.updateSFXVolume(value);
            }
        );

        // Back button
        const backButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 250, 'BACK', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('mainMenu');
        });

        this.input.keyboard.once('keydown-ESC', () => {
            this.scene.start('mainMenu');
        });
    }

    createVolumeSlider(x, y, label, initialValue, onChange) {
        // Label
        this.add.text(x, y - 30, label, {
            fontSize: '24px',
            color: '#ffffff'
        });

        // Slider track
        const track = this.add.rectangle(x, y, 300, 10, 0x666666)
            .setOrigin(0, 0.5);

        // Slider handle
        const handle = this.add.circle(x + (initialValue * 300), y, 15, 0xffffff)
            .setInteractive();

        // Volume value text
        const valueText = this.add.text(x + 320, y, `${Math.round(initialValue * 100)}%`, {
            fontSize: '18px',
            color: '#ffffff'
        });

        // Handle dragging
        let isDragging = false;

        handle.on('pointerdown', () => {
            isDragging = true;
        });

        this.input.on('pointermove', (pointer) => {
            if (isDragging) {
                const newX = Phaser.Math.Clamp(pointer.x, x, x + 300);
                handle.x = newX;
                
                const value = (newX - x) / 300;
                valueText.setText(`${Math.round(value * 100)}%`);
                onChange(value);
            }
        });

        this.input.on('pointerup', () => {
            isDragging = false;
        });

        // Keyboard controls
        this.input.keyboard.on('keydown-LEFT', () => {
            const currentX = handle.x;
            const newX = Math.max(x, currentX - 10);
            handle.x = newX;
            
            const value = (newX - x) / 300;
            valueText.setText(`${Math.round(value * 100)}%`);
            onChange(value);
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            const currentX = handle.x;
            const newX = Math.min(x + 300, currentX + 10);
            handle.x = newX;
            
            const value = (newX - x) / 300;
            valueText.setText(`${Math.round(value * 100)}%`);
            onChange(value);
        });
    }

    updateMusicVolume(value) {
        // Update menu music if it's playing
        if (this.sound.get('menuMusic')) {
            this.sound.get('menuMusic').setVolume(value);
        }
        // Update game music if it's playing
        if (this.sound.get('gameMusic')) {
            this.sound.get('gameMusic').setVolume(value);
        }
        // Update ambience if it's playing (kept at 60% of music volume)
        if (this.sound.get('ambience')) {
            this.sound.get('ambience').setVolume(value * 0.6);
        }
    }

    updateGeneralVolume(value) {
        // Update global sound volume
        this.sound.volume = value;
    }

    updateSFXVolume(value) {
        // SFX volume is handled per-sound in the game scenes
        // This just stores the value for other scenes to use
    }
}
