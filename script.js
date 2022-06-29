const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576
groundy = 480

const gravity = 1.4
const speed = 10
const jump = 25

const control = {
    w: 0,
    s: 0,
    a: 0,
    d: 0,
    e: 0,

    i: 0,
    k: 0,
    j: 0,
    l: 0,
    o: 0,
}

function damage(p1, p2, title) {

    if((p1.pos.x+p1.a1box.x>=p2.pos.x && p1.pos.x+p1.dim.w<=p2.pos.x+p2.dim.w) && (p1.pos.y+p1.dim.h>=p2.pos.y && p1.pos.y<=p2.pos.y+p2.dim.h)) {
        if(title==='P1') {
            if(player2.hp>0)
            player2.hp -= 20
            document.querySelector('#p2hp').style.width = player2.hp + '%'
        }
    }
    if((p2.pos.x+p2.a1box.x<=p1.pos.x+p1.dim.w && p2.pos.x>=p1.pos.x) && (p1.pos.y+p1.dim.h>=p2.pos.y && p1.pos.y<=p2.pos.y+p2.dim.h)) {
        if(title==='P2' && player1.hp>0) {
            if(player2.hp>0)
            player1.hp -= 10
            document.querySelector('#p1hp').style.width = player1.hp + '%'
        }
    }
    

    if((player1.hp>player2.hp && timer===0) || (player2.hp==0 && timer>0)) {
        document.querySelector('#displayText').innerHTML = 'Warr Wins!'
        clearTimeout(countdown)
    }
    else if((player1.hp<player2.hp && timer===0) || (player1.hp==0 && timer>0)) {
        document.querySelector('#displayText').innerHTML = 'Kenji Wins!'
        clearTimeout(countdown)
    }
}

class Player {
    constructor(title, position, dimension, a1box) {
        this.title = title
        this.pos = {
            x: position.x,
            y: position.y
        }
        this.dim = {
            w: dimension.w,
            h: dimension.h
        }
        this.vel = {
            x: 0,
            y: 0
        }
        this.hp = 100

        this.a1box = {
            x: a1box.x,
            y: a1box.y
        }
    }

    update(conw, cons, cona, cond, cone) {
        this.physics(conw, cons, cona, cond, cone)
        // this.draw()
    }

    physics(conw, cons, cona, cond, cone) {
        //verticle physics and controller
        if(this.hp===0) {
            return
        }

        if(this.pos.y<groundy-this.dim.h-this.vel.y) {
            this.vel.y += gravity
            this.pos.y += this.vel.y
        }
        else {
            this.vel.y = 0
            this.pos.y = groundy-this.dim.h-this.vel.y
        }
        if(conw==1 && this.pos.y==groundy-this.dim.h) {
            this.vel.y=-jump
        }

        
        //horizontal physics and controller
        this.vel.x = 0
        if(cona==1 && this.pos.x>0) {
            this.vel.x=-1*speed
        }
        else if(this.pos.x<0-this.vel.x) {
            this.pos.x = 0
            this.vel.x = 0
        }

        if(cond==1 && this.pos.x<canvas.width-this.dim.w) {
            this.vel.x=speed
        }
        else if(this.pos.x>canvas.width-this.dim.w-this.vel.x) {
            this.pos.x = canvas.width-this.dim.w
            this.vel.x = 0
        }
        this.pos.x += this.vel.x
        
    }

    draw() {
        

        c.fillRect(this.pos.x, this.pos.y, this.a1box.x, this.a1box.y)
        c.fillStyle = 'red'
        c.fillRect(this.pos.x, this.pos.y, this.dim.w, this.dim.h)
        c.fillStyle = 'black'
    }
}

