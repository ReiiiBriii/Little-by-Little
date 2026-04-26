import * as Phaser from 'phaser';
import Player from '../objects/Player.js';
import GreasePath from '../objects/GreasePath.js';
import MemoryModule from '../objects/MemoryModule.js';
import Spring from '../objects/Spring.js';
import memoryData from '../data/memoryData.js';

export default class Level1 extends Phaser.Scene {
    constructor() {
        super('level1');
    }

    preload() {
        this.load.image('groundTiles', 'assets/tiles/Ground1.png');
        this.load.image('wallTiles', 'assets/backgrounds/LabWall.png');
        this.load.image('assetTiles', 'assets/backgrounds/LabAssets.png');
        this.load.tilemapTiledJSON('map', '/assets/maps/level1.tmj');
        this.load.spritesheet('player', 'assets/sprites/Player.png', {
            frameWidth: 192,
            frameHeight: 192
        });
        this.load.spritesheet('collectibles', 'assets/collectibles/Chapter1Items.png', {
            frameWidth: 192,
            frameHeight: 192
        });
        this.load.audio('gameMusic', 'assets/music/lilbylil-labscene.wav');
        this.load.audio('ambience', 'assets/music/lilbylil-labscene-ambience.wav');
        this.load.audio('pickupSound', 'assets/sfx/mainboipickup.mp3');
        this.load.audio('dashSound', 'assets/sfx/mainboidash.wav');
        this.load.audio('jumpSound', 'assets/sfx/mainboijump.mp3');
        this.load.audio('memoryPickupMusic', 'assets/music/lilbylil-memorymodulepickup.wav');
    }

    create() {
        this.cameras.main.zoom = .6;
        this.transitionTriggered = false;
        // Animations
        if (!this.anims.exists('idle')) {
            this.anims.create({
                key: 'idle',
                frames: [{ key: 'player', frame: 0 }],
                frameRate: 1,
                repeat: -1
            });
        }

        if (!this.anims.exists('startRun')) {
            this.anims.create({
                key: 'startRun',
                frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
                frameRate: 12,
                repeat: 0
            });
        }

        if (!this.anims.exists('runHold')) {
            this.anims.create({
                key: 'runHold',
                frames: [{ key: 'player', frame: 2 }],
                frameRate: 1,
                repeat: -1
            });
        }

        if (!this.anims.exists('stopRun')) {
            this.anims.create({
                key: 'stopRun',
                frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
                frameRate: 12,
                repeat: 0
            });
        }

        // Map  
        const map = this.make.tilemap({ key: 'map' });
        const groundTiles = map.addTilesetImage('Ground1', 'groundTiles');
        const wallTiles = map.addTilesetImage('LabWall', 'wallTiles');
        const assetTiles = map.addTilesetImage('LabAssets', 'assetTiles');
        // All tilesets
        const allTilesets = [groundTiles, wallTiles, assetTiles];

        const layer1 = map.createLayer('Tile Layer 1', allTilesets, 0, 0); layer1.setCollisionByExclusion([-1], true);
        // Layers
        const bgLayer = map.createLayer('Background', allTilesets, 0, 0);
        const propsLayer = map.createLayer('Props', allTilesets, 0, 0);
        const props2Layer = map.createLayer('Props 2', allTilesets, 0, 0);

        const mapWidth = map.width * map.tileWidth;
        const mapHeight = map.height * map.tileHeight;

        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

        // Object layer
        const objectLayer = map.getObjectLayer('Objects');

        // Check if coming from Level2
        const comingFromLevel2 = this.registry.get('comingFromLevel2') || false;
        console.log('Coming from Level2:', comingFromLevel2);

        let spawnPoint;
        if (comingFromLevel2) {
            spawnPoint = objectLayer?.objects?.find(obj => obj.name === 'fromLevel2');
            console.log('Using fromLevel2 spawn point:', spawnPoint);
            this.registry.set('comingFromLevel2', false); // Reset the flag

            if (!spawnPoint) {
                console.log('fromLevel2 not found, falling back to default spawn');
                spawnPoint = objectLayer?.objects?.find(obj => obj.name === 'default');
            }
        } else {
            spawnPoint = objectLayer?.objects?.find(obj => obj.name === 'default');
            console.log('Using default spawn point:', spawnPoint);
        }

        if (!spawnPoint) {
            console.error('Spawn point not found');
            return;
        }


        this.player = new Player(this, spawnPoint.x, spawnPoint.y);
        this.physics.add.collider(this.player.sprite, layer1);
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);

