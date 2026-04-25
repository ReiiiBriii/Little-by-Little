export default class Spring {
    constructor(scene, x, y) {
        this.scene = scene;

        console.log('Creating spring sprite at:', x, y, 'with collectibles sprite frame 3');
        console.log('Available textures:', scene.textures.getTextureKeys());
        this.sprite = scene.physics.add.sprite(x, y, 'collectibles', 3);
        this.sprite.setImmovable(true);
        this.sprite.setDepth(1); // Set depth behind memory module (1000) but still visible
        this.sprite.setTint(0xffffff); // Ensure sprite is white (no tint)
        this.sprite.setAlpha(1); // Ensure full opacity
        this.sprite.body.setAllowGravity(false); // Disable gravity to prevent falling
        console.log('Spring sprite created:', this.sprite);
        console.log('Sprite texture:', this.sprite.texture.key);
        console.log('Sprite frame:', this.sprite.frame.name);
        console.log('Sprite visible:', this.sprite.visible);
        console.log('Sprite alpha:', this.sprite.alpha);

        scene.tweens.add({
            targets: this.sprite,
            y: y - 6,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    setupOverlap(player) {
        this.player = player;
        this.scene.physics.add.overlap(
            player.sprite,
            this.sprite,
            () => this.collect(),
            null,
            this
        );
    }

    collect() {
        // Play pickup sound
        this.scene.sound.play('pickupSound', { volume: 0.7 });

        // Enable jumping for the player
        if (this.player) {
            this.player.hasCollectedMemory = true;
        }
        
        // Save spring collection status to registry for persistence across levels
        this.scene.registry.set('springCollected', true);

        this.sprite.destroy();
        
        // Show a simple message when spring is collected
        const text = this.scene.add.text(
            this.player.sprite.x,
            this.player.sprite.y - 100,
            'Spring collected! Jumping unlocked!',
            {
                fontSize: '32px',
                color: '#00ff00',
                align: 'center',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(2000);

        // Remove the text after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            text.destroy();
        });
    }
}
