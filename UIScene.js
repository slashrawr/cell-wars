class UIScene extends Phaser.Scene {
    
    world;
    score;
    scoreText;
    timeText;
    totalCells;
    cellCount;
    cellCountText;

    constructor () {
        super({ key: 'UIScene', active: false });
        this.score = 0;
        this.cellCount = 0;
    }

    create () {
        const { width, height } = this.scale;

        this.scoreText = this.add.text(width/2, 40, 'Score: 0', { font: '20px PressStart2P', fill: '#FF0', align: 'center' }).setOrigin(0.5,0.5).setShadow(10, 10, 'black', 5);;
        this.timeText = this.add.text(60, 40, '', { font: '20px PressStart2P', fill: '#FF0', align: 'left' }).setOrigin(0, 0.5).setShadow(10, 10, 'black', 5);;
        this.cellCountText = this.add.text(width-60, 40, '', { font: '20px PressStart2P', fill: '#FF0', align: 'right' }).setOrigin(1.0,0.5).setShadow(10, 10, 'black', 5);;

        this.world = this.scene.get('WorldScene');

        this.world.events.on('addScore', this.addScore, this);
    }

    update (time, delta) {
        this.timeText.setText('Time: ' + String(parseInt(this.world.worldTime)).padStart(4, '0'));
        this.cellCountText.setText('Cells:' + String(parseInt(this.world.currentCellCount)).padStart(2,'0'));
    }

    addScore() {
        this.score += 10;
        this.scoreText.setText('Score: ' + String(parseInt(this.score)));
    }
}