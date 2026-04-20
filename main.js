import * as Phaser from 'phaser';
import MainMenu from './scenes/MainMenu.js';
import Level1 from './scenes/Level1.js';

new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MainMenu, Level1],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 }
        }
    }
});