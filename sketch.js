// https://coolors.co/1b4db1-40bedd-904e55-564e58-252627

let depthCanvas, outerCanvas;

let x;
let y;
let velX = 0;
let velY = 0;
let cameraX = 10;
let cameraY = 10;

let palette = {
  light: "#40BEDD",
  dark: "#1B4DB1",
}

let previousMovementInput = false;
let movementInput = false;

let vectorRotation = 0;

let spray = [];
let bobbers = [];
let bobberSpacing = 40;
let bobberOffset = bobberSpacing*2;

let playerSize = 4;
let dive = 0;
let bobCounter = 0;

let tinks = [];
let tinkPanners = [];
let gainNodes = [];
let tinkCount = 0;
let totalTinks = 1000;

let bird;

function preload() {

  for (let i = 0; i < totalTinks; i++) {
    let gainNode = new Tone.Gain(0).toDestination();
    gainNode.gain.rampTo(1, 0);
    let panner = new Tone.Panner(0).connect(gainNode);
    tinks.push(new Tone.Player("./sounds/tinks/tink"+int(random(5))+".wav").connect(panner));
    tinkPanners.push(panner);
    gainNodes.push(gainNode);
  }
}

function setup() {

  createCanvas(windowWidth, windowHeight);
  frameRate(24);
  noStroke();
  noSmooth();
  angleMode(DEGREES);

  depthCanvas = createGraphics(804/6, 456/6);
  depthCanvas.pixelDensity(1);
  depthCanvas.noStroke();
  depthCanvas.noSmooth();

  outerCanvas = createGraphics(ceil(windowWidth/6/2)*2, ceil(windowHeight/6/2)*2);
  outerCanvas.pixelDensity(1);
  outerCanvas.noStroke();
  outerCanvas.noSmooth();

  for (let key in palette) {
    palette[key] = color(palette[key]);
  }

  palette.glisten = color(255, 255, 255, 200);
  palette.white = color(255, 255, 255, 50);
  palette.none = color(255, 255, 255, 0);
  palette.blue = color(240, 255, 255, 255);
  palette.brown = color(83, 71, 65, 100);
  palette.fullBrown = color(181, 120, 60, 255);
  palette.yellow = color(255, 195, 0, 255);
  palette.pink = color(225, 127, 215, 255);
  palette.cyan = color(32, 225, 192, 255);
  palette.blinker = color(255, 255, 255, 10);

//   let v = createVector(random(-30, 30), random(-30, 30));
//   v.setMag(1);

//   velX = v.x;
//   velY = v.y;

  x = random(5000, 60000);
  y = random(5000, 60000);

  bird = new Bird();
}

function draw() {

    move();

    outerCanvas.clear();
    background(30);

  if (previousMovementInput != movementInput) {
    bobCounter = 0;
  }

  previousMovementInput = movementInput;

  if (movementInput) {
    if (dive < 0.7) dive += 0.05;
  } else {
    if (dive > 0) dive -= 0.05;
  }

  updateWaves();

  // console.log(bobbers.length)

  for (let i = 0; i < bobbers.length; i++) {
    bobbers[i].update();
    if (bobbers[i].remove) {
      bobbers.splice(i, 1);
      i--;
      continue;
    }
    if (bobbers[i].yPos < y) bobbers[i].display();
  }

  let v = createVector(velX, velY);
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

  let bob = m < 1 ? -sin(bobCounter*5)*0.5 : dive;

  depthCanvas.push();
  depthCanvas.translate(depthCanvas.width/2, depthCanvas.height/2);
  depthCanvas.translate(0, bob*2);
  depthCanvas.fill(palette.brown);
  depthCanvas.arc(0, 0, playerSize, playerSize, -bob, PI+bob, CHORD);
  depthCanvas.fill(palette.fullBrown);
  depthCanvas.arc(0, 0, playerSize, playerSize, PI+bob, TWO_PI-bob, CHORD);
  depthCanvas.fill(50);
  let direction = velX > 0 ? -1 : 1;
  depthCanvas.triangle(-velX, -playerSize*1.7, 0, -playerSize*0.5, -velX+playerSize*direction, -playerSize-velY);
  depthCanvas.stroke(palette.fullBrown);
  depthCanvas.line(0, -playerSize*0.5, -velX, -playerSize*1.7);
  // depthCanvas.noStroke();
  depthCanvas.pop();

  for (let i = 0; i < bobbers.length; i++) {
    if (bobbers[i].yPos >= y) bobbers[i].display();
  }

  bird.update();
  bird.display();

  let borderWeight = 5;

  depthCanvas.stroke(30);
  depthCanvas.strokeWeight(3);
  depthCanvas.noFill();
  depthCanvas.rect(-borderWeight*0.2, -borderWeight*0.2, depthCanvas.width+borderWeight*0.4, depthCanvas.height+borderWeight*0.4, borderWeight);
  depthCanvas.strokeWeight(1);
  depthCanvas.noStroke();

  imageMode(CENTER);
  image(depthCanvas, width/2, height/2, depthCanvas.width*6, depthCanvas.height*6);
  image(outerCanvas, width/2, height/2, outerCanvas.width*6, outerCanvas.height*6);

  bobCounter++;
}

