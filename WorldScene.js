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
    worldTime = 0;
    worldTimer;

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
    cellTick = 20; //rate at which new cells are generated - seconds
    cellsPerTick = 1; //number of cells generated per tick
    maxCells = 20; //number of cells to lose the game
    currentCellCount = 0;

    preload () {
        this.load.path = './assets/';

        this.load.spritesheet('fireball', 'fireball-sprite-sheet-green.png', { frameWidth: 512, frameHeight: 512 });

        this.load.image('background', 'images/background.jpg');
        this.load.image('player', 'images/player.png');
        this.load.image('cancer', 'images/cancer-cell.png');
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

        this.add.image(0,0,'background').setOrigin(0);

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
            let cancerCell = new CancerCell(this.matter.world, Phaser.Math.Between(100, 1948),Phaser.Math.Between(100, 1948), 'cancer', 50).setStatic(true).setSensor(true);
            this.currentCellCount++;
        }

        this.player = this.matter.add.sprite(500,300, 'player').setScale(0.2);
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
        this.worldTimer = this.time.addEvent({ delay: 1000, callback: this.incrementWorldTime, callbackScope: this, loop: true });

        this.scene.launch('UIScene');
    }

    incrementWorldTime() {
        this.worldTime++;
    }

    generateCell() {
        for (let i = 0; i < this.cellsPerTick; i++) {
            let cancerCell = new CancerCell(this.matter.world, Phaser.Math.Between(100, 1948), Phaser.Math.Between(100, 1948), 'cancer', 50).setStatic(true).setSensor(true);
            this.currentCellCount++;
        }

        if (this.currentCellCount >= this.maxCells) {
            this.cellTimer.remove(false);
            this.loadGameOverScene(false);
        }
    }

    collision(event, object1, object2) {
        if ((object1.label == "cancer" && object2.label == "bullet")) {
            this.cancerEmitter.active = true;
            this.cancerEmitter.explode(3000, object1.gameObject.x, object1.gameObject.y);
            object1.gameObject.receiveHit(10);
            this.resetBullet(object2.gameObject);
            
            if (this.currentCellCount <= 0)
                this.loadGameOverScene(true);

            return;
        }
        else if (object1.label == "bullet" && object2.label == "cancer") {
            this.cancerEmitter.active = true;
            this.cancerEmitter.explode(3000, object2.gameObject.x, object2.gameObject.y);
            object2.gameObject.receiveHit(10);            
            this.resetBullet(object1.gameObject);

            if (this.currentCellCount <= 0)
                this.loadGameOverScene(true);

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
        bullet.x = -100;
        bullet.y = -100;
        bullet.setVelocity(0);
    }

    loadGameOverScene(isWin) {
        this.scene.pause();
        this.add.rectangle(0, 0, 2048, 2048, 0x000000).setOrigin(0,0).setAlpha(0.3);

        if (isWin) {
            this.scene.launch('WinScene');
        } else {
            this.scene.launch('LoseScene');
        }       
    }
}