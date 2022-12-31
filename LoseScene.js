class LoseScene extends Phaser.Scene {

    constructor () {
        super({ key: 'LoseScene' });
    }

    preload () {    
        this.load.path = './assets/';
    }

    create () {
        const { width, height } = this.scale;

        this.add.text(width/2, height/2, "GAME OVER")
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({ color: '#ff0' })
            .setFontSize('104px')
            .setFontFamily('"PressStart2P", cursive')
            .setShadow(10, 10, 'black', 5);
    }

    update (time, delta) {

    }
}