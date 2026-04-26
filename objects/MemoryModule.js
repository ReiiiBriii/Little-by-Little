export default class MemoryModule {
    constructor(scene, x, y, data) {
        this.scene = scene;
        this.data = data;

        console.log('Creating memory sprite at:', x, y, 'with collectibles sprite');
        console.log('Available textures:', scene.textures.getTextureKeys());
        this.sprite = scene.physics.add.sprite(x, y, 'collectibles', 0);
        this.sprite.setImmovable(true);
        this.sprite.setDepth(1000); // Set very high depth to ensure it's visible
        this.sprite.setTint(0xffffff); // Ensure sprite is white (no tint)
        this.sprite.setAlpha(1); // Ensure full opacity
        this.sprite.body.setAllowGravity(false); // Disable gravity to prevent falling
        console.log('Memory sprite created:', this.sprite);
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
    // --- COLLECT MEMORY ---
    collect() {
    if (this.scene.collectedMemories.has(this.data.id)) return;

    this.scene.collectedMemories.add(this.data.id);
    
    // Save to registry for persistence between levels
    this.scene.registry.set('collectedMemories', this.scene.collectedMemories);

    // Stop background music and play memory pickup music
    const backgroundMusic = this.scene.sound.get('gameMusic');
    if (backgroundMusic) {
        backgroundMusic.pause();
    }

    // Play pickup sound with proper volume control
    if (this.scene.playSFX) {
        this.scene.playSFX('pickupSound');
    }
    
    this.memoryMusic = this.scene.sound.add('memoryPickupMusic');
    this.memoryMusic.play({ volume: 0.8 });

    this.sprite.destroy();

    // Check if this is the thanks module - if so, show text then credits
    if (this.data.id === 'thanks') {
        // Show the thanks text first, then transition to credits
        this.scene.showMemoryText(this.data.text, this.memoryMusic, backgroundMusic, () => {
            // After memory text is closed, start credits
            this.scene.sound.stopAll();
            this.scene.scene.start('Credits');
        });
    } else {
        // Regular memory module behavior
        this.scene.showMemoryText(this.data.text, this.memoryMusic, backgroundMusic);
    }
    }
}