import * as Phaser from 'phaser';
import Player from '../objects/Player.js';
import GreasePath from '../objects/GreasePath.js';
import MemoryModule from '../objects/MemoryModule.js';
import memoryData from '../data/memoryData.js';
import Spring from '../objects/Spring.js';
import HUD from '../objects/HUD.js';

export default class Level2 extends Phaser.Scene {
    constructor() {
        super('level2');
    }

    preload() {
        // Tilesets (as defined in tmj file)
        this.load.image('Steel Beams', 'assets/tiles/Steel Beams.png');
        this.load.image('HallwayGround', 'assets/tiles/Hallway tileset.png');
        this.load.image('Hallway BG', 'assets/backgrounds/Hallway BG.png');
        this.load.image('HallwayAssets', 'assets/backgrounds/HallwayAssets.png');

        // Additional backgrounds if needed
        this.load.image('wallTiles', 'assets/backgrounds/LabWall.png');
        this.load.image('assetTiles', 'assets/backgrounds/LabAssets.png');

        // Map
        this.load.tilemapTiledJSON('map2', 'assets/maps/level2.tmj');

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
        const map = this.make.tilemap({ key: 'map2' });

        // Load tilesets with error handling
        const groundTiles = map.addTilesetImage('HallwayGround', 'HallwayGround');
        const steelBeams = map.addTilesetImage('Steel Beams', 'Steel Beams');
        const hallwayBG = map.addTilesetImage('Hallway BG', 'Hallway BG');

        // Try loading HallwayAssets with explicit error handling
        let hallwayAssets = null;
        try {
            hallwayAssets = map.addTilesetImage('HallwayAssets', 'HallwayAssets');
            console.log('HallwayAssets loaded successfully');
        } catch (error) {
            console.error('Failed to load HallwayAssets tileset:', error);
        }

        console.log('Tilesets loaded:', {
            groundTiles: !!groundTiles,
            steelBeams: !!steelBeams,
            hallwayBG: !!hallwayBG,
            hallwayAssets: !!hallwayAssets,
            mapWidth: map.width,
            mapHeight: map.height
        });

        // Debug: Check if HallwayAssets image is loaded correctly
        if (hallwayAssets) {
            console.log('HallwayAssets tileset details:', {
                name: hallwayAssets.name,
                image: hallwayAssets.image,
                firstGid: hallwayAssets.firstgid,
                tileCount: hallwayAssets.tilecount,
                columns: hallwayAssets.columns,
                rows: hallwayAssets.rows
            });
        }

        // Build tilesets array, excluding null ones
        const allTilesets = [groundTiles, steelBeams, hallwayBG];
        if (hallwayAssets) {
            allTilesets.push(hallwayAssets);
        }

        // Visual test: Add HallwayAssets image directly to verify it loads
        if (this.textures.exists('HallwayAssets')) {
            const testImage = this.add.image(100, 100, 'HallwayAssets')
                .setOrigin(0)
                .setDepth(9999)
                .setScale(0.1);
            console.log('HallwayAssets image test created');
        } else {
            console.warn('HallwayAssets texture not found');
        }

        // Create all layers as defined in tmj file
        let backgroundLayer, backgroundLayer2, backgroundLayer3, layer1, layer2;

        try {
            backgroundLayer = map.createLayer('Background', allTilesets, 0, 0);
            backgroundLayer2 = map.createLayer('Background 2', allTilesets, 0, 0);
            backgroundLayer3 = map.createLayer('Background 3', allTilesets, 0, 0);
            layer1 = map.createLayer('Tile Layer 1', allTilesets, 0, 0);
            layer2 = map.createLayer('Tile Layer 2', allTilesets, 0, 0);

            console.log('All 5 layers created successfully');
        } catch (error) {
            console.error('Error creating layers:', error);
        }

        // Set collision for main gameplay layer
        if (layer1) {
            layer1.setCollisionByExclusion([-1], true);
            map.setCollisionByProperty({ collides: true }, true, true, layer1);
        }

        if (layer2) {
            map.setCollisionByProperty({ collides: true }, true, true, layer2);
        }

        // Debug: Check tile counts and tile indices with tileset mapping
        const debugTiles = (layer, name) => {
            if (!layer) return;
            const tiles = layer.filterTiles(tile => tile.index !== -1);
            const uniqueIndices = [...new Set(tiles.map(tile => tile.index))];

            // Map tile indices to tilesets
            const tilesetMapping = uniqueIndices.map(index => {
                let tilesetName = 'Unknown';
                if (index >= 1 && index <= 4) tilesetName = 'Steel Beams';
                else if (index >= 5 && index <= 20) tilesetName = 'HallwayGround';
                else if (index >= 21 && index <= 55) tilesetName = 'Hallway BG';
                else if (index >= 56) tilesetName = 'HallwayAssets';
                return `${index}(${tilesetName})`;
            });

            console.log(`${name} - Total tiles: ${tiles.length}, Unique indices: ${tilesetMapping.slice(0, 15).join(', ')}${tilesetMapping.length > 15 ? '...' : ''}`);
        };

        debugTiles(backgroundLayer, 'Background');
        debugTiles(backgroundLayer2, 'Background 2');
        debugTiles(backgroundLayer3, 'Background 3');
        debugTiles(layer1, 'Tile Layer 1');
        debugTiles(layer2, 'Tile Layer 2');

        const mapWidth = map.width * map.tileWidth;
        const mapHeight = map.height * map.tileHeight;

        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

        // Object layer
        const objectLayer = map.getObjectLayer('Objects');
        let spawnName = 'fromlevel1'; // default

        if (this.registry.get('comingFromLevel3')) {
            spawnName = 'fromlevel3';
        } else if (this.registry.get('comingFromLevel1')) {
            spawnName = 'fromlevel1';
        }

        const spawnPoint = objectLayer?.objects?.find(obj => obj.name === spawnName);
        if (!spawnPoint) {
            console.error('Spawn point not found');
            return;
        }

        this.player = new Player(this, spawnPoint.x, spawnPoint.y);
        const springCollected = this.registry.get('springCollected') || false;

        if (springCollected) {
            // Player already has jump ability
            this.player.hasCollectedMemory = true;
            console.log('Spring already collected, jumping enabled');
        } else {
            // Spawn spring in Level2
            const springX = 4000;
            const springY = 3200;

            const spring = new Spring(this, springX, springY);
            spring.setupOverlap(this.player);

            console.log('Spring created in Level2 at:', springX, springY);
        }

        // Check if dash upgrade has been collected
        const dashUpgradeCollected = this.registry.get('dashUpgradeCollected') || false;
        if (dashUpgradeCollected) {
            // Enable dash for player if upgrade was already collected
            this.player.hasDashUpgrade = true;
            console.log('Dash upgrade already collected, dash enabled');
        }

        // Add colliders for both layers AFTER player is created
        this.physics.add.collider(this.player.sprite, layer1);
        this.physics.add.collider(this.player.sprite, layer2);
        console.log('Colliders added for both layers');

        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);

