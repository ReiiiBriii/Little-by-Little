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
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');

    this.load.spritesheet('player', 'assets/sprites/Player.png', {
        frameWidth: 192,
        frameHeight: 192
    });
}

create() {
    this.platforms = this.physics.add.staticGroup();
    const width = this.scale.width;
    const height = this.scale.height;

    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
    key: 'startRun',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
    frameRate: 10,
    repeat: 0
    });

    this.anims.create({
        key: 'runHold',
        frames: [{ key: 'player', frame: 2 }],
        frameRate: 1,
        repeat: -1
    });

    this.anims.create({
        key: 'stopRun',
        frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
        frameRate: 10,
        repeat: 0
    });

    this.player = new Player(this, 100, height - 150);
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.grease = new GreasePath(this, width / 2, height - 80, 200, 50);
    this.grease.setTexture('ground'); 
    this.grease.setDisplaySize(200, 50);
    this.grease.setTint(0xff0000);
    this.grease.setDepth(1);
    this.grease.setAlpha(0.5);
    this.grease.setAlpha(0.3);

    this.physics.add.overlap(this.player.sprite, this.grease, () => {
        this.grease.applyEffect(this.player);
        this.player.isOnGrease = true;
        console.log('ON GREASE');
    });


        const ground = this.platforms.create(width / 2, height - 20, 'ground');

        ground.displayWidth = width;
        ground.refreshBody();
    
    this.collectedMemories = new Set();
    this.memoryModules = [];
    

    const mem1 = new MemoryModule(this, width / 2, height / 2, memoryData.log1);    
    mem1.setupOverlap(this.player);
    this.memoryModules.push(mem1);

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

    // --- FULL SCREEN OVERLAY ---
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

    // --- TYPEWRITER EFFECT ---
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

    // --- EXIT MEMORY MESSAGE---
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