class Render {
    constructor(position, imgSrc, scale = 1, frames = 1) {
        this.pos = {
            x: position.x,
            y: position.y
        }
        this.img = new Image()
        this.img.src = imgSrc
        this.scale = scale
        this.frames = frames
        this.current = 0
        this.fpsPassed = 0
        this.fpsRequired = 5
    }
    update() {
        this.draw()
        if(this.fpsPassed<this.fpsRequired) {
            this.fpsPassed++
        }
        else {
            if(this.current<this.frames-1) {
                this.current++
            }
            else {
                this.current = 0
            }
            this.fpsPassed=0
        }
    }
    draw() {
        c.drawImage(
            this.img,
            this.current*this.img.width/this.frames,
            0,
            this.img.width/this.frames,
            this.img.height,
            this.pos.x,
            this.pos.y,
            this.img.width*this.scale/this.frames,
            this.img.height*this.scale
        )
    }
}


class Config2D {
    constructor(imgSrc, frames) {
        this.img = new Image()
        this.img.src = imgSrc
        this.frames = frames
        this.current = 0
    }
}

class Render2D {
    constructor(scale, adjust) {
        this.pos = {
            x: 0,
            y: 0
        }
        this.adjust = {
            x: adjust.x,
            y: adjust.y
        }
        this.scale = scale
        this.fpsPassed = 0
        this.fpsRequired = 5
    }

    update(player, idle, run, jump, fall, attack, death, cone) {
        if(player.hp===0 || (death.current<death.frames-1 && death.current>0)) {
            this.draw(player, death)
            if(death.current===death.frames-1) {
                death.current--
            }
        }
        else if(cone===1 || (attack.current<attack.frames-1 && attack.current>0)) {
            this.draw(player, attack)
            if(attack.current===attack.frames-1) {
                damage(player1, player2, player.title)
                attack.current = 0
            }
        }
        else {
            if(player.vel.x!=0 && player.pos.y===groundy-player.dim.h && player.vel.y===0) {
                this.draw(player, run)
            }
            else if(player.vel.x===0 && player.vel.y===0 && player.pos.y===groundy-player.dim.h) {
                this.draw(player, idle)
    
            }
            else if(player.vel.y>0 && player.pos.y<groundy-player.dim.h) {
                this.draw(player, fall)
    
            }
            else if(player.vel.y<0) {
                this.draw(player, jump)
    
            }
        }

    }  

    draw(player, action) {
        c.drawImage(
            action.img,
            action.current*action.img.width/action.frames,
            0,
            action.img.width/action.frames,
            action.img.height,
            player.pos.x+this.adjust.x,
            player.pos.y+this.adjust.y,
            action.img.width*this.scale/action.frames,
            action.img.height*this.scale
        )

        if(action.current<action.frames-1) {
            if(this.fpsPassed<this.fpsRequired) {
                this.fpsPassed++
            }
            else {
                this.fpsPassed = 0
                action.current++
            }
        }
        else {
            action.current = 0
        }
    }
}

const samuraiIdle = new Config2D(
    imgSrc = './img/samuraiMack/Idle.png',
    frames = 10,
)
const samuraiRun = new Config2D(
    imgSrc = './img/samuraiMack/Run.png',
    frames = 8,
)
const samuraiJump = new Config2D(
    imgSrc = './img/samuraiMack/Jump.png',
    frames = 3,
)
const samuraiFall = new Config2D(
    imgSrc = './img/samuraiMack/Fall.png',
    frames = 3,
)
const samuraiatttack1 = new Config2D(
    imgSrc = './img/samuraiMack/Attack1.png',
    frames = 7,
)
const samuraiDeath = new Config2D(
    imgSrc = './img/samuraiMack/Death.png',
    frames = 11,
)

const samurai = new Render2D(
    scale = 2,
    adjust = {
        x: -100,
        y: -64
    },
    samuraiIdle
)


