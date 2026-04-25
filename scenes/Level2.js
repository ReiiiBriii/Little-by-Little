import * as Phaser from 'phaser';
import Player from '../objects/Player.js';
import GreasePath from '../objects/GreasePath.js';
import MemoryModule from '../objects/MemoryModule.js';
import memoryData from '../data/memoryData.js';

export default class Level2 extends Phaser.Scene {
    constructor() {
        super('level2');
    }

    preload() {
        this.load.image('groundTiles', 'assets/tiles/Ground1.png');
        this.load.image('wallTiles', 'assets/backgrounds/LabWall.png');
        this.load.image('assetTiles', 'assets/backgrounds/LabAssets.png');
        this.load.tilemapTiledJSON('map2', '/assets/maps/level2.tmj');
        this.load.spritesheet('player', 'assets/sprites/Player.png', {
            frameWidth: 192,
            frameHeight: 192
        });
    }

    create() {
        this.cameras.main.zoom = 0.5;
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
        const groundTiles = map.addTilesetImage('Ground1', 'groundTiles');
        const wallTiles = map.addTilesetImage('LabWall', 'wallTiles');
        const assetTiles = map.addTilesetImage('LabAssets', 'assetTiles');
        const allTilesets = [groundTiles, wallTiles, assetTiles];

        const layer1 = map.createLayer('Tile Layer 1', allTilesets, 0, 0);
        layer1.setCollisionByExclusion([-1], true);
        
        // Layers
        const bgLayer = map.createLayer('Background', allTilesets, 0, 0);
        const propsLayer = map.createLayer('Props', allTilesets, 0, 0);
        const props2Layer = map.createLayer('Props 2', allTilesets, 0, 0);

        const mapWidth = map.width * map.tileWidth;
        const mapHeight = map.height * map.tileHeight;

        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
        
        // Object layer
        const objectLayer = map.getObjectLayer('Objects');
        const spawnPoint = objectLayer?.objects?.find(obj => obj.name === 'fromlevel1');

        if (!spawnPoint) {
            console.error('Spawn point not found');
            return;
        }

        this.player = new Player(this, spawnPoint.x, spawnPoint.y);
        this.physics.add.collider(this.player.sprite, layer1);
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);

        // Level transition zone back to Level1
        const transitionPoint = objectLayer?.objects?.find(obj => obj.name === 'transition');
        if (transitionPoint) {
            console.log('Level2 transition point found:', transitionPoint.x, transitionPoint.y);
            
            // Make the zone smaller to avoid immediate re-triggering
            this.exitZone = this.add.rectangle(
                transitionPoint.x - 40,
                transitionPoint.y,
                Math.max(transitionPoint.width || 32, 64),
                Math.max(transitionPoint.height || 32, 64)
            ).setOrigin(0.5);
            
            this.physics.add.existing(this.exitZone, true);
            this.physics.add.overlap(this.player.sprite, this.exitZone, () => {
                if (!this.transitionTriggered) {
                    console.log('Level2 transition triggered!');
                    this.transitionTriggered = true;
                    this.transitionToLevel1();
                }
            });
            
            // Make the zone visible for debugging
            this.exitZone.setFillStyle(0x00ff00, 0.3);
        }
    }

    update(time, delta) {
        this.player.update(time, delta);
    }

    showMemoryText(text) {
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
                fontSize: '18px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: width * 0.7 }
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(101);

        let displayed = '';
        let i = 0;

        this.memoryTimer = this.time.addEvent({
            delay: 30,
            repeat: cleanText.length - 1,
            callback: () => {
                displayed += cleanText[i];
                storyText.setText(displayed);
                i++;
            }
        });

        this.input.keyboard.once('keydown-SPACE', () => {
            if (this.memoryTimer) {
                this.memoryTimer.remove(false);
                this.memoryTimer = null;
            }

            overlay.destroy();
            storyText.destroy();

            this.player.sprite.body.enable = true;
            this.player.sprite.setVelocity(0, 0);

            this.memoryActive = false;
        });
    }

    transitionToLevel1() {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.registry.set('comingFromLevel2', true);
            this.scene.start('level1');
        });
    }
}
