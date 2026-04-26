import * as Phaser from 'phaser';

export default class Credits extends Phaser.Scene {
    constructor() {
        super('Credits');
    }

    preload() {
        // Load any assets needed for credits
        this.load.audio('menuMusic', 'assets/music/Robot Theme.mp3');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Black background
        const background = this.add.rectangle(0, 0, width, height, 0x000000)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(0);

        // Credits text
        const creditsText = [
            "Little by Little",
            "",
            "A Game Demo",
            "",
            "Thank you for playing!",
            "",
            "Created by:",
            "WalangPangalanTeam",
            "",
            "Programming",
            "Gelo",
            "Julio",
            "Rei", 
            "",
            "Game Design",
            "Rei",
            "",
            "Art",
            "Sam",
            "",
            "Music",
            "Vhon",
            "",
            "",
            "Stay tuned for more updates!",
            "",
            "",
            "Press SPACE to return to main menu"
        ];

        // Create text object
        const creditsDisplay = this.add.text(
            width / 2,
            height + 100, // Start below screen
            creditsText.join('\n'),
            {
                fontSize: '48px',
                color: '#ffffff',
                align: 'center',
                fontFamily: 'Arial',
                lineSpacing: 20
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1);

        // Play credits music
        const creditsMusic = this.sound.add('menuMusic', { volume: 0.6 });
        creditsMusic.play();

        // Track if credits are complete
        let creditsComplete = false;

        // Scroll text up
        this.tweens.add({
            targets: creditsDisplay,
            y: -creditsDisplay.height - 100, // Move above screen
            duration: 30000, // 30 seconds to scroll
            ease: 'Linear',
            onComplete: () => {
                creditsComplete = true;
            }
        });

        // Allow exit with space at any time
        const spaceHandler = () => {
            creditsMusic.stop();
            this.scene.start('mainMenu');
        };

        // Use persistent event listener
        this.input.keyboard.on('keydown-SPACE', spaceHandler);

        // Clean up event listener when scene is destroyed
        this.events.once('shutdown', () => {
            this.input.keyboard.off('keydown-SPACE', spaceHandler);
        });
    }
}
