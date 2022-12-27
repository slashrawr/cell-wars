const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
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

let camera;
let player;
let cancer;
let cancerGroup;
let cursors;
let text;
let map;


//Weapon & Bullets
let maxBullets = 10;
let currentBullet = 0;
let bullets = [];
let bullet;
let isBulletOut = false;
let nextBullet;
let bulletGroup;

//Keys
let spaceKey;
let aKey;
let sKey;
let dKey;
let wKey;

let game = new Phaser.Game(config);

function preload () {    
    this.load.path = './assets/';

    this.load.image('map', 'world-map.png');
    this.load.image('tcell', 'tcell.png');
    this.load.image('cancer', 'cancer.png');
    this.load.image('bullet', 'bullet.png');
    this.load.image('particle', 'particles-single.png');
}

function create () {
    this.matter.set60Hz();

    this.matter.world.setBounds(0, 0, 2048, 2048);
    this.cameras.main.setBounds(0, 0, 2048, 2048);

    map = this.add.image(0,0,'map').setOrigin(0);
    map.scale = 0.5;

    let particles = this.add.particles('particle');

    let emitter = particles.createEmitter({
        alpha: {start: 1, end: 0.1, ease: 'Expo.easeOut'},
        blendMode: 'SCREEN',
        scale: {start: 0.3, end: 0},
        lifespan: 300,
        tint: 0xde16d1,
        angle: { min: 0, max: 360 },
        speed: 150
    });

    emitter.active = false;

    cancerGroup = this.matter.world.nextGroup(true);
    bulletCategory = this.matter.world.nextGroup(true);
    collGroup = this.matter.world.nextGroup();

    cancer = this.matter.add.sprite(100,100,'cancer').setStatic(true).setSensor(true);
    cancer.body.label = "cancer";
    cancer.setCollisionGroup(cancerGroup);

    player = this.matter.add.sprite(500,300, 'tcell');
    player.setCollisionGroup(bulletGroup);
    this.cameras.main.startFollow(player, true);

    for (let i = 0; i < maxBullets; i++) {
        let b = this.matter.add.sprite(player.x, player.y, 'bullet');
        b.body.label = "bullet";
        b.setCollisionGroup(bulletGroup);
        b.visible = false;
        b.setMass(0.1);
        b.setTint('#de16d1')
        bullets.push(b);
    }
    
    text = this.add.text(10, 10, '', { font: '16px Impact', fill: '#00ff00' });

    cursors = this.input.keyboard.createCursorKeys();
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    this.matter.world.on('collisionstart', function (event, object1, object2) {
        //console.log(object1);
        //console.log(object2);      

        if ((object1.label == "cancer" && object2.label == "bullet")) {
            emitter.active = true;
            emitter.explode(1000, object1.gameObject.x, object1.gameObject.y);
            object1.gameObject.destroy();
            return;
        }
        else if (object1.label == "bullet" && object2.label == "cancer") {
            emitter.active = true;
            emitter.explode(1000, object2.gameObject.x, object2.gameObject.y);
            object2.gameObject.destroy();
            return;
        }

        if ((object1.label == "bullet" && object2.gameObject == null)) {
            object1.gameObject.visible = false;
            return;
        }
        else if (object1.gameObject == null && object2.label == "bullet") {
            object2.gameObject.visible = false;
            return;
        }
        
    });
}

function update() {
    
    if (cursors.up.isDown)
    {
        this.matter.applyForceFromAngle(player, 0.002, player.rotation);
    }

    if (cursors.left.isDown)
    {
        player.setAngularVelocity(-0.05);
    }
    else if (cursors.right.isDown)
    {
        player.setAngularVelocity(0.05);
    }
    else
    {
        player.setAngularVelocity(0);
    }

    text.setText('Speed: ' + player.body.speed);
           
    if (spaceKey.isDown) {
        if (!isBulletOut) {

            let bullet = bullets[currentBullet];
            if (currentBullet == maxBullets - 1)
                currentBullet = 0;
            else
                currentBullet++;

            nextBullet = this.time.delayedCall(200, bulletReady, [], this);
            this.time.delayedCall(2000, bulletLifetime, [bullet], this);
            bullet.x = player.x;
            bullet.y = player.y;
            bullet.visible = true;
            bullet.rotation = player.rotation;
            this.matter.applyForceFromPosition(bullet, player.body.position, 0.009, player.rotation);
            isBulletOut = true;
        }
    }
    
    //this.cameras.main.setPosition(player.x, player.y, player.z);
}

function bulletReady ()
{
    isBulletOut = false;
}

function bulletLifetime(bullet) {
    bullet.visible = false;
    bullet.active = false;
    bullet.x = player.x;
    bullet.y = player.y;
    bullet.setVelocity(0);
}