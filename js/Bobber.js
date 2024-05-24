class Bobber {

    constructor(x, y) {

        this.x = x;
        this.y = y;

        this.xOffset = (fixedRandom(x + " " + y)*bobberOffset)-bobberOffset/2;
        this.yOffset = (fixedRandom(this.xOffset)*bobberOffset)-bobberOffset/2;

        this.xPos = x+this.xOffset;
        this.yPos = y+this.yOffset;

        this.radius = 6;
        this.colour = random([palette.yellow, palette.pink, palette.cyan])

        this.bob = -1;
        this.bobOffset = random(360);

        this.lean = -1;
        this.leanOffset = random(360);

        this.lit = false;
        this.blinkDuration = random([30, 40]);
        this.blinkOffset = -1;
    }

    update() {

        if (!this.lit && dist(this.xPos, this.yPos, player.x, player.y) < this.radius) {
            this.lit = true;
            this.blinkOffset = frameCount;
            if (tinkCount < totalTinks) {
            this.tinkNum = tinkCount;
            tinkCount++;
            } else {
            console.log("out of tinks");
            }
        }

        this.bob = sin((frameCount+this.bobOffset)*5)*0.5;
        this.lean = sin((frameCount+this.leanOffset)*8)*0.15;

        if (this.lit && (frameCount-this.blinkOffset)%this.blinkDuration == 0) this.playSound();
    }

    playSound() {

        let maxDist = seaCanvas.width/2*1.1;
        let pan = (this.xPos-player.x)/maxDist;
        let distance = dist(this.xPos, this.yPos, player.x, player.y)/maxDist;

        if (distance > 1) {
            let volume = 1/distance;
            gainNodes[this.tinkNum].gain.rampTo(volume, 0);
        } else {
            gainNodes[this.tinkNum].gain.rampTo(1, 0);
        }

        if (pan > 1) pan = 1;
        else if (pan < -1) pan = -1;

        if (pan != null) tinkPanners[this.tinkNum].pan.setValueAtTime(pan, 0);

        tinks[this.tinkNum].start();
    }

    display() {

        if (abs(this.xPos-player.x) > seaCanvas.width || abs(this.yPos-player.y) > seaCanvas.height) return;

        seaCanvas.push();

        seaCanvas.translate(this.x-player.x, this.y-player.y);
        seaCanvas.translate(this.xOffset, this.yOffset);
        seaCanvas.translate(seaCanvas.width/2, seaCanvas.height/2);
        seaCanvas.translate(0, this.bob*2);

        seaCanvas.fill(palette.brown);
        seaCanvas.arc(0, 0, this.radius, this.radius, -this.bob, PI+this.bob, CHORD);
        seaCanvas.fill(this.colour);
        seaCanvas.arc(0, 0, this.radius, this.radius, PI+this.bob, TWO_PI-this.bob, CHORD);
        seaCanvas.rotate(this.lean);
        if (this.lit && (frameCount-this.blinkOffset)%this.blinkDuration < this.blinkDuration/2) {
            for (let i = 0; i < 5; i++) {
                seaCanvas.fill(255, 255, 255, 90-20*i);
                seaCanvas.ellipse(0, -this.radius*0.8, this.radius*0.5+i*2.5);
            }
        }
        seaCanvas.stroke(this.colour);
        seaCanvas.strokeWeight(3);
        seaCanvas.line(0, -this.radius*0.5, 0, -this.radius*0.7);
        seaCanvas.noStroke();
        if (this.lit && (frameCount-this.blinkOffset)%this.blinkDuration < this.blinkDuration/2) {
            seaCanvas.fill(255);
            seaCanvas.ellipse(0, -this.radius*0.7, this.radius*0.3);
        }

        seaCanvas.pop();
    }
}