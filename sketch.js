// https://coolors.co/1b4db1-40bedd-904e55-564e58-252627

let seaCanvas, birdCanvas, binocularsCanvas, binocularsMask;

let palette = {
    light: "#40BEDD",
    dark: "#1B4DB1",
};

let spray = [];
let bobbers = [];
let bobberSpacing = 40;
let bobberOffset = bobberSpacing*2;

let tinks = [];
let tinkPanners = [];
let gainNodes = [];
let tinkCount = 0;
let totalTinks = 1000;

let player, bird;

function preload() {

    setupTinks();
}

function setupTinks() {

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

    seaCanvas = createGraphics(134, 76);
    seaCanvas.pixelDensity(1);
    seaCanvas.noStroke();
    seaCanvas.noSmooth();

    birdCanvas = createGraphics(ceil(windowWidth/6/2)*2, ceil(windowHeight/6/2)*2);
    birdCanvas.pixelDensity(1);
    birdCanvas.noStroke();
    birdCanvas.noSmooth();

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

    player = new Player();
    bird = new Bird();

    createBinocularsFrame();
}

function createBinocularsFrame() {

    let bobPad = 20;

    binocularsMask = createGraphics(134, 76+bobPad);

    binocularsMask.translate(binocularsMask.width/2, binocularsMask.height/2);
    binocularsMask.ellipse(25, +.25, 76-5);
    binocularsMask.ellipse(-25, 0+.25, 76-5);

    binocularsMask = invertMask(binocularsMask);

    binocularsCanvas = createGraphics(134, 76+bobPad);
    binocularsCanvas.background(30);
    binocularsCanvas = binocularsCanvas.get(0, 0, 134, 76);
    binocularsCanvas.mask(binocularsMask);
}

function draw() {

    update();
    display();
}

function update() {

    player.update();
    bird.update();
    updateWaves();
}

function display() {

    birdCanvas.clear();
    background(30);

    for (let i = 0; i < bobbers.length; i++) {
        bobbers[i].update();
        if (bobbers[i].remove) {
            bobbers.splice(i, 1);
            i--;
            continue;
        }
        if (bobbers[i].yPos < player.y) bobbers[i].display();
    }

    player.display();

    for (let i = 0; i < bobbers.length; i++) {
        if (bobbers[i].yPos >= player.y) bobbers[i].display();
    }

    bird.display();

    let borderWeight = 5;

    seaCanvas.stroke(30);
    seaCanvas.strokeWeight(3);
    seaCanvas.noFill();
    // seaCanvas.rect(-borderWeight*0.2, -borderWeight*0.2, seaCanvas.width+borderWeight*0.4, seaCanvas.height+borderWeight*0.4, borderWeight);
    seaCanvas.imageMode(CORNER);
    seaCanvas.image(binocularsCanvas, 0, -10, binocularsCanvas.width/2, binocularsCanvas.height/2+20);
    // seaCanvas.image(binocularsCanvas, 0, sin(frameCount*4)*1.5-10, binocularsCanvas.width/2, binocularsCanvas.height/2+20);
    seaCanvas.strokeWeight(1);
    seaCanvas.noStroke();

    imageMode(CENTER);
    image(seaCanvas, width/2, height/2, seaCanvas.width*6, seaCanvas.height*6);
    image(birdCanvas, width/2, height/2, birdCanvas.width*6, birdCanvas.height*6);
}

function updateWaves() {

    let s = 0.005;
    let s2 = 0.15;
    let squash = 5;
    let speed = frameCount*0.006;
    let wind = frameCount*0.007;

    for (let i = 0; i < seaCanvas.width; i++) {
        for (let j = 0; j < seaCanvas.height; j++) {

            let perlin = noise((i+player.x)*s, (j+player.y)*s);
            perlin = map(perlin, 0.2, 0.8, 0, 1);
            let colour = lerpColor(palette.dark, palette.light, perlin);
            seaCanvas.set(i, j, colour);

            let perlin2 = noise((i+player.x)/squash*s2, (j+player.y)*s2+wind, speed);
            let boundary = 0.55;

            if (perlin2 > boundary) {

                let mapped = map(perlin2, boundary, boundary+0.03, 0, 1);

                let strength = 10*mapped;
                let colour2 = color(
                red(colour)+strength*0.9,
                green(colour)+strength,
                blue(colour)+strength*1.1);

                seaCanvas.set(i, j, colour2);

                if (perlin2 > 0.7) {

                    mapped = map(perlin2, 0.7, 0.9, 0, 1);

                    let strength2 = 300*mapped;
                    let colour3 = color(
                        red(colour2)+strength2,
                        green(colour2)+strength2*0.7,
                        blue(colour2)+strength2*0.2);

                    seaCanvas.set(i, j-2, colour3);
                    if (perlin2 > 0.76) spray.push(new Spray(-seaCanvas.width/2+i, -seaCanvas.height/2+j-2, true));
                }
            }
        }
    }

    let extra = bobberOffset*2;

    for (let i = -seaCanvas.width/2-extra; i < seaCanvas.width/2+extra; i++) {
        for (let j = -seaCanvas.height/2-extra; j < seaCanvas.height/2+extra; j++) {

            let padding = 4*bobberSpacing;
            let _x = player.x/bobberSpacing;
            _x = int(_x)*bobberSpacing;
            let _y = player.y/bobberSpacing;
            _y = int(_y)*bobberSpacing;
            let _i = i/4/bobberSpacing;
            _i = int(_i)*4*bobberSpacing;
            let _j = j/4/bobberSpacing;
            _j= int(_j)*4*bobberSpacing;


            let s3 = 1/padding;

            if ((_x+i)%padding == 0 && (_y+j)%padding == 0) {

                let bobberPerlin = noise(int((i+int(player.x))*s3), int((j+int(player.y))*s3));
                let bobberNoise = int((i+int(player.x))*s3) + " " + int((j+int(player.y))*s3);
                bobberNoise = fixedRandom(bobberNoise);
                if (bobberNoise > 0.99) continue;

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
    seaCanvas.updatePixels();
}

function fixedRandom(input) {

    let seeded = new Math.seedrandom(input);
    return seeded();
}

function invertMask(graphics) {

    graphics.loadPixels();

    for (var i = 3; i < graphics.pixels.length; i+=4) {
        graphics.pixels[i] = 255-graphics.pixels[i];
    }

    graphics.updatePixels();

    return graphics;
}