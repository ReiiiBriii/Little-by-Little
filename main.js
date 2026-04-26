import * as Phaser from 'phaser';
import MainMenu from './scenes/MainMenu.js';
import Options from './scenes/Options.js';
import PauseMenu from './scenes/PauseMenu.js';
import Level1 from './scenes/Level1.js';
import Level2 from './scenes/Level2.js';
import Level3 from './scenes/Level3.js';
import Credits from './scenes/Credits.js';

new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    },
    input: {
        gamepad: true
    },
    scene: [MainMenu, Options, PauseMenu, Level1, Level2, Level3, Credits],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            fps: 180,
            fixedStep: true,
            tileBias: 48
        }
    }
});