const kenjiIdle = new Config2D(
    imgSrc = './img/kenji/Idle.png',
    frames = 4,
)
const kenjiRun = new Config2D(
    imgSrc = './img/kenji/Run.png',
    frames = 8,
)
const kenjiJump = new Config2D(
    imgSrc = './img/kenji/Jump.png',
    frames = 2,
)
const kenjiFall = new Config2D(
    imgSrc = './img/kenji/Fall.png',
    frames = 2,
)
const kenjiatttack1 = new Config2D(
    imgSrc = './img/kenji/Attack1.png',
    frames = 4,
)
const kenjiDeath = new Config2D(
    imgSrc = './img/kenji/Death.png',
    frames = 7,
)

const kenji = new Render2D(
    scale = 2,
    adjust = {
        x: -172,
        y: -156
    },
)



addEventListener('keydown', (e)=>addcontrol(e))
addEventListener('keyup', (e)=>delcontrol(e))

// addEventListener('keypress', (e)=>fixe(e))

// function fixe(e) {
//     console.log(e)
// }

function addcontrol(e) {
    switch(e.key) {
        case 'w':
            control.w = 1
            break
        case 's':
            control.s = 1
            break
        case 'a':
            control.a = 1
            break
        case 'd':
            control.d = 1
            break
        case 'e':
            control.e = 1
        //     if(control.e===0 && control.eTrig) {
        //         control.e = 1
        //         control.eTrig = false
        //         setTimeout(function() {
        //             control.e = 0
        //             control.eTrig = true
        //         }, 1000)  
        //     }
        //     else if(control.e===1 && control.eTrig===false) {
        //         setTimeout(function() {
        //             control.e = 0
        //         }, 10)
        //     }
            break
        case 'i':
            control.i = 1
            break
        case 'k':
            control.k = 1
            break
        case 'j':
            control.j = 1
            break
        case 'l':
            control.l = 1
            break
        case 'o':
            control.o = 1
            break
    }
}
function delcontrol(e) {
    switch(e.key) {
        case 'w':
            control.w = 0
            break
        case 's':
            control.s = 0
            break
        case 'a':
            control.a = 0
            break
        case 'd':
            control.d = 0
            break
        case 'e':
            control.e = 0
            break
            
        case 'i':
            control.i = 0
            break
        case 'k':
            control.k = 0
            break
        case 'j':
            control.j = 0
            break
        case 'l':
            control.l = 0
            break
        case 'o':
            control.o = 0
            break
    }
}


const player1 = new Player(
    title = 'P1',
    position = {
        x: 200,
        y: 480
    },
    dimension = {
        w: 55,
        h: 100
    },
    a1box = {
        x: 206,
        y: 100
    }
)

const player2 = new Player(
    title = 'P2',
    position = {
        x: 824,
        y: 480
    },
    dimension = {
        w: 55,
        h: 100
    },
    a1box = {
        x: -151,
        y: 100
    }
)

const background = new Render(
    position = {
        x: 0,
        y: 0
    },
    imgSrc = './img/bg.png',
    scale = 1,
    frames = 1
)

const shop = new Render(
    position = {
        x: 640,
        y: 160
    },
    imgSrc = './img/shop.png',
    scale = 2.5,
    frames = 6
)


let timer = 43
function countdown() {
    setTimeout(countdown, 1000)
    if(timer>0) {
        timer--
        document.querySelector('#timer').innerHTML = timer
        
    }
    if(player1.hp===player2.hp && timer===0) {
        document.querySelector('#displayText').innerHTML = 'Tie'
        timer = -1
    }
}
countdown()



function animation() {
    c.clearRect(0, 0, canvas.width, canvas.height)
    background.update()
    shop.update()
    
    player1.update(control.w, control.s, control.a, control.d, control.e)

    player2.update(control.i, control.k, control.j, control.l, control.o)

    c.fillStyle = 'rgba(255, 255, 255, 0.15)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    samurai.update(player1, samuraiIdle, samuraiRun, samuraiJump, samuraiFall, samuraiatttack1, samuraiDeath, control.e)
    kenji.update(player2, kenjiIdle, kenjiRun, kenjiJump, kenjiFall, kenjiatttack1, kenjiDeath, control.o)
    
    requestAnimationFrame(animation)
}

animation()
