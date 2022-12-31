class Button {
    constructor(x, y, label, scene, callback) {

        var button = scene.add.text(x, y, label)
                    .setOrigin(0.5)
                    .setPadding(10)
                    //.setStyle({ backgroundColor: '#222' })
                    .setFontSize('42px')
                    .setFontFamily('"PressStart2P", cursive')
                    .setInteractive({ useHandCursor: true })
                    .on('pointerdown', () => callback(scene))
                    .on('pointerover', () => button.setStyle({ fill: '#ff0f0f' }))
                    .on('pointerout', () => button.setStyle({ fill: '#fff' }));
    }
}