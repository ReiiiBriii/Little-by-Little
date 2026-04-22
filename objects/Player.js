import * as Phaser from 'phaser';

export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // --- Physics & Movement Config ---
        this.config = {
            walkSpeed: 230,
            jumpForce: -330,
            dashSpeed: 500,
            dashDuration: 150,   // ms
            dashCooldown: 1000,  // ms
            gravity: 300,
            fallGravityMultiplier: 2.5,
            friction: 500,
            acceleration: 800,
            dashBounceForce: -200,
        };

        // --- Sprite Setup ---
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setScale(0.5);
        this.sprite.play('idle');
        this.sprite.setCollideWorldBounds(true);

        // --- Input ---
        this.keys = scene.input.keyboard.addKeys('W,A,S,D,SPACE,SHIFT');

        // --- State Flags ---
        this.canDash = true;
        this.hasDashed = false;
        this.isDashing = false;
        this.isMoving = false;
        this.facingDir = 1;
        this.dashedDown = false;
    }

    update(time, delta) {
        const {
            walkSpeed, jumpForce, dashSpeed, dashDuration, dashCooldown,
            friction, acceleration, dashBounceForce
        } = this.config;
        const dt = delta / 1000;              // seconds this frame
        const onGround = this.sprite.body.blocked.down;
        const vx = this.sprite.body.velocity.x;
        const moving = Math.abs(vx) > 5;

        // Reset air-dash when landing
        if (onGround) {
            this.hasDashed = false;

            // Downward-dash bounce
            if (this.dashedDown) {
                this.dashedDown = false;
                this.sprite.setVelocityY(dashBounceForce);
            }
        }

        // --- Horizontal Movement & Jump ---
        if (!this.isDashing) {
            const wantLeft = this.keys.A.isDown;
            const wantRight = this.keys.D.isDown;

            if (wantLeft || wantRight) {
                // Accelerate toward target speed
                const targetVx = wantLeft ? -walkSpeed : walkSpeed;
                const newVx = Phaser.Math.Linear(vx, targetVx, acceleration * dt / walkSpeed);
                this.sprite.setVelocityX(newVx);
            } else {
                // Apply friction to decelerate
                if (Math.abs(vx) > 5) {
                    const sign = Math.sign(vx);
                    const reduced = Math.abs(vx) - friction * dt;
                    this.sprite.setVelocityX(reduced > 0 ? sign * reduced : 0);
                } else {
                    this.sprite.setVelocityX(0);
                }
            }

            if (this.keys.SPACE.isDown && onGround) {
                this.sprite.setVelocityY(jumpForce);
            }
        }

        // --- Dash ---
        if (Phaser.Input.Keyboard.JustDown(this.keys.SHIFT) && this.canDash && !this.hasDashed) {
            this.isDashing = true;
            this.canDash = false;
            this.hasDashed = true;

            let dx = 0;
            let dy = 0;

            if (this.keys.A.isDown) dx -= 1;
            if (this.keys.D.isDown) dx += 1;
            if (this.keys.W.isDown) dy -= 1;
            if (this.keys.S.isDown) dy += 1;

            // No direction held → dash in the direction the player is facing
            if (dx === 0 && dy === 0) {
                dx = this.facingDir;
            }

            // Track downward dashes for bounce
            this.dashedDown = dy > 0;

            // Normalize so diagonal dashes aren't faster
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;

            this.sprite.setVelocity(dx * dashSpeed, dy * dashSpeed);

            this.scene.time.delayedCall(dashDuration, () => {
                this.isDashing = false;
                this.sprite.setVelocity(0, this.sprite.body.velocity.y);
            });

            this.scene.time.delayedCall(dashCooldown, () => {
                this.canDash = true;
            });
        }

        // --- Variable Gravity ---
        const vy = this.sprite.body.velocity.y;
        if (!onGround && vy > 0) {
            const extraGravity = this.config.gravity * (this.config.fallGravityMultiplier - 1);
            this.sprite.body.setGravityY(extraGravity);
        } else {
            this.sprite.body.setGravityY(0);
        }

        // --- Animations ---
        if (moving && !this.isMoving) {
            this.sprite.play('startRun');
            this.sprite.once('animationcomplete', () => {
                if (Math.abs(this.sprite.body.velocity.x) > 5) {
                    this.sprite.play('runHold');
                }
            });
        }

        if (!moving && this.isMoving) {
            this.sprite.play('stopRun');
        }

        this.isMoving = moving;
        this.updateFacing();
    }

    updateFacing() {
        const vx = this.sprite.body.velocity.x;
        if (vx < 0) {
            this.facingDir = -1;
            this.sprite.setFlipX(true);
        } else if (vx > 0) {
            this.facingDir = 1;
            this.sprite.setFlipX(false);
        }
    }
}