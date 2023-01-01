class MainMenuScene extends Phaser.Scene {

    playButton;
    howToButton;
    howToDialog;
    howToTextHeading;
    howToText;
    howToOKButton;
    instructionsText = "Control the T-Cell using CURSOR keys.\nShoot using SPACEBAR.\nCancer cells will be generated at a regular rate.\nDestroy all the cancer cells before the maximum number of cells is generated.";

    constructor () {
        super({ key: 'MainMenuScene' });
    }

    preload () {    
        this.load.path = './assets/';
    }

    create () {
        const { width, height } = this.scale;
        this.playButton = new Button(this, width/2, height/2-100, "Start Game", null, null, null, null, this.play);
        this.howToButton = new Button(this, width/2, height/2+100, "How To Play", null, null, null, null, this.howTo);
    }

    update (time, delta) {

    }

    destroy() {
        this.howToDialog.destroy();
        this.howToButton.destroy();
        this.playButton.destroy();
        this.howToTextHeading.destroy();
        this.howToText.destroy();
        this.howToOKButton.destroy();
        this.instructionsText.destroy();
    }

    play(parentScene) {
        parentScene.scene.start('WorldScene');
    }

    showButtons() {
        this.playButton.setVisible(true);
        this.howToButton.setVisible(true);
    }

    hideButtons() {
        this.playButton.setVisible(false);
        this.howToButton.setVisible(false);
    }

    howTo(scene) {
        scene.hideButtons();
        const { width, height } = scene.scale;
        let dialogX = 100;
        let dialogY = 100;
        let dialogWidth = width-(dialogX*2);
        let dialogHeight = height-(dialogY*2);
        scene.howToDialog = scene.add.rectangle(dialogX,dialogY,dialogWidth,dialogHeight,0x555555).setOrigin(0);
        scene.howToTextHeading = scene.add.text(width/2, dialogY+50,"How To Play!", { font: '20px PressStart2P', fill: '#000000', align: 'center' }).setOrigin(0.5,0.5);
        scene.howToText = scene.add.text(width/2, dialogY+100, scene.instructionsText, { font: '20px PressStart2P', fill: '#000000', align: 'justify' })
        .setOrigin(0.5,0)
        .setWordWrapWidth(dialogWidth-50)
        .setLineSpacing(20);
        scene.howToOKButton = new Button(scene, width/2, dialogHeight,"OK", null, null, null, null, function() {
            scene.howToDialog.destroy();
            scene.howToTextHeading.destroy();
            scene.howToText.destroy();
            scene.howToOKButton.destroy();
            scene.showButtons();

        })
    }
}