class Spray {

    constructor(x, y, waves) {

        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.velX = player.velX/5;
        this.velY = player.velY/5;
        this.radius = player.size-1;
        let col = palette.glisten;
        this.colour = color(red(col), green(col), blue(col), 255);

        this.dead = false;
        this.outwards = random() < 0.3;
        if (waves) {
            this.waves = true;
            this.dead = random() < 0.95;
        }
        if (!this.outwards) this.below = random() < 0.4;
        this.shrinkFactor = random(0.2, 0.8);

        if (this.outwards || this.waves) {
            this.velX = random(-1, 1);
            this.velY = random(-1, 1);
        }

        this.randVelX = random(-1, 1);
        this.randVelY = random(-1, 1);
    }

    update() {

        if (this.dead) return;

        if (this.waves) {
            this.x += -player.velX + this.velX/2;
            this.y += -player.velY + -abs(this.velY/3);
        } else if (this.outwards) {
            this.x += this.velX;
            this.y += this.velY;
            this.radius -= 0.3;
        } else if (this.below) {
            this.x -= (player.velX + this.velX*4 + this.randVelX) * random(0.25, 1.5);
            this.y -= (player.velY + this.velY*4+ this.randVelY) * random(0.25, 1.5);
        } else {
            this.x -= (player.velX + this.velX*4+ this.randVelX) * random(0.25, 1.5);
            this.y -= (player.velY + this.velY*4+ this.randVelY) * random(0.25, 1.5);
            this.radius -= 0.3;
        }

        this.radius -= this.shrinkFactor;
        // this.colour.setAlpha(alpha(this.colour)-30);

        if (alpha(this.colour) < 0) this.dead = true;
        if (this.radius < 0) this.dead = true;
    }

    display() {

        if (this.dead) return;

        seaCanvas.push();
        seaCanvas.translate(seaCanvas.width/2, seaCanvas.height/2);

        seaCanvas.noStroke();
        seaCanvas.fill(this.colour);
        seaCanvas.ellipse(this.x, this.y, this.radius);

        seaCanvas.pop();
    }

    displayBelow() {

        if (this.dead) return;

        seaCanvas.push();
        seaCanvas.translate(seaCanvas.width/2, seaCanvas.height/2);

        seaCanvas.noStroke();
        seaCanvas.fill(palette.white);
        seaCanvas.ellipse(this.x, this.y, this.radius*1.5);

        seaCanvas.pop();
    }
}