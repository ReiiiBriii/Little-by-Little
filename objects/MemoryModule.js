export default class MemoryModule {
    constructor(scene, x, y, data) {
        this.scene = scene;
        this.data = data;

        this.sprite = scene.physics.add.sprite(x, y, 'memory');
        this.sprite.setImmovable(true);

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
        this.scene.physics.add.overlap(
            player.sprite,
            this.sprite,
            () => this.collect(),
            null,
            this
        );
    }

    collect() {
    if (this.scene.collectedMemories.has(this.data.id)) return;

    this.scene.collectedMemories.add(this.data.id);

    this.sprite.destroy();
    this.scene.showMemoryText(this.data.text);
    }
}