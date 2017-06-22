var canvas, ctx;
var img;
var w, h;
var bubbles = [];
var unitsize, wiggleincrement;

function newBubbleAnimator() {
    w = window.innerWidth;
    let body = document.body, html = document.documentElement;
    h = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    canvas = document.getElementById("canvas");
    canvas.setAttribute("width", w);
    canvas.setAttribute("height", h);
    ctx = canvas.getContext('2d');
    img = document.getElementById("bubbleimg");
    unitsize = -h / 175;
    wiggleincrement = 2 / 120;
    randomBubble();
    setInterval(randomBubble, 20000);
    setInterval(draw, 16);
}

function draw() {
    ctx.clearRect(0, 0, w, h);
    _.forEach(bubbles, function(bub, key) {
        if (bub !== undefined) {
            if (bub.active) {
                bub.drawParams;
                ctx.drawImage(img, bub.x, bub.y, bub.dim, bub.dim);
                if (_.inRange(bub.y, 0, 30)) {
                    bub.active = false;
                }
            } else if (!bub.active) {
                bub.popParams;
                ctx.drawImage(img, bub.x, bub.y, bub.dim, bub.dim);
                if (bub.dim - 25 === bub.odim) {
                    var sound = new Howl({
                        src: ['sound/bubblepop.wav'],
                        volume: 0.2
                    });
                    sound.play();
                    bubbles.splice(key, 1);
                }
            }
        }
    });
}

function randomBubble() {
    let r = _.random(5);
    for (var i = 0; i < r; i++) {
        createBubble();
    }
}

function createBubble() {
    var dim = _.random(40, 75);
    var x = _.random(w - dim);
    var y = h - dim + 50;
    //How high the bubble will go
    var distance = _.random(50, 200);
    var limit = distance;
    distance *= unitsize;
    //How much time it will take to get to said height
    var time = _.random(5, 10);
    //Find out how much units we have to move it per 10 milliseconds to achieve the set speed
    var velocity = distance / time;
    velocity = velocity / 50;
    let bub = new Bubble(dim, x, y, distance, velocity, limit);
    bubbles.push(bub);
}

class Bubble {
    constructor(dim, x, y, distance, velocity, limit) {
        this.dim = dim;
        this.odim = dim;
        this.x = x;
        this.y = y;
        this.distance = _.round(distance);
        this.velocity = Math.abs(velocity);
        //Will alternate between -50 and 50, starting at 0 (middle)
        this.wiggle = 0;
        this.new = true;
        this.active = true;
        this.limit = limit;
    }

    get drawParams() {
        return this.getDrawParams();
    }

    getDrawParams() {
        if (this.wiggle === 2) {
            wiggleincrement = Math.abs(wiggleincrement);
        } else if (this.wiggle === -2) {
            wiggleincrement = Math.abs(wiggleincrement);
        }
        this.wiggle += wiggleincrement;
        this.x += getWiggleNumber(this.wiggle);
        this.y -= this.velocity;
    }

    get popParams() {
        return this.getPopParams();
    }

    getPopParams() {
        this.dim++;
    }
}

function getWiggleNumber(wiggle) {
    return Math.cos(Math.PI * wiggle) * 0.5;
}