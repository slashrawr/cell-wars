const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: [MainMenuScene, WorldScene, UIScene, WinScene, LoseScene],
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
    }
};

let game = new Phaser.Game(config);