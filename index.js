let canvas = document.querySelector("canvas");

canvas.width = 1800;
canvas.height = 800;

let g = canvas.getContext("2d");

let dim = 12;
const TILESIZE = 800/dim;

let showRays = true;
function toggleRays() {
    showRays = !showRays;
}

function Tile(x, y, num) {
    this.num = num;
    this.size = TILESIZE;
    this.pos = {
        "x": x,
        "y": y
    }
    this.red = 0;
    this.green = 0;
    this.blue = 0;
    let channels = [0, 0, 0];
    switch (num) {
        case 1:
            channels = [0, 255, 255];
            break;
        case 2:
            channels = [255, 255, 0];
            break;
        case 3:
            channels = [0, 255, 0];
            break;
        case 4:
            channels = [255, 0, 0];
            break;
        case 5:
            channels = [0, 0, 255];
            break;
        default:
            break;
    }
    this.red = channels[0];
    this.green = channels[1];
    this.blue = channels[2]
    this.color = "rgb("+this.red+","+this.green+","+this.blue+")"
    
    
    this.checkCollision = function(bX, bY, bW, bH) {
        let x = this.pos.x;
        let y = this.pos.y;
        let w = this.size;
        let h = this.size;
        if(x <= bX+bW && x+w >= bX && y <= bY+bH && y+h >= bY) {
            return true;
        }
        return false;
    }
    this.draw = function() {
        g.fillStyle = this.color;
        g.fillRect(this.pos.x+1, this.pos.y+1, this.size-1, this.size-1);
    }
    
}

let mapTemplate = [];
for(let i = 0; i < dim; i++) {
    mapTemplate.push([]);
    for(let j = 0; j < dim; j++) {
        if(i == 0 || j == 0 || i == dim-1 || j == dim-1) {
            mapTemplate[i].push(2);
        } else {
            mapTemplate[i].push(0);
        }
    }
}

let map = [];

function makeMap() {
    for(let i = 0; i < mapTemplate.length; i++) {
        map.push([]);
        for(let j = 0; j < mapTemplate[i].length; j++) {
            map[i].push(new Tile(j*TILESIZE, i*TILESIZE, mapTemplate[i][j]));
        }
    }
}

makeMap();


function drawMap() {
    g.fillStyle = "gray"
    g.fillRect(0, 0, 800, canvas.height);
    for(let i = 0; i < map.length; i++) {
        for(let j = 0; j < map[i].length; j++) {
            map[i][j].draw();
        }
    }
}

let playerPos = {
    "x": 400,
    "y": 400
}
let playerAcc = {
    "x": 0,
    "y": 0
}
let playerVel = {
    "x": 1,
    "y": 1
}
const FRICTION = -0.5;
const ACCELERATION = 2;

let playerSpeed = 5;

let playerLookAngle = Math.PI/4;
let playerDeltaPos = {
    "x": Math.cos(playerLookAngle),
    "y": Math.sin(playerLookAngle)
}
let lookLeftIn = false;
let lookRightIn = false;

let leftIn = false;
let rightIn = false;
let upIn = false;
let downIn = false;

let FOV = 90;

let previousPlayerPos = 0
let frame = 0

let w = 4;
let h = 4;


function updatePlayer() {
    playerDeltaPos = {
        "x": Math.cos(playerLookAngle),
        "y": Math.sin(playerLookAngle)
    }

    playerAcc.x = 0;
    playerAcc.y = 0;
    if(upIn) {
        playerAcc.x = ACCELERATION;
        playerAcc.y = ACCELERATION;
    } else {
        playerAcc.x = -ACCELERATION;
        playerAcc.y = -ACCELERATION;
    }

    playerAcc.x += playerVel.x * FRICTION;
    playerAcc.y += playerVel.y * FRICTION;
    playerVel.x += playerAcc.x;
    playerVel.y += playerAcc.y;
    //console.log(playerVel.x+" "+playerDeltaPos.x);

    if(upIn) {
        playerPos.y+=(playerDeltaPos.y*playerVel.y); 
        playerPos.x+=(playerDeltaPos.x*playerVel.x);
    }
    if(downIn) {
        playerPos.y+=(playerDeltaPos.y*playerVel.y); 
        playerPos.x+=(playerDeltaPos.x*playerVel.x);
    }
    for(let i = 0; i < map.length; i++) {
        for(let j = 0; j < map[i].length; j++) {
            if(map[i][j].checkCollision(playerPos.x+w/2, playerPos.y+h/2, w, h) && map[i][j].num > 0) {
                console.log("hit");
                playerPos = previousPlayerPos
            }
        }
    }
    if(lookLeftIn) {
        playerLookAngle-=0.1; 
        if(playerLookAngle < 0) {
            playerLookAngle+=2*Math.PI
        }
    }
    if(lookRightIn) {
        playerLookAngle+=0.1; 
        if(playerLookAngle > 2*Math.PI) {
            playerLookAngle-=2*Math.PI
        }
    }
    if(true) {
        previousPlayerPos = JSON.parse(JSON.stringify(playerPos));
    }
    
    frame++;
}

function drawPlayer() {
    g.fillStyle = "red"
    g.fillRect(playerPos.x, playerPos.y, 10, 10);
}

let lengths = [];
let step = 1;
let brightness = 0.4;

