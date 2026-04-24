import * as Phaser from 'phaser';
import Player from '../objects/Player.js';
import GreasePath from '../objects/GreasePath.js';
import MemoryModule from '../objects/MemoryModule.js';
import memoryData from '../data/memoryData.js';

export default class Level1 extends Phaser.Scene {
    constructor() {
        super('level1');
    }

    preload() {
        this.load.tilemapTiledJSON('map', '/assets/maps/level1.tmj');
        this.load.image('tiles', 'assets/tiles/Ground1.png');;
        this.cameras.main.zoom = .5;

        this.load.spritesheet('player', 'assets/sprites/Player.png', {
            frameWidth: 192,
            frameHeight: 192
        });
    }

    create() {
        const map = this.make.tilemap({ key: 'map' });
        const mapWidth = map.width * map.tileWidth;
        const mapHeight = map.height * map.tileHeight;

        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);


        // ⚠️ MAKE SURE "Ground1" MATCHES YOUR TMJ TILESET NAME
        const tileset = map.addTilesetImage('Ground1', 'tiles');

        // ⚠️ MAKE SURE LAYER NAME MATCHES TMJ
        const layer = map.createLayer('Tile Layer 1', tileset, 0, 0);
        layer.setDepth(0);        
        const objectLayer = map.getObjectLayer('Objects');
        const spawnPoint = objectLayer?.objects?.find(obj => obj.name === 'spawn');

        if (!spawnPoint) {
            console.error('Spawn point not found in Tiled map');
            return;
        }

        this.player = new Player(this, spawnPoint.x, spawnPoint.y);

        layer.setCollisionByProperty({ collides: true });
        this.physics.add.collider(this.player.sprite, layer);
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);

        // 🧪 DEBUG (remove later)
        /*
        layer.renderDebug(this.add.graphics(), {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(255, 0, 0, 100)
        });
        */
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
}