        // Initialize collected memories set from registry or create new
        this.collectedMemories = this.registry.get('collectedMemories') || new Set();
        this.memoryActive = false;

        // Create memory module for thanks data
        const memoryModuleX = 8000; // Fixed X position on map
        const memoryModuleY = 50; // Fixed Y position on map

        if (!this.collectedMemories.has('thanks')) {
            console.log('Creating memory module for thanks at fixed position:', memoryModuleX, memoryModuleY);
            const memoryModule = new MemoryModule(this, memoryModuleX, memoryModuleY, memoryData.thanks);
            memoryModule.setupOverlap(this.player);
            console.log('Memory module created:', memoryModule);
            memoryModule.sprite.setVisible(true);
            memoryModule.sprite.scale = 1;
        } else {
            console.log('Memory module thanks already collected, skipping creation');
        }

        // Level transition zones - handle multiple transitions
        const transitionPoints = objectLayer?.objects?.filter(obj => obj.name === 'transition');
        if (transitionPoints && transitionPoints.length > 0) {
            transitionPoints.forEach((transitionPoint, index) => {
                const targetLevel = transitionPoint.properties?.find(prop => prop.name === 'targetLevel')?.value;
                console.log(`Level2 transition point ${index + 1} found:`, transitionPoint.x, transitionPoint.y, 'target:', targetLevel);

                // Make the zone smaller to avoid immediate re-triggering
                const zone = this.add.rectangle(
                    transitionPoint.x,
                    transitionPoint.y,
                    Math.max(transitionPoint.width || 32, 64),
                    Math.max(transitionPoint.height || 32, 64)
                ).setOrigin(0.5);

                this.physics.add.existing(zone, true);
                this.physics.add.overlap(this.player.sprite, zone, () => {
                    if (!this.transitionTriggered) {
                        console.log(`Level2 transition to ${targetLevel} triggered!`);
                        this.transitionTriggered = true;

                        if (targetLevel === 'level1') {
                            this.transitionToLevel1();
                        } else if (targetLevel === 'level3') {
                            this.transitionToLevel3();
                        } else {
                            console.warn('Unknown target level:', targetLevel);
                            this.transitionTriggered = false; // Reset if target is unknown
                        }
                    }
                });

            });
        }


        // Stop any leftover sounds from previous scene
        this.sound.stopAll();

        // Read volume settings from Options / MainMenu registry
        const musicVolume = this.registry.get('musicVolume') ?? 1;
        const generalVolume = this.registry.get('generalVolume') ?? 1;
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

        // --- HUD ---
        this.hud = new HUD(this);

        // --- ESC → Pause Menu ---
        this.isPaused = false;
        this.setupPauseKey();
    }

    setupPauseKey() {
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.memoryActive || this.isPaused) return;
            this.isPaused = true;
            this.scene.pause();
            this.scene.launch('pauseMenu', { previousScene: 'level2' });
            this.scene.bringToTop('pauseMenu');
        });

        // Re-enable when scene is resumed
        this.events.on('resume', () => {
            this.isPaused = false;
        });
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

    showMemoryText(text, music = null, backgroundMusic = null, onComplete = null) {
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

            // Call onComplete callback if provided
            if (onComplete) {
                onComplete();
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

    transitionToLevel1() {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Stop all audio before switching scenes
            if (this.gameMusic) this.gameMusic.stop();
            if (this.ambience) this.ambience.stop();
            this.sound.stopAll();
            this.registry.set('comingFromLevel2', true);
            this.scene.start('level1');
        });
    }

    transitionToLevel3() {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Stop all audio before switching scenes
            if (this.gameMusic) this.gameMusic.stop();
            if (this.ambience) this.ambience.stop();
            this.sound.stopAll();
            this.registry.set('comingFromLevel2', true);
            this.scene.start('level3');
        });
    }
}
