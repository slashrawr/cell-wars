class MainMenuScene extends Phaser.Scene {

    constructor () {
        super({ key: 'MainMenuScene' });
    }

    preload () {    
        this.load.path = './assets/';
        this.load.image('button', 'button.png');
    }

    create () {
        const { width, height } = this.scale;
        const playButton = new Button(width/2, height/2-100, "Play", this, this.play);
        const howToButton = new Button(width/2, height/2+100, "How To", this, this.howTo);
    }

    update (time, delta) {

    }

    play(parentScene) {
        parentScene.scene.start('WorldScene');
    }

    howTo(scene) {
        console.log("How to button!");
    }
}