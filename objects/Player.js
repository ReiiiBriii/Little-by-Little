import * as Phaser from 'phaser';
export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.debugGraphics = scene.add.graphics();
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setScale(0.5);
        this.sprite.play('idle');
        this.sprite.setCollideWorldBounds(true);

        this.keys = scene.input.keyboard.addKeys('W,A,S,D,SPACE,SHIFT');

        this.canDash = true;
        this.hasDashed = false;
        this.isDashing = false;
    }

    update() {

        // this.debugGraphics.clear();
        // this.debugGraphics.lineStyle(2, 0xff0000); // red outline

        // this.debugGraphics.strokeRect(
        //     this.sprite.body.x,
        //     this.sprite.body.y,
        //     this.sprite.body.width,
        //     this.sprite.body.height
        // );



        const onGround = this.sprite.body.blocked.down;

        if (onGround) {
            this.hasDashed = false;
        }

        // movement
        let walkSpeed = 160;
        let jumpSpeed = -330;
        let dashSpeed = 500;
        let dashDuration = 150;
        let dashCooldown = 1000;

        if (!this.isDashing) {
            let currentVelocityX = this.sprite.body.velocity.x;

            if (this.keys.A.isDown) {
                this.sprite.setVelocityX(-walkSpeed);
            } 
            else if (this.keys.D.isDown) {
                this.sprite.setVelocityX(walkSpeed);
            } 
            else {
                this.sprite.setVelocityX(0);
            }

            if (this.keys.SPACE.isDown && onGround) {
                this.sprite.setVelocityY(jumpSpeed);
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

            this.sprite.setVelocity(x * dashSpeed, y * dashSpeed);

            this.scene.time.delayedCall(dashDuration, () => {
                this.isDashing = false;
                this.sprite.setVelocity(0, this.sprite.body.velocity.y);
            });

            this.scene.time.delayedCall(dashCooldown, () => {
                this.canDash = true;
            });
        }
    }
}