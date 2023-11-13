class Bobber {

    constructor(_x, _y) {

      this.x = _x;
      this.y = _y;

      this.xOffset = (fixedRandom(_x + " " + _y)*bobberOffset)-bobberOffset/2;
      this.yOffset = (fixedRandom(this.xOffset)*bobberOffset)-bobberOffset/2;

      this.xPos = _x+this.xOffset;
      this.yPos = _y+this.yOffset;

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

      if (!this.lit && dist(this.xPos, this.yPos, x, y) < this.radius) {
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

      let maxDist = depthCanvas.width/2*1.1;
      let pan = (this.xPos-x)/maxDist;
      let distance = dist(this.xPos, this.yPos, x, y)/maxDist;

      if (distance > 1) {
        let volume = 1/distance;
        gainNodes[this.tinkNum].gain.rampTo(volume, 0);
      } else {
        gainNodes[this.tinkNum].gain.rampTo(1, 0);
      }

      if (pan > 1) pan = 1;
      else if (pan < -1) pan = -1;

      if (pan != null) {
          tinkPanners[this.tinkNum].pan.setValueAtTime(pan, 0);
      }
      tinks[this.tinkNum].start();
    }

    display() {

      if (abs(this.xPos-x) > depthCanvas.width || abs(this.yPos-y) > depthCanvas.height) return;

      depthCanvas.push();

      depthCanvas.translate(this.x-x, this.y-y);
      depthCanvas.translate(this.xOffset, this.yOffset);
      depthCanvas.translate(depthCanvas.width/2, depthCanvas.height/2);
      depthCanvas.translate(0, this.bob*2);

      depthCanvas.fill(palette.brown);
      depthCanvas.arc(0, 0, this.radius, this.radius, -this.bob, PI+this.bob, CHORD);
      depthCanvas.fill(this.colour);
      depthCanvas.arc(0, 0, this.radius, this.radius, PI+this.bob, TWO_PI-this.bob, CHORD);
      depthCanvas.rotate(this.lean);
      if (this.lit && (frameCount-this.blinkOffset)%this.blinkDuration < this.blinkDuration/2) {
        for (let i = 0; i < 5; i++) {
          depthCanvas.fill(255, 255, 255, 90-20*i);
          depthCanvas.ellipse(0, -this.radius*0.8, this.radius*0.5+i*2.5);
        }
      }
      depthCanvas.stroke(this.colour);
      depthCanvas.strokeWeight(3);
      depthCanvas.line(0, -this.radius*0.5, 0, -this.radius*0.7);
      depthCanvas.noStroke();
      if (this.lit && (frameCount-this.blinkOffset)%this.blinkDuration < this.blinkDuration/2) {
        depthCanvas.fill(255);
        depthCanvas.ellipse(0, -this.radius*0.7, this.radius*0.3);
      }

      depthCanvas.pop();
    }
  }