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
    worldTime;
    worldTimer;

    //Weapon & Bullets
    maxBullets;
    currentBullet;
    bullets;
    bullet;
    isBulletOut;
    bulletGroup;

    //Keys
    spaceKey;

    //Cancer
    cellTimer;
    cancerEmitter;
    initialCellCount; //number of cells to start with
    cellTick; //rate at which new cells are generated - seconds
    cellsPerTick; //number of cells generated per tick
    maxCells; //number of cells to lose the game
    currentCellCount;

    init() {
        this.bullets = [];
        this.worldTime = 0;
        this.maxBullets = 10,
        this.currentBullet = 0;
        this.isBulletOut = false;
        this.initialCellCount = 1;
        this.cellTick = 5;
        this.cellsPerTick = 1;
        this.maxCells = 20;
        this.currentCellCount = 0;
    }

    preload () {
        this.load.path = './assets/';
    }

    create () {
        this.init();
        this.matter.set60Hz();
        this.scene.get('UIScene').cellCount = this.initialCellCount;
        this.anims.create({
            key: 'fireball',
            frames: this.anims.generateFrameNumbers('fireball', { frames: [ 0, 1, 2, 3, 4, 5 ] }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'player-slime',
            frames: this.anims.generateFrameNumbers('slime', { frames: [ 0, 1, 2, 3, 4, 5, 6, 7 ] }),
            frameRate: 10,
            repeat: -1
        });

        this.matter.world.setBounds(0, 0, 2048, 2048);
        this.cameras.main.setBounds(0, 0, 2048, 2048);

        this.add.image(0,0,'background').setOrigin(0).setDisplaySize(2048,2048);

        let particles = this.add.particles('particle');

        this.cancerEmitter = particles.createEmitter({
            alpha: {start: 1, end: 0.1, ease: 'Expo.easeOut'},
            blendMode: 'SCREEN',
            scale: {start: 0.3, end: 0},
            lifespan: 300,
            tint: 0x00ff00,
            angle: { min: 0, max: 360 },
            speed: 350
        });

        this.cancerEmitter.active = false;

        this.cancerGroup = this.matter.world.nextGroup(true);
        this.bulletGroup = this.matter.world.nextGroup(true);

        for (let i = 0; i < this.initialCellCount; i++) {
            let cancerCell = new CancerCell(this.matter.world, Phaser.Math.Between(100, 1948),Phaser.Math.Between(100, 1948), 'cancer-cell', 50).setStatic(true).setSensor(true);
            this.currentCellCount++;
        }

        this.player = this.matter.add.sprite(500,300, 'slime', 0)
        .setScale(0.9)
        .setCircle(50)
        .setOrigin(0.7,0.5)
        .setMass(15)
        .setCollisionGroup(this.bulletGroup)
        .play('player-slime');
        this.cameras.main.startFollow(this.player, true);

        this.matter.add.sprite(800, 800, 'rock-tile-small').setStatic(true);

        for (let i = 0; i < this.maxBullets; i++) {
            let b = this.matter.add.sprite(-100, -100, 'fireball', 0)
            .setCircle(100)
            .setCollisionGroup(this.bulletGroup)
            .setMass(0.09)
            .setVisible(false);
            b.body.label = "bullet";
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
            let cancerCell = new CancerCell(this.matter.world, Phaser.Math.Between(100, 1948), Phaser.Math.Between(100, 1948), 'cancer-cell', 50).setStatic(true).setSensor(true);
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
            this.matter.applyForceFromAngle(this.player, 0.02, this.player.rotation);
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
            this.scene.run('WinScene');
        } else {
            this.scene.run('LoseScene');
        }       
    }
}