import * as Phaser from 'phaser';
import MainMenu from './scenes/MainMenu.js';
import Level1 from './scenes/Level1.js';

new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: window.innerWidth,
        height: window.innerHeight
    },
    input: {
        gamepad: true
    },
    scene: [MainMenu, Level1],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 }
        }
    }
});