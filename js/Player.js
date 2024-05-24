class Player {

    constructor() {

        this.x = random(5000, 60000);
        this.y = random(5000, 60000);
        this.velX = 0;
        this.velY = 0;

        this.size = 4;
        this.dive = 0;
        this.bobCounter = 0;

        this.previousMovementInput = false;
        this.movementInput = false;
    }

    update() {

        this.movementInput = false;

        if (keyIsPressed) {

            let speed = 0.7;

            let pressingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65);
            let pressingRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68);
            let pressingUp = keyIsDown(UP_ARROW) || keyIsDown(87);
            let pressingDown = keyIsDown(DOWN_ARROW) || keyIsDown(83);

            let movingVertical = pressingUp != pressingDown;
            let movingHorizontal = pressingLeft != pressingRight;

            if (movingVertical && movingHorizontal) speed *= sqrt(2)/2;

            if (pressingLeft && pressingRight) {
                this.movementInput = true;
            } else if (pressingLeft) {
                player.velX -= speed;
                this.movementInput = true;
            } else if (pressingRight) {
                player.velX += speed;
                this.movementInput = true;
            }

            if (pressingUp && pressingDown) {
                this.movementInput = true;
            } else if (pressingUp) {
                player.velY -= speed;
                this.movementInput = true;
            } else if (pressingDown) {
                player.velY += speed;
                this.movementInput = true;
            }
        }

        let friction = 0.8;
        player.velX *= friction;
        player.velY *= friction;

        player.x += player.velX;
        player.y += player.velY;


        if (this.previousMovementInput != this.movementInput) {
            this.bobCounter = 0;
        }

        this.previousMovementInput = this.movementInput;

        if (this.movementInput) {
            if (this.dive < 0.7) this.dive += 0.05;
        } else {
            if (this.dive > 0) this.dive -= 0.05;
        }

        this.bobCounter++;
    }

    display() {

        let v = createVector(player.velX, player.velY);
        let m = v.mag();

        for (let i = 0; i < int(m*m*m); i++) {
            spray.push(new Spray());
        }

        for (let i = 0; i < spray.length; i++) {
            spray[i].update();
            if (spray[i].outwards) spray[i].display();
            else if (spray[i].below) spray[i].displayBelow();
            if (spray[i].dead) {
                spray.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < spray.length; i++) {
            if (!spray[i].outwards && !spray[i].below && !spray[i].wave) spray[i].display();
        }

        let bob = m < 1 ? -sin(this.bobCounter*5)*0.5 : this.dive;

        seaCanvas.push();
        seaCanvas.translate(seaCanvas.width/2, seaCanvas.height/2);
        seaCanvas.translate(0, bob*2);
        seaCanvas.fill(palette.brown);
        seaCanvas.arc(0, 0, this.size, this.size, -bob, PI+bob, CHORD);
        seaCanvas.fill(palette.fullBrown);
        seaCanvas.arc(0, 0, this.size, this.size, PI+bob, TWO_PI-bob, CHORD);
        seaCanvas.fill(50);
        let direction = player.velX > 0 ? -1 : 1;
        seaCanvas.triangle(-player.velX, -this.size*1.7, 0, -this.size*0.5, -player.velX+this.size*direction, -this.size-player.velY);
        seaCanvas.stroke(palette.fullBrown);
        seaCanvas.line(0, -this.size*0.5, -player.velX, -this.size*1.7);
        seaCanvas.pop();
    }
}