class CancerCell extends Phaser.Physics.Matter.Sprite {

    maxHealth = 10;
    health = 10;
    healthBarBackground;
    healthBar;

    constructor (world, x, y, texture, health) {
        super(world, x, y, texture);
        this.maxHealth = health;
        this.body.label = "cancer";
        this.health = health;
        world.scene.add.existing(this);
        world.scene.matter.add.sprite(this);
        
        this.buildHealthBar();
    }

    preload() {
        this.load.path = './assets/';
    }

    buildHealthBar() {
        this.healthBarBackground = this.scene.add.rectangle(this.x,this.y-60,100,10, 0x000000).setAlpha(0.3);
        this.healthBar = this.scene.add.rectangle(this.x,this.y-60,100,10, 0x00ff00);
    }

    updateHealthBar() {
        let healthPercentage = this.health/this.maxHealth*100;
        let colour = 0xffffff
        if (healthPercentage > 70)
            colour = 0x00ff00;
        else if (healthPercentage > 30)
            colour = 0xffff00
        else
            colour = 0xff0000
            
        this.healthBar.fillColor = colour;
        this.healthBar.width = healthPercentage;
    }

    preUpdate (time, delta) {
        super.preUpdate(time, delta);
    }

    receiveHit(damage) {
        this.health -= damage;
        this.updateHealthBar();
        if (this.health <= 0) {
            this.scene.events.emit('addScore');
            this.scene.currentCellCount--;
            this.healthBar.destroy();
            this.healthBarBackground.destroy();
            this.destroy()
        }
    }

    destroy() {
        super.destroy();
    }
}