        // Initialize collected memories set from registry or create new
        this.collectedMemories = this.registry.get('collectedMemories') || new Set();
        this.memoryActive = false;

        // Check if spring has been collected in previous level
        const springCollected = this.registry.get('springCollected') || false;
        if (springCollected) {
            // Enable jumping for player if spring was already collected
            this.player.hasCollectedMemory = true;
            console.log('Spring already collected, jumping enabled');
        }

        // Create memory module at fixed map position only if not already collected
        const memoryModuleX = 2500; // Fixed X position on map
        const memoryModuleY = 2000; // Fixed Y position on map

        // Create spring collectible next to memory module only if not already collected
        if (!springCollected) {
            const springX = memoryModuleX + 200; // 200 pixels to the right of memory module
            const springY = memoryModuleY; // Same Y position as memory module
            console.log('Creating spring next to memory module at:', springX, springY);
            const spring = new Spring(this, springX, springY);
            spring.setupOverlap(this.player);
            console.log('Spring created:', spring);
        } else {
            console.log('Spring already collected, not spawning spring');
        }

        if (!this.collectedMemories.has('log1')) {
            console.log('Creating memory module at fixed position:', memoryModuleX, memoryModuleY);
            const memoryModule = new MemoryModule(this, memoryModuleX, memoryModuleY, memoryData.log1);
            memoryModule.setupOverlap(this.player);
            console.log('Memory module created:', memoryModule);
            memoryModule.sprite.setVisible(true);
            memoryModule.sprite.scale = 1;
        } else {
            console.log('Memory module log1 already collected, skipping creation');
        }

        // Level transition zone
        const transitionPoint = objectLayer?.objects?.find(obj => obj.name === 'transition');
        console.log('Transition point found:', transitionPoint);
        if (transitionPoint) {
            console.log('Transition point position:', transitionPoint.x, transitionPoint.y);
            console.log('Transition point size:', transitionPoint.width, transitionPoint.height);

            this.exitZone = this.add.rectangle(
                transitionPoint.x,
                transitionPoint.y,
                Math.max(transitionPoint.width || 64, 128),
                Math.max(transitionPoint.height || 64, 128)
            ).setOrigin(0.5);

            this.physics.add.existing(this.exitZone, true);

            // Make the zone visible for debugging
            this.exitZone.setFillStyle(0xff0000, 0.3);
            console.log('Transition zone created at:', this.exitZone.x, this.exitZone.y);

            this.physics.add.overlap(this.player.sprite, this.exitZone, () => {
                if (!this.transitionTriggered) {
                    console.log('Transition triggered!');
                    this.transitionTriggered = true;
                    this.transitionToLevel2();
                }
            });
        } else {
            console.log('No transition point found in map!');
        }

        // Stop any leftover sounds from previous scene
        this.sound.stopAll();

        // Read volume settings from Options / MainMenu registry
        const musicVolume = this.registry.get('musicVolume') ?? 0.5;
        const generalVolume = this.registry.get('generalVolume') ?? 0.5;
        const sfxVolume = this.registry.get('sfxVolume') ?? 0.7;
        const ambienceVolume = this.registry.get('ambienceVolume') ?? 0.6;
        
        // Set general volume for all sounds
        this.sound.volume = generalVolume;

        // Play game music (looping) with music volume
        this.gameMusic = this.sound.add('gameMusic', { loop: true, volume: musicVolume });
        this.gameMusic.play();

        // Play ambience (looping) with separate ambience volume
        this.ambience = this.sound.add('ambience', { loop: true, volume: ambienceVolume });
        this.ambience.play();
        
        // Store volume references for dynamic updates
        this.currentVolumes = {
            music: musicVolume,
            general: generalVolume,
            sfx: sfxVolume,
            ambience: ambienceVolume
        };
        
        // Listen for volume changes from Options menu
        this.registry.events.on('changedata-musicVolume', () => {
            this.updateVolumes();
        });
        this.registry.events.on('changedata-generalVolume', () => {
            this.updateVolumes();
        });
        this.registry.events.on('changedata-sfxVolume', () => {
            this.updateVolumes();
        });
        this.registry.events.on('changedata-ambienceVolume', () => {
            this.updateVolumes();
        });
        
