import * as Phaser from 'phaser';
export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setCollideWorldBounds(true);

        this.keys = scene.input.keyboard.addKeys('W,A,S,D,SPACE,SHIFT');

        this.canDash = true;
        this.hasDashed = false;
        this.isDashing = false;
    }

    update() {
        const onGround = this.sprite.body.blocked.down;

        if (onGround) {
            this.hasDashed = false;
        }

        // movement
        if (!this.isDashing) {
            if (this.keys.A.isDown) this.sprite.setVelocityX(-160);
            else if (this.keys.D.isDown) this.sprite.setVelocityX(160);
            else this.sprite.setVelocityX(0);

            if (this.keys.SPACE.isDown && onGround) {
                this.sprite.setVelocityY(-330);
            }
        }

        // dash
        if (
            Phaser.Input.Keyboard.JustDown(this.keys.SHIFT) &&
            this.canDash &&
            !this.hasDashed
        ) {
            this.isDashing = true;
            this.canDash = false;
            this.hasDashed = true;

            let x = this.keys.A.isDown ? -1 : this.keys.D.isDown ? 1 : 1;
            let y = this.keys.W.isDown ? -1 : this.keys.S.isDown ? 1 : 0;

            const len = Math.sqrt(x * x + y * y);
            x /= len;
            y /= len;

            this.sprite.setVelocity(x * 500, y * 500);

            this.scene.time.delayedCall(150, () => {
                this.isDashing = false;
                this.sprite.setVelocity(0, this.sprite.body.velocity.y);
            });

            this.scene.time.delayedCall(1000, () => {
                this.canDash = true;
            });
        }
    }
}