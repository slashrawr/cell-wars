class UIScene extends Phaser.Scene {
    
    world;
    score;
    scoreText;
    timeText;
    totalCells;
    cellCount;
    cellCountText;

    //mobile controls
    rightButton;
    leftButton;
    upButton;
    fireButton;

    constructor () {
        super({ key: 'UIScene' });
        this.score = 0;
        this.cellCount = 0;
    }

    create () {
        const { width, height } = this.scale;

        this.input.addPointer(4);

        this.scoreText = this.add.text(width/2, 40, 'Score: 0', { font: '20px PressStart2P', fill: '#FF0', align: 'center' }).setOrigin(0.5,0.5).setShadow(5, 5, 'black', 5);;
        this.timeText = this.add.text(60, 40, '', { font: '20px PressStart2P', fill: '#FF0', align: 'left' }).setOrigin(0, 0.5).setShadow(5, 5, 'black', 5);;
        this.cellCountText = this.add.text(width-60, 40, '', { font: '20px PressStart2P', fill: '#FF0', align: 'right' }).setOrigin(1.0,0.5).setShadow(5, 5, 'black', 5);;

        this.world = this.scene.get('WorldScene');

        this.world.events.on('addScore', this.addScore, this);
        this.createMobileControls();
    }

    processButtonDown(pointer, gameObject) {
        console.log(pointer);
        console.log(gameObject);
        this.scene.world.spaceKey.isDown = true;
    }

    processButtonUp(pointer, gameObject) {
        this.scene.world.spaceKey.isDown = false;
    }

    createMobileControls() {
        const { width, height } = this.scale;

        this.fireButton = this.add.ellipse(100, height-100, 200, 200).setFillStyle(0xFFFFFF, 0.8)
        .setInteractive()
        .on('pointerdown', this.triggerFireOn)
        .on('pointerup', this.triggerFireOff);

        this.rightButton = this.add.ellipse(width-100, height-100, 200, 200).setFillStyle(0xFFFFFF, 0.8)
        .setInteractive()
        .on('pointerdown', this.triggerRightOn)
        .on('pointerup', this.triggerRightOff);

        this.leftButton = this.add.ellipse(width-300, height-100, 200, 200).setFillStyle(0xFFFFFF, 0.8)
        .setInteractive()
        .on('pointerdown', this.triggerLeftOn)
        .on('pointerup', this.triggerLeftOff);
        
        this.upButton = this.add.ellipse(width-200, height-200, 200, 200).setFillStyle(0xFFFFFF, 0.8)
        .setInteractive()
        .on('pointerdown', this.triggerUpOn)
        .on('pointerup', this.triggerUpOff);
    }

    triggerFireOn() {
        this.scene.world.spaceKey.isDown = true;
    }

    triggerFireOff() {
        this.scene.world.spaceKey.isDown = false;
    }

    triggerUpOn() {
        this.scene.world.cursors.up.isDown = true;
    }

    triggerUpOff() {
        this.scene.world.cursors.up.isDown = false;
    }

    update (time, delta) {
        this.timeText.setText('Time: ' + String(parseInt(this.world.worldTime)).padStart(4, '0'));
        this.cellCountText.setText('Cells:' + String(parseInt(this.world.currentCellCount)).padStart(2,'0') + "/" + this.world.maxCells);
    }

    triggerRightOn() {
        this.scene.world.cursors.right.isDown = true;
    }

    triggerRightOff() {
        this.scene.world.cursors.right.isDown = false;
    }

    triggerLeftOn() {
        this.scene.world.cursors.left.isDown = true;
    }

    triggerLeftOff() {
        this.scene.world.cursors.left.isDown = false;
    }

    addScore() {
        this.score += 10;
        this.scoreText.setText('Score: ' + String(parseInt(this.score)));
    }
}