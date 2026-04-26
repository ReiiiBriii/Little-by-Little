import * as Phaser from 'phaser';

export default class GreasePath extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, width, height) {
        super(scene, x, y, null);
        // --- Visual Setup (Debug) ---
        this.setTexture('ground');
        this.setDisplaySize(width, height);
        this.setAlpha(0.5);
        this.setTint(0xff0000);


        scene.add.existing(this);
        scene.physics.add.existing(this, true); // static body

        this.body.setSize(width, height);
        this.body.setOffset(-width / 2, -height / 2);

        this.frictionMultiplier = 0.5;
    }

    /// Applies the grease effect to the player

    applyEffect(player) {
        player.frictionMultiplier = this.frictionMultiplier;
    }

    removeEffect(player) {
        player.frictionMultiplier = 1;
    }
}