function updateWaves() {

  let s = 0.005;

  let s2 = 0.15;
  let squash = 5;
  let speed = frameCount*0.006;
  let wind = frameCount*0.007;

  for (let i = 0; i < depthCanvas.width; i++) {
    for (let j = 0; j < depthCanvas.height; j++) {

      let perlin = noise((i+x)*s, (j+y)*s);
      perlin = map(perlin, 0.2, 0.8, 0, 1);
      let colour = lerpColor(palette.dark, palette.light, perlin);
      depthCanvas.set(i, j, colour);

      let perlin2 = noise((i+x)/squash*s2, (j+y)*s2+wind, speed);
      let boundary = 0.55;

      // let str = mag(velX, velY);
      // let distance = dist(i, j, depthCanvas.width/2, depthCanvas.height/2);
      // if (distance > 5) distance = 5;
      // distance = (5-distance) * str;
      // distance = map(distance, 0, 5, 0, 1);

      if (perlin2 > boundary) {

        let mapped = map(perlin2, boundary, boundary+0.03, 0, 1);

        let strength = 10*mapped;
        let colour2 = color(
          red(colour)+strength*0.9,
          green(colour)+strength,
          blue(colour)+strength*1.1);
        // let colour2lerp = lerpColor(colour2, colour, distance);

        depthCanvas.set(i, j, colour2);

        if (perlin2 > 0.7) {

          mapped = map(perlin2, 0.7, 0.9, 0, 1);

          let strength2 = 300*mapped;
          let colour3 = color(
            red(colour2)+strength2,
            green(colour2)+strength2*0.7,
            blue(colour2)+strength2*0.2);
          // let colour3lerp = lerpColor(colour3, colour2, distance);

          depthCanvas.set(i, j-2, colour3);
          if (perlin2 > 0.76) spray.push(new Spray(-depthCanvas.width/2+i, -depthCanvas.height/2+j-2, true));
        }
      }
    }
  }

  let extra = bobberOffset*2;

  for (let i = -depthCanvas.width/2-extra; i < depthCanvas.width/2+extra; i++) {
    for (let j = -depthCanvas.height/2-extra; j < depthCanvas.height/2+extra; j++) {


      let padding = 4*bobberSpacing;
      let _x = x/bobberSpacing;
      _x = int(_x)*bobberSpacing;
      let _y = y/bobberSpacing;
      _y = int(_y)*bobberSpacing;
      let _i = i/4/bobberSpacing;
      _i = int(_i)*4*bobberSpacing;
      let _j = j/4/bobberSpacing;
      _j= int(_j)*4*bobberSpacing;


      let s3 = 1/padding;

      if ((_x+i)%padding == 0 && (_y+j)%padding == 0) {

      let bobberPerlin = noise(int((i+int(x))*s3), int((j+int(y))*s3));
      let bobberNoise = int((i+int(x))*s3) + " " + int((j+int(y))*s3);
      bobberNoise = fixedRandom(bobberNoise);
      if (bobberNoise > 0.99) {
        // depthCanvas.set(i, j, 255);
        continue;
      }


        let noBobber = true;

        for (let k = 0; k < bobbers.length; k++) {
          if (bobbers[k].x == _x+i && bobbers[k].y == _y+j) {
            noBobber = false;
            break;
          }
        }

        if (noBobber) {
          let a = _x+i;
          let b = _y+j;
          bobbers.push(new Bobber(a, b));
          if (fixedRandom(a+" "+b) < 0.1) {
            bobbers.push(new Bobber(a+1, b+1));
            bobbers.push(new Bobber(a+1, b-1));
            bobbers.push(new Bobber(a-1, b-1));
            bobbers.push(new Bobber(a-1, b+1));
            // bobbers.push(new Bobber(a+1, b));
            // bobbers.push(new Bobber(a, b-1));
            // bobbers.push(new Bobber(a-1, b));
            // bobbers.push(new Bobber(a, b+1));
          } else if (fixedRandom(a+" "+b) < 0.4) {
            bobbers.push(new Bobber(a+1, b+1));
          }
        }
      }
    }
  }

  depthCanvas.updatePixels();
}

