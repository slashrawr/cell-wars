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
            debug: true
        },
        plugins: {
            wrap: {
                min: {
                    x: 0,
                    y: 0
                  },
                  max: {
                    x: 1280,
                    y: 720
                  }
            }
        }
    }
};

let player;
let tcell;
let cancer;
let cancercells = [];
let cancerGroup;
let cursors;
let text;

//Weapon & Bullets
let maxBullets = 10;
let currentBullet = 0;
let bullets = [];
let bullet;
let isBulletOut = false;
let nextBullet;
let bulletGroup;

//keys
let spaceKey;
let aKey;
let sKey;
let dKey;
let wKey;

let game = new Phaser.Game(config);

function preload () {    
    this.load.path = './assets/';

    this.load.image('tcell', 'tcell.png');
    this.load.image('cancer', 'cancer.png');
    this.load.image('bullet', 'bullet.png');
}

function create () {

    this.matter.enableWrapPlugin();
    
    let wrapBounds = {
        wrap: {
          min: {
            x: 0,
            y: 0
          },
          max: {
            x: 1280,
            y: 720
          }            
        }
    };

    cancerGroup = this.matter.world.nextGroup(true);
    bulletCategory = this.matter.world.nextGroup(true);
    collGroup = this.matter.world.nextGroup();

    cancer = this.matter.add.sprite(100,100,'cancer').setStatic(true).setSensor(true);
    cancer.setCollisionGroup(cancerGroup);
    cancercells.push(cancer);

    player = this.matter.add.sprite(500,300, 'tcell');
    player.body.plugin = wrapBounds;
    player.setCollisionGroup(bulletGroup);

    for (let i = 0; i < maxBullets; i++) {
        let b = this.matter.add.sprite(player.x, player.y, 'bullet');
        b.setCollisionGroup(bulletGroup);
        b.visible = false;
        b.setMass(5);
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

    //this.matter.overlap(player, cancer);
    
    //spike.setCollisionGroup(-1)
    //cancer.setCollisionGroup(-1);
    //this.matter.overlap(player, cancercells);

    this.matter.world.on('collisionstart', function (event) {
        console.log("hit!!!");
        //event.pairs[0].cancer.isActive = false;
        //event.pairs[0].bodyB.gameObject.setTint(0x00ff00);

    });
}

function update() {
    
    if (cursors.up.isDown)
    {
        this.matter.applyForceFromAngle(player, 0.001, player.rotation);
    }
    else
    {
        //this.matter.applyForce(player,0);
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
                currentBullet++

            nextBullet = this.time.delayedCall(100, bulletReady, [], this);
            this.time.delayedCall(1000, bulletLifeTime, [bullet], this);
            bullet.x = player.x;
            bullet.y = player.y;
            bullet.visible = true;
            bullet.rotation = player.rotation;
            bullet.velocity = 0;
            this.matter.applyForceFromPosition(bullet, player.body.position, 0.009, player.rotation);
            isBulletOut = true;
        }
    }   
}

function bulletReady ()
{
    isBulletOut = false;
}

function bulletLifeTime(bullet) {
    bullet.visible = false;
    bullet.active = false;
    bullet.x = player.x;
    bullet.y = player.y;
}