        console.log('Audio setup complete - Music:', musicVolume, 'General:', generalVolume, 'SFX:', sfxVolume, 'Ambience:', ambienceVolume);
    }

    update(time, delta) {
        this.player.update(time, delta);
    }

    // Play SFX with proper volume control
    playSFX(soundKey) {
        const sfxVolume = this.registry.get('sfxVolume') ?? 0.7;
        const generalVolume = this.registry.get('generalVolume') ?? 0.5;
        const finalVolume = sfxVolume * generalVolume;
        
        return this.sound.play(soundKey, { volume: finalVolume });
    }

    // Update all audio volumes dynamically
    updateVolumes() {
        const musicVolume = this.registry.get('musicVolume') ?? 0.5;
        const generalVolume = this.registry.get('generalVolume') ?? 0.5;
        const sfxVolume = this.registry.get('sfxVolume') ?? 0.7;
        const ambienceVolume = this.registry.get('ambienceVolume') ?? 0.6;
        
        // Update global volume
        this.sound.volume = generalVolume;
        
        // Update music volume
        if (this.gameMusic) {
            this.gameMusic.setVolume(musicVolume);
        }
        
        // Update ambience volume (separate from music volume)
        if (this.ambience) {
            this.ambience.setVolume(ambienceVolume);
        }
        
        // Store updated volumes
        this.currentVolumes = {
            music: musicVolume,
            general: generalVolume,
            sfx: sfxVolume,
            ambience: ambienceVolume
        };
        
        console.log('Volumes updated - Music:', musicVolume, 'General:', generalVolume, 'SFX:', sfxVolume, 'Ambience:', ambienceVolume);
    }

    showMemoryText(text, music = null, backgroundMusic = null) {
        if (this.memoryActive) return;
        this.memoryActive = true;

        this.player.sprite.setVelocity(0, 0);
        this.player.sprite.body.enable = false;

        const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(100);

        const cleanText = text.trim();

        const storyText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            '',
            {
                fontSize: '64px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: this.scale.width * 0.8 }
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);

        // "Press SPACE to proceed" prompt - hidden until typewriter finishes
        const proceedText = this.add.text(
            this.scale.width / 2,
            this.scale.height * 0.85,
            '[ Press SPACE to proceed ]',
            {
                fontSize: '36px',
                color: '#aaaaaa',
                align: 'center',
                fontStyle: 'italic'
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101)
            .setAlpha(0); // start invisible

        let displayed = '';
        let charIndex = 0;
        let typewriterDone = false;

        // Speed up letter display - show letters faster than music duration
        const textDisplayDuration = music ? Math.max(20, (music.duration * 1000) / cleanText.length * 0.6) : 20;

        // Close function that handles music and cleanup
        const closeMemory = () => {
            if (this.memoryTimer) {
                this.memoryTimer.remove(false);
                this.memoryTimer = null;
            }

            // Stop pickup music if still playing
            if (music && music.isPlaying) {
                music.stop();
            }

            overlay.destroy();
            storyText.destroy();
            proceedText.destroy();

            this.player.sprite.body.enable = true;
            this.player.sprite.setVelocity(0, 0);
            this.memoryActive = false;

            // Resume background music
            if (backgroundMusic) {
                backgroundMusic.resume();
            }
        };

        // Show the proceed button with a pulsing animation
        const showProceedPrompt = () => {
            typewriterDone = true;
            proceedText.setAlpha(1);

            // Gentle pulse so the player notices it
            this.tweens.add({
                targets: proceedText,
                alpha: { from: 1, to: 0.4 },
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        };

        this.memoryTimer = this.time.addEvent({
            delay: textDisplayDuration,
            repeat: cleanText.length - 1,
            callback: () => {
                displayed += cleanText[charIndex];
                storyText.setText(displayed);
                charIndex++;

                // Once all letters are typed, show the proceed prompt
                if (charIndex >= cleanText.length) {
                    showProceedPrompt();
                }
            }
        });

        // SPACE handler — skip typewriter if still going, dismiss if done
        const onSpace = () => {
            if (!typewriterDone) {
                // Fast-forward: show full text immediately
                if (this.memoryTimer) {
                    this.memoryTimer.remove(false);
                    this.memoryTimer = null;
                }
                storyText.setText(cleanText);
                showProceedPrompt();

                // Re-register so next press actually closes
                this.input.keyboard.once('keydown-SPACE', onSpace);
            } else {
                closeMemory();
            }
        };

        this.input.keyboard.once('keydown-SPACE', onSpace);
    }

    showPauseMenu() {
        if (this.isPaused) return;

        this.isPaused = true;
        this.physics.pause();
        this.player.sprite.setVelocity(0, 0);

        // Add overlay
        const pauseOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(1000);

        // Add pause panel
        const panel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 600, 500, 0x222222, 0.95)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1001);

        // Title
        const title = this.add.text(this.scale.width / 2, this.scale.height / 2 - 200, 'PAUSED', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

        // Volume settings from registry
        const musicVolume = this.registry.get('musicVolume') || 0.5;
        const generalVolume = this.registry.get('generalVolume') || 0.5;
        const sfxVolume = this.registry.get('sfxVolume') || 0.7;
        const ambienceVolume = this.registry.get('ambienceVolume') || 0.6;

        // Create volume sliders
        this.createPauseVolumeSlider(this.scale.width / 2 - 150, this.scale.height / 2 - 80, 'Music Volume', musicVolume, (value) => {
            this.registry.set('musicVolume', value);
            if (this.sound.get('gameMusic')) {
                this.sound.get('gameMusic').setVolume(value);
            }
        });

        this.createPauseVolumeSlider(this.scale.width / 2 - 150, this.scale.height / 2 - 20, 'Ambience Volume', ambienceVolume, (value) => {
            this.registry.set('ambienceVolume', value);
            if (this.sound.get('ambience')) {
                this.sound.get('ambience').setVolume(value);
            }
        });

        this.createPauseVolumeSlider(this.scale.width / 2 - 150, this.scale.height / 2 + 40, 'General Volume', generalVolume, (value) => {
            this.registry.set('generalVolume', value);
            this.sound.volume = value;
        });

        this.createPauseVolumeSlider(this.scale.width / 2 - 150, this.scale.height / 2 + 100, 'SFX Volume', sfxVolume, (value) => {
            this.registry.set('sfxVolume', value);
        });

        // Resume button
        const resumeButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 180, 'RESUME', {
            fontSize: '32px',
            color: '#00ff00',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(1002);

        resumeButton.on('pointerdown', () => {
            this.hidePauseMenu();
        });

        // Back to menu button
        const menuButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 230, 'BACK TO MENU', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#8b0000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(1002);

        menuButton.on('pointerdown', () => {
            this.sound.stopAll();
            this.scene.start('mainMenu');
        });

        // Store pause menu elements
        this.pauseMenuElements = { pauseOverlay, panel, title, resumeButton, menuButton };

        // ESC to resume
        this.input.keyboard.once('keydown-ESC', () => {
            this.hidePauseMenu();
        });
    }

    createPauseVolumeSlider(x, y, label, initialValue, onChange) {
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

        // Store slider elements for cleanup
        if (!this.pauseMenuSliders) {
            this.pauseMenuSliders = [];
        }
        this.pauseMenuSliders.push({ track, handle, valueText });
    }

    hidePauseMenu() {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.physics.resume();

        // Destroy pause menu elements
        if (this.pauseMenuElements) {
            Object.values(this.pauseMenuElements).forEach(element => {
                if (element) element.destroy();
            });
            this.pauseMenuElements = null;
        }

        // Destroy sliders
        if (this.pauseMenuSliders) {
            this.pauseMenuSliders.forEach(slider => {
                Object.values(slider).forEach(element => {
                    if (element) element.destroy();
                });
            });
            this.pauseMenuSliders = null;
        }

        // Re-enable ESC for pause
        this.input.keyboard.once('keydown-ESC', () => {
            if (!this.memoryActive && !this.isPaused) {
                this.showPauseMenu();
            }
        });
    }

    transitionToLevel2() {
        console.log('Starting transition to Level2...');
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            console.log('Fade complete, starting Level2 scene');
            // Stop music & ambience before switching scenes
            this.sound.stopAll();
            this.scene.start('level2');
        });
    }
}