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

        this.add.image(width*0.5,height*0.6,'button').setScale(0.5);
        this.add.text(width*0.5,height*0.58, 'Play', { font: '40px Impact', fill: 'Yellow', align: 'center' }).setOrigin(0.5);
    }

    update (time, delta) {

    }
}

class UIScene extends Phaser.Scene {
    
    world;
    score;
    scoreText;
    timeText;
    totalCells;
    cellCount;
    cellCountText;

    constructor () {
        super({ key: 'UIScene', active: true });
        this.score = 0;
        this.cellCount = 0;
    }

    create () {
        this.scoreText = this.add.text(this.scale.gameSize.width/2, 20, 'Score: 0000', { font: '32px Impact', fill: 'Cyan', align: 'center' }).setOrigin(0.5);
        this.timeText = this.add.text(100, 20, '', { font: '32px Impact', fill: 'Cyan', align: 'left' }).setOrigin(0.5);
        this.cellCountText = this.add.text(this.scale.gameSize.width-100, 20, '', { font: '32px Impact', fill: 'Cyan', align: 'right' }).setOrigin(0.5);

        this.world = this.scene.get('WorldScene');

        this.world.events.on('addScore', this.addScore, this);
    }

    update (time, delta) {
        this.timeText.setText('Time: ' + String(parseInt(time/1000)).padStart(4, '0'));
        this.cellCountText.setText('Cells:' + String(parseInt(this.world.currentCellCount)).padStart(2,'0'));
    }

    addScore() {
        this.score += 10;
        this.scoreText.setText('Score: ' + String(parseInt(this.score)).padStart(4, '0'));
    }
}

class CancerCell extends Phaser.Physics.Matter.Sprite {

    health = 10;

    constructor (world, x, y, texture, health) {
        super(world, x, y, texture);

        this.setTexture(texture);
        this.setPosition(x, y);
        this.body.label = "cancer";
        this.health = health;
        world.scene.add.existing(this);
        world.scene.matter.add.sprite(this);
    }

    create() {

    }

    preUpdate (time, delta) {
        super.preUpdate(time, delta);
    }

    receiveHit(damage) {
        this.health -= damage;
        if (this.health <= 0)
            this.destroy()
    }

    destroy() {
        this.scene.events.emit('addScore');
        this.scene.currentCellCount--;
        super.destroy();
    }
}

class WorldScene extends Phaser.Scene {
    
    constructor () {
        super('WorldScene');
    }

    //World
    camera;
    player;
    cancer;
    cancerGroup;
    cursors;

    //Weapon & Bullets
    maxBullets = 10;
    currentBullet = 0;
    bullets = [];
    bullet;
    isBulletOut = false;
    bulletGroup;

    //Keys
    spaceKey;

    //Cancer
    cellTimer;
    cancerEmitter;
    initialCellCount = 10; //number of cells to start with
    cellTick = 5; //rate at which new cells are generated - seconds
    cellsPerTick = 1; //number of cells generated per tick
    maxCells = 20; //number of cells to lose the game
    currentCellCount = 0;

    preload () {    
        this.load.path = './assets/';

        this.load.spritesheet('fireball', 'fireball-sprite-sheet-green.png', { frameWidth: 512, frameHeight: 512 });

        this.load.image('map', 'background.jpg');
        this.load.image('tcell', 'tcell.png');
        this.load.image('cancer', 'cancer.png');
        this.load.image('bullet', 'bullet.png');
        this.load.image('particle', 'particles-single.png');
        this.load.image('rock-tile-small', 'rock-tile-small.png');
    }

