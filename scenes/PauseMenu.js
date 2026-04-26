import * as Phaser from 'phaser';

export default class PauseMenu extends Phaser.Scene {
    constructor() {
        super('pauseMenu');
        this.previousScene = null;
    }

    init(data) {
        this.previousScene = data.previousScene;
    }

    create() {
        console.log('PauseMenu create() called, previousScene:', this.previousScene);

        // Add overlay for better UI visibility
        const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(1000);
        
        console.log('PauseMenu overlay created');

        // Add pause panel
        const panel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 600, 600, 0x222222, 0.95)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1001);

        // Title
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 250, 'PAUSED', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

        // Volume settings from registry or defaults (synced with options)
        const musicVolume = this.registry.get('musicVolume') || 0.5;
        const generalVolume = this.registry.get('generalVolume') || 0.5;
        const sfxVolume = this.registry.get('sfxVolume') || 0.7;

        // Music Volume Slider
        this.createVolumeSlider(
            this.scale.width / 2 - 150,
            this.scale.height / 2 - 100,
            'Music Volume',
            musicVolume,
            (value) => {
                this.registry.set('musicVolume', value);
                this.updateMusicVolume(value);
            }
        );

        // General Volume Slider
        this.createVolumeSlider(
            this.scale.width / 2 - 150,
            this.scale.height / 2,
            'General Volume',
            generalVolume,
            (value) => {
                this.registry.set('generalVolume', value);
                this.updateGeneralVolume(value);
            }
        );

        // SFX Volume Slider
        this.createVolumeSlider(
            this.scale.width / 2 - 150,
            this.scale.height / 2 + 100,
            'SFX Volume',
            sfxVolume,
            (value) => {
                this.registry.set('sfxVolume', value);
                this.updateSFXVolume(value);
            }
        );

        // Resume button
        const resumeButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 200, 'RESUME', {
            fontSize: '32px',
            color: '#00ff00',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(1002);

        resumeButton.on('pointerdown', () => {
            this.resumeGame();
        });

        // Back to menu button
        const menuButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 250, 'BACK TO MENU', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#8b0000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(1002);

        menuButton.on('pointerdown', () => {
            this.backToMenu();
        });

        // Keyboard controls
        this.input.keyboard.once('keydown-ESC', () => {
            this.resumeGame();
        });

        this.input.keyboard.once('keydown-ENTER', () => {
            this.resumeGame();
        });
    }

    createVolumeSlider(x, y, label, initialValue, onChange) {
        // Label
        this.add.text(x, y - 30, label, {
            fontSize: '20px',
            color: '#ffffff'
        }).setScrollFactor(0).setDepth(1002);

        // Slider track
        const track = this.add.rectangle(x, y, 300, 8, 0x666666)
            .setOrigin(0, 0.5)
            .setScrollFactor(0)
            .setDepth(1002);

        // Slider handle
        const handle = this.add.circle(x + (initialValue * 300), y, 12, 0xffffff)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(1003);

        // Volume value text
        const valueText = this.add.text(x + 320, y, `${Math.round(initialValue * 100)}%`, {
            fontSize: '16px',
            color: '#ffffff'
        }).setScrollFactor(0).setDepth(1002);

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

    resumeGame() {
        console.log('Resuming game, previousScene:', this.previousScene);
        if (this.previousScene) {
            this.scene.resume(this.previousScene);
        }
        this.scene.stop();
    }

    backToMenu() {
        // Stop the game scene and all sounds
        if (this.previousScene) {
            this.scene.stop(this.previousScene);
        }
        this.sound.stopAll();

        // Reset all game progress so a fresh playthrough starts
        this.registry.set('springCollected', false);
        this.registry.set('dashUpgradeCollected', false);
        this.registry.set('collectedMemories', null);
        this.registry.set('comingFromLevel2', false);
        this.registry.set('comingFromLevel3', false);

        this.scene.start('mainMenu');
    }
}
