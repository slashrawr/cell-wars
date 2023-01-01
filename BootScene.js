class BootScene extends Phaser.Scene {

    constructor () {
        super({ key: 'BootScene' });
    }

    preload () {    
        this.load.json('assets', 'assets.json');
    }

    create () {
        this.scene.start("LoadingScene");
        this.scene.destroy();
    }
}