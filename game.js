class UIScene extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'UIScene', active: true });

        this.score = 0;
    }

    create ()
    {
        let info = this.add.text(10, 10, 'Score: 0', { font: '48px Impact', fill: 'Cyan' });

        //  Grab a reference to the Game Scene
        let world = this.scene.get('WorldScene');

        //  Listen for events from it
        world.events.on('addScore', function () {
            this.score += 10;

            info.setText('Score: ' + this.score);

        }, this);
    }
}

class WorldScene extends Phaser.Scene {
    constructor ()
    {
        super('WorldScene');
    }

    //World
    camera;
    player;
    cancer;
    cancerGroup;
    cursors;
    map;
    info;

    //Weapon & Bullets
    maxBullets = 10;
    currentBullet = 0;
    bullets = [];
    bullet;
    isBulletOut = false;
    bulletGroup;

    //Keys
    spaceKey;
    aKey;
    sKey;
    dKey;
    wKey;

    //Cancer
    cancerEmitter;



    preload () {    
    this.load.path = './assets/';

    this.load.image('map', 'world-map.png');
    this.load.image('tcell', 'tcell.png');
    this.load.image('cancer', 'cancer.png');
    this.load.image('bullet', 'bullet.png');
    this.load.image('particle', 'particles-single.png');
    this.load.image('rock-tile-small', 'rock-tile-small.png');
}

    create () {
        this.matter.set60Hz();

        this.matter.world.setBounds(0, 0, 2048, 2048);
        this.cameras.main.setBounds(0, 0, 2048, 2048);

        this.map = this.add.image(0,0,'map').setOrigin(0);
        this.map.scale = 0.5;

        let particles = this.add.particles('particle');

        this.cancerEmitter = particles.createEmitter({
            alpha: {start: 1, end: 0.1, ease: 'Expo.easeOut'},
            blendMode: 'SCREEN',
            scale: {start: 0.3, end: 0},
            lifespan: 300,
            tint: 0xde16d1,
            angle: { min: 0, max: 360 },
            speed: 150
        });

        this.cancerEmitter.active = false;

        this.cancerGroup = this.matter.world.nextGroup(true);
        this.bulletGroup = this.matter.world.nextGroup(true);

        this.cancer = this.matter.add.sprite(100,100,'cancer').setStatic(true).setSensor(true);
        this.cancer.body.label = "cancer";
        this.cancer.setCollisionGroup(this.cancerGroup);

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
            b.setTint('#de16d1')
            this.bullets.push(b);
        }

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        this.matter.world.on('collisionstart', this.collision, this);
    }

    collision(event, object1, object2) {
        if ((object1.label == "cancer" && object2.label == "bullet")) {
            this.cancerEmitter.active = true;
            this.cancerEmitter.explode(3000, object1.gameObject.x, object1.gameObject.y);
            object1.gameObject.destroy();
            this.events.emit('addScore');
            return;
        }
        else if (object1.label == "bullet" && object2.label == "cancer") {
            this.cancerEmitter.active = true;
            this.cancerEmitter.explode(3000, object2.gameObject.x, object2.gameObject.y);
            object2.gameObject.destroy();
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

    update() {
    
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
                this.time.delayedCall(2000, this.bulletLifetime, [bullet], this);
                bullet.x = this.player.x;
                bullet.y = this.player.y;
                bullet.visible = true;
                bullet.rotation = this.player.rotation;
                this.matter.applyForceFromPosition(bullet, this.player.body.position, 0.009, this.player.rotation);
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
        bullet.active = false;
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

