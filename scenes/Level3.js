import * as Phaser from 'phaser';
import Player from '../objects/Player.js';
import GreasePath from '../objects/GreasePath.js';
import MemoryModule from '../objects/MemoryModule.js';
import memoryData from '../data/memoryData.js';

export default class Level3 extends Phaser.Scene {
    constructor() {
        super('level3');
    }

    preload() {
        // Tilesets (as defined in tmj file)
        this.load.image('Ground1', 'assets/tiles/Ground1.png');
        
        // Map
        this.load.tilemapTiledJSON('map3', '/assets/maps/level3.tmj');
        
        // Sprites
        this.load.spritesheet('player', 'assets/sprites/Player.png', {
            frameWidth: 192,
            frameHeight: 192
        });
        this.load.spritesheet('collectibles', 'assets/collectibles/Chapter1Items.png', {
            frameWidth: 192,
            frameHeight: 192
        });
        
        // Audio
        this.load.audio('gameMusic', 'assets/music/lilbylil-labscene.wav');
        this.load.audio('ambience', 'assets/music/lilbylil-labscene-ambience.wav');
        this.load.audio('pickupSound', 'assets/sfx/mainboipickup.mp3');
        this.load.audio('dashSound', 'assets/sfx/mainboidash.wav');
        this.load.audio('jumpSound', 'assets/sfx/mainboijump.mp3');
        this.load.audio('memoryPickupMusic', 'assets/music/lilbylil-memorymodulepickup.wav');
    }

    create() {
        this.cameras.main.zoom = 0.6;
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
        const map = this.make.tilemap({ key: 'map3' });
        
        // Load tilesets
        const groundTiles = map.addTilesetImage('Ground1', 'Ground1');
        
        console.log('Tilesets loaded:', {
            groundTiles: !!groundTiles,
            mapWidth: map.width,
            mapHeight: map.height
        });
        
        // Build tilesets array
        const allTilesets = [groundTiles];

        // Create all layers as defined in tmj file
        let layer1;
        
        try {
            layer1 = map.createLayer('Tile Layer 1', allTilesets, 0, 0);
            console.log('Tile Layer 1 created successfully');
        } catch (error) {
            console.error('Error creating layers:', error);
        }
        
        // Set collision for main gameplay layer
        if (layer1) {
            layer1.setCollisionByExclusion([-1], true);
            map.setCollisionByProperty({ collides: true }, true, true, layer1);
        }
        
        const mapWidth = map.width * map.tileWidth;
        const mapHeight = map.height * map.tileHeight;

        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
        
        // Object layer
        const objectLayer = map.getObjectLayer('Objects');
        const spawnPoint = objectLayer?.objects?.find(obj => obj.name === 'fromLevel2');

        if (!spawnPoint) {
            console.error('Spawn point not found');
            return;
        }

        this.player = new Player(this, spawnPoint.x, spawnPoint.y);
        
        // Check if spring has been collected from Level1
        const springCollected = this.registry.get('springCollected') || false;
        if (springCollected) {
            // Enable jumping for player if spring was collected in Level1
            this.player.hasCollectedMemory = true;
            console.log('Spring already collected in Level1, jumping enabled in Level3');
        }
        
        // Add colliders for layer AFTER player is created
        this.physics.add.collider(this.player.sprite, layer1);
        console.log('Colliders added for Tile Layer 1');
        
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);

        // Initialize collected memories set from registry or create new
        this.collectedMemories = this.registry.get('collectedMemories') || new Set();
        this.memoryActive = false;

        // Level transition zone back to Level2
        const transitionPoint = objectLayer?.objects?.find(obj => obj.name === 'transition');
        if (transitionPoint) {
            console.log('Level3 transition point found:', transitionPoint.x, transitionPoint.y);
            
            // Make the zone smaller to avoid immediate re-triggering
            this.exitZone = this.add.rectangle(
                transitionPoint.x,
                transitionPoint.y,
                Math.max(transitionPoint.width || 32, 64),
                Math.max(transitionPoint.height || 32, 64)
            ).setOrigin(0.5);
            
            this.physics.add.existing(this.exitZone, true);
            this.physics.add.overlap(this.player.sprite, this.exitZone, () => {
                if (!this.transitionTriggered) {
                    console.log('Level3 transition triggered!');
                    this.transitionTriggered = true;
                    this.transitionToLevel2();
                }
            });
            
            // Make the zone visible for debugging
            this.exitZone.setFillStyle(0x00ff00, 0.3);
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
        
        console.log('Audio setup complete - Music:', musicVolume, 'General:', generalVolume, 'SFX:', sfxVolume);
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

        const width = this.scale.width;
        const height = this.scale.height;

        this.player.sprite.setVelocity(0, 0);
        this.player.sprite.body.enable = false;

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(100);

        const cleanText = text.trim();

        const storyText = this.add.text(
            width / 2,
            height / 2,
            '',
            {
                fontSize: '64px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: width * 0.8 }
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(101);

        // "Press SPACE to proceed" prompt — hidden until typewriter finishes
        const proceedText = this.add.text(
            width / 2,
            height * 0.85,
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
        .setAlpha(0);

        let displayed = '';
        let charIndex = 0;
        let typewriterDone = false;

        const textDisplayDuration = music ? Math.max(20, (music.duration * 1000) / cleanText.length * 0.6) : 30;

        const closeMemory = () => {
            if (this.memoryTimer) {
                this.memoryTimer.remove(false);
                this.memoryTimer = null;
            }

            if (music && music.isPlaying) {
                music.stop();
            }

            overlay.destroy();
            storyText.destroy();
            proceedText.destroy();

            this.player.sprite.body.enable = true;
            this.player.sprite.setVelocity(0, 0);
            this.memoryActive = false;

            if (backgroundMusic) {
                backgroundMusic.resume();
            }
        };

        const showProceedPrompt = () => {
            typewriterDone = true;
            proceedText.setAlpha(1);

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

                if (charIndex >= cleanText.length) {
                    showProceedPrompt();
                }
            }
        });

        const onSpace = () => {
            if (!typewriterDone) {
                if (this.memoryTimer) {
                    this.memoryTimer.remove(false);
                    this.memoryTimer = null;
                }
                storyText.setText(cleanText);
                showProceedPrompt();

                this.input.keyboard.once('keydown-SPACE', onSpace);
            } else {
                closeMemory();
            }
        };

        this.input.keyboard.once('keydown-SPACE', onSpace);
    }

    transitionToLevel2() {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Stop all audio before switching scenes
            if (this.gameMusic) this.gameMusic.stop();
            if (this.ambience) this.ambience.stop();
            this.sound.stopAll();
            this.registry.set('comingFromLevel3', true);
            this.scene.start('level2');
        });
    }
}
