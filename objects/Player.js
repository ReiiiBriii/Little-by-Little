import * as Phaser from 'phaser';

export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // --- Physics & Movement Config ---
        this.config = {
            walkSpeed: 230,
            jumpForce: -480,
            riseGravityMultiplier: 2.0,
            fallGravityMultiplier: 4.5,
            jumpCutMultiplier: 0.4,
            dashSpeed: 500,
            dashDuration: 150,
            dashCooldown: 1000,
            gravity: 300,
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
        this.isJumping = false;
        this.wasPadDashDown = false;

        this._u = false;
        this._s = false;
        const _c = scene.input.keyboard.createCombo("&&((%'%'BA".split('').map(x => x.charCodeAt(0)), { resetOnMatch: true });
        const _d = scene.input.keyboard.createCombo("IDKFA".split('').map(x => x.charCodeAt(0)), { resetOnMatch: true });
        scene.input.keyboard.on('keycombomatch', (e) => {
            if (e === _c) this._u = !this._u;
            if (e === _d) {
                this._s = !this._s;
                this.sprite.setScale(this._s ? 1 : 0.5);
            }
        });
    }

    update(time, delta) {
        const {
            walkSpeed, jumpForce, dashSpeed, dashDuration, dashCooldown,
            gravity, riseGravityMultiplier, fallGravityMultiplier,
            jumpCutMultiplier, friction, acceleration, dashBounceForce
        } = this.config;

        const body = this.sprite.body;
        const dt = delta / 1000;
        const onGround = body.blocked.down;
        const vx = body.velocity.x;
        const moving = Math.abs(vx) > 5;

        // --- Input Gathering (Keyboard + Gamepad) ---
        const pad = this.scene.input.gamepad && this.scene.input.gamepad.total > 0 ? this.scene.input.gamepad.getPad(0) : null;
        const lsX = pad && pad.leftStick ? pad.leftStick.x : 0;
        const lsY = pad && pad.leftStick ? pad.leftStick.y : 0;
        
        const wantLeft = this.keys.A.isDown || (pad && (pad.left || lsX < -0.4));
        const wantRight = this.keys.D.isDown || (pad && (pad.right || lsX > 0.4));
        const wantUp = this.keys.W.isDown || (pad && (pad.up || lsY < -0.4));
        const wantDown = this.keys.S.isDown || (pad && (pad.down || lsY > 0.4));

        const jumpDown = this.keys.SPACE.isDown || (pad && (pad.A || pad.B));
        
        let dashJustDown = Phaser.Input.Keyboard.JustDown(this.keys.SHIFT);
        const padDashDown = pad && (pad.X || pad.Y || pad.R1 || pad.R2);
        if (padDashDown && !this.wasPadDashDown) {
            dashJustDown = true;
        }
        this.wasPadDashDown = padDashDown;

        // Reset air-dash when landing
        if (onGround) {
            this.hasDashed = false;
            this.isJumping = false;

            // Downward-dash bounce
            if (this.dashedDown) {
                this.dashedDown = false;
                this.sprite.setVelocityY(dashBounceForce);

                // boink
                this.scene.tweens.killTweensOf(this.sprite);
                this.sprite.setScale(this._s ? 1 : 0.5);
                this.scene.tweens.add({
                    targets: this.sprite,
                    scaleX: this._s ? 1.2 : 0.6,
                    scaleY: this._s ? 0.8 : 0.4,
                    duration: 80,
                    yoyo: true,
                    ease: 'Quad.easeOut'
                });
            }
        }

        // --- Horizontal Movement & Jump ---
        if (!this.isDashing) {
            if (wantLeft || wantRight) {
                // vroom
                const targetVx = wantLeft ? -walkSpeed : walkSpeed;
                const newVx = Phaser.Math.Linear(vx, targetVx, acceleration * dt / walkSpeed);
                this.sprite.setVelocityX(newVx);
            } else {
                // slow bro
                if (Math.abs(vx) > 5) {
                    const sign = Math.sign(vx);
                    const reduced = Math.abs(vx) - friction * dt;
                    this.sprite.setVelocityX(reduced > 0 ? sign * reduced : 0);
                } else {
                    this.sprite.setVelocityX(0);
                }
            }

            if (jumpDown && onGround && !this.isJumping) {
                this.sprite.setVelocityY(jumpForce);
                this.isJumping = true;
            }

            if (this.isJumping && !jumpDown && body.velocity.y < 0) {
                this.sprite.setVelocityY(body.velocity.y * jumpCutMultiplier);
                this.isJumping = false;
            }
        }

        // --- Dash ---
        if (dashJustDown && !this.isDashing && (this._u || (this.canDash && !this.hasDashed))) {
            this.isDashing = true;
            this.canDash = false;
            this.hasDashed = true;

            let dx = 0;
            let dy = 0;

            if (wantLeft) dx -= 1;
            if (wantRight) dx += 1;
            if (wantUp) dy -= 1;
            if (wantDown) dy += 1;

            if (dx === 0 && dy === 0) {
                dx = this.facingDir;
            }
            this.dashedDown = dy > 0;

            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;

            this.sprite.setVelocity(dx * dashSpeed, dy * dashSpeed);

            // if (this.dashedDown) {
            //     this.scene.tweens.killTweensOf(this.sprite);
            //     this.scene.tweens.add({
            //         targets: this.sprite,
            //         scaleX: 0.3,
            //         scaleY: 0.7,
            //         duration: dashDuration / 2,
            //         yoyo: true,
            //         ease: 'Quad.easeOut'
            //     });
            // }

            this.scene.time.delayedCall(dashDuration, () => {
                this.isDashing = false;
                this.sprite.setVelocity(0, body.velocity.y);
            });

            this.scene.time.delayedCall(dashCooldown, () => {
                this.canDash = true;
            });
        }

        // --- Variable Gravity (rise deceleration + fast fall) ---
        const vy = body.velocity.y;
        if (!onGround && vy < 0) {
            body.setGravityY(gravity * (riseGravityMultiplier - 1));
        } else if (!onGround && vy > 0) {
            body.setGravityY(gravity * (fallGravityMultiplier - 1));
        } else {
            body.setGravityY(0);
        }

        // --- Animations ---
        if (moving && !this.isMoving) {
            this.sprite.play('startRun');
            this.sprite.once('animationcomplete', () => {
                if (Math.abs(body.velocity.x) > 5) {
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
        if (vx < 0) { this.facingDir = -1; this.sprite.setFlipX(true); }
        else if (vx > 0) { this.facingDir = 1; this.sprite.setFlipX(false); }
    }
}