const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: [BootScene, LoadingScene, MainMenuScene, WorldScene, UIScene, WinScene, LoseScene],
    physics: {
        default: "matter",
        matter: {
            gravity: { y: 0 },
            debug: false
        }
    },
    fps: { 
        forceSetTimeOut: true,
        target: 60
    },
    scale: {
        parent: 'gamediv',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    }
};

let game = new Phaser.Game(config);
