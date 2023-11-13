class Bird {

    constructor() {

      this.x = x;
      this.y = y;
      this.radius = 2;

      this.targetX = x;
      this.targetY = y;

      this.bobber = -1;
      this.static = false;
      this.swayRange = 50;
      this.sway = 0;
      this.targetSway = random([-this.swayRange, this.swayRange]);
      this.rotation = 0;
      this.speed = 3;
      this.wingSpeed = 15;
    }

    update() {

      let distFromPlayer = dist(this.x, this.y, x, y);

      if ((this.bobber == -1 && bobbers.length > 0) || (this.bobber != -1 && this.bobber.lit) || (this.bobber != -1 && distFromPlayer > 150)) {

        let closestBobber = -1;
        let closestDistance = -1;

        for (let i = 0; i < bobbers.length; i++) {

          if (bobbers[i].lit) continue;

          let distance = dist(bobbers[i].xPos, bobbers[i].yPos, x, y);
          if (closestDistance == -1 || distance < closestDistance) {
            closestBobber = bobbers[i];
            closestDistance = distance;
          }
        }

        this.bobber = closestBobber;
        this.targetX = this.bobber.xPos;
        this.targetY = this.bobber.yPos;
      }

      let v = createVector(this.targetX-this.x, this.targetY-this.y);

      if (v.mag() > this.speed) {
        if (this.static) this.static = false;
        v.setMag(this.speed);
        if (random() < 0.05) this.targetSway = random([-this.swayRange, this.swayRange]);
        this.sway = lerp(this.sway, this.targetSway, 0.1);
        v.setHeading(v.heading()+this.sway);
        this.rotation = v.heading();
        this.x += v.x;
        this.y += v.y;
      } else {
        if (!this.static) this.static = true;
      }
    }

    display() {

      if (this.bobber == -1) return;

      // if (abs(this.x-x) > width/6 || abs(this.y-y) > height/6) return;

      outerCanvas.push();

      outerCanvas.translate(this.x-x, this.y-y);
      outerCanvas.translate(outerCanvas.width/2, outerCanvas.height/2);

      if (this.static) {
        outerCanvas.translate(0, this.bobber.bob*2);
        outerCanvas.rotate(this.bobber.lean);
      }

      outerCanvas.angleMode(DEGREES);
      outerCanvas.translate(0, -this.bobber.radius*0.8);
      outerCanvas.rotate(this.rotation);

      outerCanvas.fill(255);

      if (!this.static) {
        let wingRotation = 0;
        wingRotation = sin(frameCount*this.wingSpeed)*50;
        outerCanvas.rotate(-wingRotation);
        outerCanvas.ellipse(0, this.radius/2, this.radius, this.radius*2);
        outerCanvas.rotate(wingRotation*2);
        outerCanvas.ellipse(0, -this.radius/2, this.radius, this.radius*2);
      } else {
        outerCanvas.ellipse(0, 0, this.radius*1.5);
      }

      outerCanvas.angleMode(RADIANS);

      outerCanvas.pop();
    }
  }