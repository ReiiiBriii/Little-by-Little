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

        // Update HUD if it exists
        if (this.scene.hud) {
            this.scene.hud.popIcon('springCollected');
        }

        this.sprite.destroy();
        this.showSpringGuide();
    }

    showSpringGuide() {
        const scene = this.scene;

        // Freeze player movement
        this.player.sprite.setVelocity(0, 0);
        this.player.sprite.body.enable = false;

        // Darken the screen
        const overlay = scene.add.rectangle(
            0, 0,
            scene.scale.width, scene.scale.height,
            0x000000, 0.7
        )
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(2000);

        // Title text
        const title = scene.add.text(
            scene.scale.width / 2,
            scene.scale.height * 0.35,
            'Spring Acquired!',
            {
                fontSize: '72px',
                color: '#00ff88',
                align: 'center',
                fontStyle: 'bold'
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(2001);

        // Instruction text
        const instruction = scene.add.text(
            scene.scale.width / 2,
            scene.scale.height * 0.50,
            'You can now JUMP!\nPress SPACE to leap into the air.',
            {
                fontSize: '48px',
                color: '#ffffff',
                align: 'center',
                lineSpacing: 12
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(2001);

        // Proceed prompt
        const proceedText = scene.add.text(
            scene.scale.width / 2,
            scene.scale.height * 0.75,
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
        .setDepth(2001);

        // Pulse the prompt
        scene.tweens.add({
            targets: proceedText,
            alpha: { from: 1, to: 0.4 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Dismiss on SPACE
        scene.input.keyboard.once('keydown-SPACE', () => {
            overlay.destroy();
            title.destroy();
            instruction.destroy();
            proceedText.destroy();

            this.player.sprite.body.enable = true;
            this.player.sprite.setVelocity(0, 0);
        });
    }
}
