class WinScene extends Phaser.Scene {

    constructor () {
        super({ key: 'WinScene' });
    }

    preload () {    
        this.load.path = './assets/';
    }

    create () {
        const { width, height } = this.scale;

        this.add.text(width/2, height/2, "YOU WON!")
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({ color: '#ff0' })
            .setFontSize('104px')
            .setFontFamily('"PressStart2P", cursive')
            .setShadow(10, 10, 'black', 5);

        let playAgainButton = new Button(this, width/2, height-100,"Play Again", null, null, null, null, this.playAgain)
    }

    update (time, delta) {

    }

    playAgain(parentScene) {
        parentScene.scene.start("WorldScene");
    }
}