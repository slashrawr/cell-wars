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
        if (this.health <= 0) {
            this.scene.events.emit('addScore');
            this.scene.currentCellCount--;
            this.destroy()
        }
    }

    destroy() {
        super.destroy();
    }
}