    create () {
        this.matter.set60Hz();
        this.scene.get('UIScene').cellCount = this.initialCellCount;
        this.anims.create({
            key: 'fireball',
            frames: this.anims.generateFrameNumbers('fireball', { frames: [ 0, 1, 2, 3, 4, 5 ] }),
            frameRate: 8,
            repeat: -1
        });

        this.matter.world.setBounds(0, 0, 2048, 2048);
        this.cameras.main.setBounds(0, 0, 2048, 2048);

        this.add.image(0,0,'map').setOrigin(0);

        let particles = this.add.particles('particle');

        this.cancerEmitter = particles.createEmitter({
            alpha: {start: 1, end: 0.1, ease: 'Expo.easeOut'},
            blendMode: 'SCREEN',
            scale: {start: 0.3, end: 0},
            lifespan: 300,
            tint: 0xde16d1,
            angle: { min: 0, max: 360 },
            speed: 350
        });

        this.cancerEmitter.active = false;

        this.cancerGroup = this.matter.world.nextGroup(true);
        this.bulletGroup = this.matter.world.nextGroup(true);

        for (let i = 0; i < this.initialCellCount; i++) {
            let cancerCell = new CancerCell(this.matter.world, Phaser.Math.Between(100, 1948), Phaser.Math.Between(100, 1948), 'cancer', 50).setStatic(true).setSensor(true);
            this.currentCellCount++;
        }

        this.player = this.matter.add.sprite(500,300, 'tcell');
        this.player.setCollisionGroup(this.bulletGroup);
        this.cameras.main.startFollow(this.player, true);

        this.matter.add.sprite(800, 800, 'rock-tile-small').setStatic(true);

        for (let i = 0; i < this.maxBullets; i++) {
            let b = this.matter.add.sprite(-100, -100, 'bullet');
            b.body.label = "bullet";
            b.setCollisionGroup(this.bulletGroup);
            b.visible = false;
            b.setMass(0.1);
            this.bullets.push(b);
        }

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.matter.world.on('collisionstart', this.collision, this);
        this.cellTimer = this.time.addEvent({ delay: this.cellTick * 1000, callback: this.generateCell, callbackScope: this, loop: true });
    }

    generateCell() {
        for (let i = 0; i < this.cellsPerTick; i++) {
            let cancerCell = new CancerCell(this.matter.world, Phaser.Math.Between(100, 1948), Phaser.Math.Between(100, 1948), 'cancer', 50).setStatic(true).setSensor(true);
            this.currentCellCount++;
        }

        if (this.currentCellCount >= this.maxCells) {
            this.cellTimer.remove(false);
        }
    }

    collision(event, object1, object2) {
        if ((object1.label == "cancer" && object2.label == "bullet")) {
            this.cancerEmitter.active = true;
            this.cancerEmitter.explode(3000, object1.gameObject.x, object1.gameObject.y);
            object1.gameObject.receiveHit(10);
            this.resetBullet(object2.gameObject);
            return;
        }
        else if (object1.label == "bullet" && object2.label == "cancer") {
            this.cancerEmitter.active = true;
            this.cancerEmitter.explode(3000, object2.gameObject.x, object2.gameObject.y);
            object2.gameObject.receiveHit(10);            
            this.resetBullet(object1.gameObject);
            return;
        }

        if ((object1.label == "bullet")) {
            this.resetBullet(object1.gameObject);
            return;
        }
        else if (object2.label == "bullet") {
            this.resetBullet(object2.gameObject);
            return;
        }
    }

    update(time, delta) {
    
        if (this.cursors.up.isDown)
        {
            this.matter.applyForceFromAngle(this.player, 0.002, this.player.rotation);
        }

        if (this.cursors.left.isDown)
        {
            this.player.setAngularVelocity(-0.05);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setAngularVelocity(0.05);
        }
        else
        {
            this.player.setAngularVelocity(0);
        }
            
        if (this.spaceKey.isDown) {
            if (!this.isBulletOut) {

                let bullet = this.bullets[this.currentBullet];
                if (this.currentBullet == this.maxBullets - 1)
                    this.currentBullet = 0;
                else
                    this.currentBullet++;

                this.time.delayedCall(200, this.bulletReady, [], this);
                this.time.delayedCall(800, this.bulletLifetime, [bullet], this);
                bullet.x = this.player.x;
                bullet.y = this.player.y;
                bullet.visible = true;
                bullet.rotation = this.player.rotation;
                bullet.setScale(0.3);
                bullet.play('fireball');
                this.matter.applyForceFromPosition(bullet, this.player.body.position, 0.0008, this.player.rotation);
                this.isBulletOut = true;
            }
        }
    }

    bulletReady () {
        this.isBulletOut = false;
    }

    bulletLifetime(bullet) {
        this.resetBullet(bullet);
    }

    resetBullet(bullet) {
        bullet.visible = false;
        //bullet.active = false;
        bullet.x = -100;
        bullet.y = -100;
        bullet.setVelocity(0);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: [WorldScene, UIScene],
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