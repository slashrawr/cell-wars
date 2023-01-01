class LoadingScene extends Phaser.Scene {

    progressBar;
    loadComplete;

    constructor () {
        super({ key: 'LoadingScene' });
        this.loadComplete = false;
    }

    preload () {    
        let width = this.cameras.main.width;
        let height = this.cameras.main.height;
        console.log(width);
        this.load.path = './assets/';
        let assets = this.cache.json.get('assets');

        let progressBarBackground = this.add.graphics()
        .fillStyle(0x000000, 0.2)
        .fillRect(width/2-150, height/2, 300, 30);
        
        let progressBar = this.add.graphics()
        .fillStyle(0x00ff00, 1.0)
        .fillRect(width/2-150, height/2, 0, 30);

        let progressText = this.make.text({x: width/2+160, y: height/2+5})
        .setOrigin(0, 0)
        .setFontSize('24px')
        .setFontFamily('"PressStart2P", cursive');

        let loadingText = this.make.text({x: width/2, y: height/2-40})
        .setOrigin(0.5, 0.5)
        .setFontSize('24px')
        .setFontFamily('"PressStart2P", cursive')
        .setText('Loading...');

        let fileProgressText = this.make.text({x: width/2, y: height/2+70})
        .setOrigin(0.5, 0.5)
        .setFontSize('14px')
        .setFontFamily('"PressStart2P", cursive')

        assets.images.forEach(o => {
            this.load.image(o.key, 'images/' + o.filename);
        })

        assets.spritesheets.forEach(o => {
            this.load.spritesheet(o.key, 'spritesheets/' + o.filename, {frameWidth: o.frameWidth, frameHeight: o.frameHeight });
        })

        this.load.on('progress', function (value) {
            progressBar.fillRect(width/2-150, height/2, 300*value, 30);
            progressText.setText(parseInt(value*100) + "%");
            console.log(value);
        });
                    
        this.load.on('fileprogress', function (file) {
            fileProgressText.setText(file.src.split("/").reverse()[0]);
            console.log(file);
        });

        this.load.on('complete', function () {
            progressText.destroy();
            progressBar.destroy();
            progressBarBackground.destroy();
            loadingText.destroy();
            fileProgressText.destroy();
        });
    }

    create () {
        this.scene.start("MainMenuScene");
    }
}