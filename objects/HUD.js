/**
 * HUD — Shows collected upgrade icons pinned to the top-left corner.
 *
 * Uses a dedicated camera (zoom 1, no scroll) so icon positions are exact
 * screen pixels. Camera is only created when icons exist.
 */
export default class HUD {
    constructor(scene) {
        this.scene = scene;
        this.icons = [];
        this.camera = null;
        this.depth = 900;

        // Icon config — exact screen pixels
        this.iconSize = 48;
        this.iconGap = 6;
        this.margin = 6;

        this.build();
    }

    build() {
        const springCollected = this.scene.registry.get('springCollected') || false;
        const dashCollected = this.scene.registry.get('dashUpgradeCollected') || false;

        // Nothing collected — no camera, no icons
        if (!springCollected && !dashCollected) return;

        // Count how many icons we need
        let count = 0;
        if (springCollected) count++;
        if (dashCollected) count++;

        // Create the HUD camera sized exactly to fit the icons
        const vpW = this.margin + count * (this.iconSize + this.iconGap);
        const vpH = this.margin + this.iconSize + this.margin;
        this.camera = this.scene.cameras.add(0, 0, vpW, vpH);
        this.camera.setScroll(0, 0);
        this.camera.transparent = true;

        // Ignore all existing game objects so only HUD icons render
        this.scene.children.each(child => {
            this.camera.ignore(child);
        });

        // Add icons
        let slot = 0;
        if (springCollected) this.addIcon(slot++, 3, 'springCollected');
        if (dashCollected) this.addIcon(slot++, 2, 'dashUpgradeCollected');
    }

    addIcon(slot, frame, registryKey) {
        const s = this.scene;

        const x = this.margin + slot * (this.iconSize + this.iconGap);
        const y = this.margin;

        // Dark background
        const bg = s.add.rectangle(x, y, this.iconSize, this.iconSize, 0x000000, 0.4)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(this.depth - 1);

        // Icon sprite
        const icon = s.add.image(x, y, 'collectibles', frame)
            .setOrigin(0, 0)
            .setDisplaySize(this.iconSize, this.iconSize)
            .setScrollFactor(0)
            .setDepth(this.depth);

        // Main camera ignores HUD elements
        s.cameras.main.ignore([bg, icon]);

        this.icons.push({ icon, bg, registryKey });
    }

    refresh() {
        this.destroyAll();
        this.build();
    }

    popIcon(registryKey) {
        this.refresh();
        const entry = this.icons.find(e => e.registryKey === registryKey);
        if (!entry) return;

        const origX = entry.icon.scaleX;
        const origY = entry.icon.scaleY;
        entry.icon.setScale(origX * 1.6, origY * 1.6);
        this.scene.tweens.add({
            targets: entry.icon,
            scaleX: origX,
            scaleY: origY,
            duration: 350,
            ease: 'Back.easeOut'
        });
    }

    destroyAll() {
        for (const entry of this.icons) {
            if (entry.icon) entry.icon.destroy();
            if (entry.bg) entry.bg.destroy();
        }
        this.icons = [];
        if (this.camera) {
            this.scene.cameras.remove(this.camera);
            this.camera = null;
        }
    }

    destroy() {
        this.destroyAll();
    }
}