function drawRays(draw) {
    g.strokeStyle = "green";
    let cameraAngle = (playerLookAngle-((FOV/2)*Math.PI/180))
    let rayAngle = cameraAngle;
    for(let i = -FOV/2; i < FOV/2; i++) {
        rayAngle+=Math.PI/180;
        if(rayAngle > 2*Math.PI) {
            rayAngle-=2*Math.PI
        }
        if(rayAngle < 0) {
            rayAngle+=2*Math.PI
        }
        let length = 0;
        let hitWall = false;
        let pos = {
            "x": playerPos.x+5,
            "y": playerPos.y+5
        }
        while(hitWall == false) {
            for(let j = 0; j < map.length; j++) {
                for(let k = 0; k < map[j].length; k++) {
                    if(map[j][k].num > 0) {
                        if(map[j][k].checkCollision(pos.x, pos.y, 1, 1)) {
                            hitWall = true;
                            lengths.push(   {
                                    "distance": length*(Math.cos(rayAngle-playerLookAngle))*10000000/10000000,
                                    "red": map[j][k].red,
                                    "blue": map[j][k].blue,
                                    "green": map[j][k].green
                                }
                            );
                            break;
                        }
                    }
                }
            }
            if(hitWall == false) {
                length += Math.sqrt(Math.pow(Math.cos(rayAngle)*step,2) + Math.pow(Math.sin(rayAngle)*step,2));
                pos = {
                    "x": pos.x+(Math.cos(rayAngle)*step),
                    "y": pos.y+(Math.sin(rayAngle)*step)
                }
            }
        }
        if(draw) {
            g.beginPath();
            g.moveTo(playerPos.x+5, playerPos.y+5);
            g.lineTo(pos.x, pos.y);
            g.stroke();
        }
    }
}

window.addEventListener('keydown', keyDownHandler, false);
window.addEventListener('keyup', keyUpHandler, false);
function keyDownHandler(e) {
    let code = e.keyCode;
    switch(code) {
        case 87: upIn = true; break;
        case 83: downIn = true; break;
        case 65: lookLeftIn = true; break;
        case 68: lookRightIn = true; break;
        case 38: step++; break;
        case 40: step--; if(step < 1) {step = 1} break;
        case 39: brightness-=0.1; break;
        case 37: brightness+=0.1; break;
        default: ;
    }
}
function keyUpHandler(e) {
    let code = e.keyCode;
    switch(code) {
        case 87: upIn = false; break;
        case 83: downIn = false; break;
        case 65: lookLeftIn = false; break;
        case 68: lookRightIn = false; break;
        default: ;
    }
}

window.addEventListener("mousedown", mouseDownHandler, false);
function mouseDownHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    if(mouseX < 800 && mouseY < 800) {
        for(let i = 0; i < map.length; i++) {
            for(let j = 0; j < map[i].length; j++) {
                if(map[i][j].checkCollision(mouseX, mouseY, 0, 0) && map[i][j].checkCollision(playerPos.x+w/2, playerPos.y+h/2, w, h) == false) {
                    mapTemplate[i][j]++;
                    if(mapTemplate[i][j] > 5) {
                        mapTemplate[i][j] = 0;
                        if(i == 0 || j == 0 || i == dim-1 || j == dim-1) {
                            mapTemplate[i][j] = 1;
                        }
                    }
                    map = []
                    makeMap();
                    console.log(map);
                }
            }
        }
    }
}

function mixColors(base, add, perc) {
    let red = ((1-perc)*base[0])+(perc*add[0])
    let green = ((1-perc)*base[1])+(perc*add[1])
    let blue = ((1-perc)*base[2])+(perc*add[2])
    return "rgb("+red+","+green+","+blue+")";
}

function drawScreen() {
    g.fillStyle = "gray"
    g.fillRect(800, 0, canvas.width-800, canvas.height);
    g.fillStyle = "skyblue"
    g.fillRect(800, 0, canvas.width-800, canvas.height/2);
    for(let i = 0; i < lengths.length; i++) {
        // let red = (lengths[i].red-lengths[i].distance*brightness/3)
        // let green = (lengths[i].green-lengths[i].distance*brightness/3)
        // let blue = (lengths[i].blue-lengths[i].distance*brightness/3)
        // let color = "rgb("+red+","+green+","+blue+")"
        let color = mixColors([lengths[i].red, lengths[i].green, lengths[i].blue], [0, 0, 0], lengths[i].distance*brightness/350);
        console.log(color);
        let w = ((canvas.width-800)/FOV)+2
        let h = (40000/lengths[i].distance);
        let y = 400-(h/2);
        let x = 800+(i*(w-2));
        g.fillStyle = color;
        g.fillRect(x, y, w, h);
    }
}

function animate() {
    requestAnimationFrame(animate);
    g.clearRect(0,0,canvas.width,canvas.height);
    drawMap();
    drawScreen();
    updatePlayer();
    drawPlayer();
    drawRays(showRays);
    for(let i = 0; i < lengths.length; i++) {
        lengths.shift();
    }
    g.strokeStyle = "red"
    g.beginPath();
    g.moveTo(playerPos.x+5, playerPos.y+5);
    g.lineTo(playerPos.x+playerDeltaPos.x*25, playerPos.y+playerDeltaPos.y*25);
    g.stroke();
    g.fillStyle = "white"
    g.font = "16px Courier New"
    g.fillText("Brightness: "+((brightness*-1)+0.2999), 800+10, 20);
    
}

animate();