function move() {

  movementInput = false;

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
      movementInput = true;
    } else if (pressingLeft) {
      velX -= speed;
      movementInput = true;
    } else if (pressingRight) {
      velX += speed;
      movementInput = true;
    }

    if (pressingUp && pressingDown) {
      movementInput = true;
    } else if (pressingUp) {
      velY -= speed;
      movementInput = true;
    } else if (pressingDown) {
      velY += speed;
      movementInput = true;
    }
  }

  // if (movementInput) {

    let friction = 0.8;

    velX *= friction;
    velY *= friction;

//   } else {

//     autopilot();
//   }

  x += velX;
  y += velY;


}

function autopilot() {

  let v = createVector(velX, velY);
  let magnitude = v.mag();
  let heading = v.heading();
  let friction = 1;

  if (random() < 0.01) {
    vectorRotation = random(-2, 2);
    friction = random([0.5, 20]);
    if (friction == 2) v.setMag(0.1);
    console.log(friction);
  }

  v.rotate(vectorRotation);

  velX = v.x;
  velY = v.y

  if (magnitude > 1) {

    friction = 0.8;
  }

  velX *= friction;
  velY *= friction;
}

class Spray {

  constructor(x, y, waves) {

    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.velX = velX/5;
    this.velY = velY/5;
    this.radius = playerSize-1;
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
      this.x += -velX + this.velX/2;
      this.y += -velY + -abs(this.velY/3);
    } else if (this.outwards) {
      this.x += this.velX;
      this.y += this.velY;
      this.radius -= 0.3;
    } else if (this.below) {
      this.x -= (velX + this.velX*4 + this.randVelX) * random(0.25, 1.5);
      this.y -= (velY + this.velY*4+ this.randVelY) * random(0.25, 1.5);
    } else {
      this.x -= (velX + this.velX*4+ this.randVelX) * random(0.25, 1.5);
      this.y -= (velY + this.velY*4+ this.randVelY) * random(0.25, 1.5);
      this.radius -= 0.3;
    }

    this.radius -= this.shrinkFactor;
    // this.colour.setAlpha(alpha(this.colour)-30);

    if (alpha(this.colour) < 0) this.dead = true;
    if (this.radius < 0) this.dead = true;
  }

  display() {

    if (this.dead) return;

    depthCanvas.push();
    depthCanvas.translate(depthCanvas.width/2, depthCanvas.height/2);

    depthCanvas.noStroke();
    depthCanvas.fill(this.colour);
    depthCanvas.ellipse(this.x, this.y, this.radius);

    depthCanvas.pop();
  }

  displayBelow() {

    if (this.dead) return;

    depthCanvas.push();
    depthCanvas.translate(depthCanvas.width/2, depthCanvas.height/2);

    depthCanvas.noStroke();
    depthCanvas.fill(palette.white);
    depthCanvas.ellipse(this.x, this.y, this.radius*1.5);

    depthCanvas.pop();
  }
}

function fixedRandom(input) {

  var seeded = new Math.seedrandom(input);
  return seeded();
}