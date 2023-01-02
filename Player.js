class Player extends Phaser.Physics.Matter.Sprite {

    constructor (world, x, y, texture) {
        super(world, x, y, texture);
        this.body.label = "player";
        world.scene.add.existing(this);
        world.scene.matter.add.sprite(this);
    }

    preload() {
        this.load.path = './assets/';
    }

    preUpdate (time, delta) {
        super.preUpdate(time, delta);
    }

    update() {

    }

    destroy() {
        super.destroy();
    }
}