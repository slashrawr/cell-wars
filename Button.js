class Button extends Phaser.GameObjects.Text {

    constructor(scene, x, y, label, colour, backgroundColour, hoverOverColour, hoverOverBackgroundColour, callback) {
        super(scene,x,y,label);
        scene.add.existing(this);

        this.setStyle({ color: colour ? colour : '#000000', backgroundColor : backgroundColour ? backgroundColour : '#8B0000' })
            .setOrigin(0.5)
            .setPadding(30)
            .setFontSize('62px')
            .setFontFamily('"PressStart2P", cursive')
            .setInteractive({ useHandCursor: false })
            .on('pointerdown', () => callback(scene))
            .on('pointerover', () => this.setStyle({ color: hoverOverColour ? hoverOverColour : '#8B0000', backgroundColor : hoverOverBackgroundColour ? hoverOverBackgroundColour : '#FF0' }))
            .on('pointerout', () => this.setStyle({ color: colour ? colour : '#000000', backgroundColor : backgroundColour ? backgroundColour : '#8B0000' }));

        if (backgroundColour)
            this.setBackgroundColour(backgroundColour);
    }

    setBackgroundColour(colour) {
        this.setStyle({ backgroundColor: colour })
    }

    destroy() {
        super.destroy();
    }
}