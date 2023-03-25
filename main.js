
class Game {
    constructor() {
        this.canvas = document.getElementById('canvas').getContext('2d');
        this.height = canvas.height;
        this.width = canvas.width;
        this.map = Array(this.height).fill(null).map(() => Array(this.width).fill(null).map(() => new Brick(true)));
    }

    render(obj) {
        this.canvas.clearRect(0, 0, canvas.width, canvas.height);

        for (let each in obj) {
            const object = obj[each]

            this.canvas.fillStyle = object.color;
            this.canvas.fillRect(object.posX, object.posY, object.width, object.height);
        }

        requestAnimationFrame( () => {this.render(obj)} );
    }

    handleKeyDown(event, player) {
        const keyPressed = event.key;
        player.keys[keyPressed]();
    }
}

class Brick {
    constructor(block) {
        this.block = block;
    }
}

class Player {

    constructor(bounds, game) {
        this.height = 1;
        this.width = 1;
        this.color = "#eee";

        this.posX = bounds.startX + 1;
        this.posY = bounds.startY + 1;
        
        this.keys = {
            'ArrowUp': () => this.move(0, -1, game),
            'ArrowDown': () => this.move(0, 1, game),
            'ArrowLeft': () => this.move(-1, 0, game),
            'ArrowRight': () => this.move(1, 0, game)
        }

    }

    move(dx, dy, game) {
        console.log(game.map[this.posY + dy][this.posX + dx]);
        if (!game.map[this.posY + dy][this.posX + dx].block) {
            this.posY += dy;
            this.posX += dx;
        }
    }

    updatePosition(newX, newY) {
        this.posX = newX;
        this.posY = newY;
    }
}

class Boss {
    constructor(bounds, game) {
        this.height = 1;
        this.width = 1;
        this.color = "#e11";

        this.posX = bounds.startX;
        this.posY = bounds.startY;

    }

    move(dx, dy, game) {
        console.log(game.map[this.posY + dy][this.posX + dx]);
        if (!game.map[this.posY + dy][this.posX + dx].block) {
            this.posY += dy;
            this.posX += dx;
        }
    }

    updatePosition(newX, newY) {
        this.posX = newX;
        this.posY = newY;
    }
}

class Corridor {

    constructor(game, room, nextRoom, horizontal) {
        this.color = "blue";

        if (horizontal) {

            if (room.posX >= nextRoom.posX) {
                this.posX = nextRoom.posX;
                this.width = room.posX - nextRoom.posX;
            } else {
                this.posX = room.posX;
                this.width = nextRoom.posX - room.posX;
            }

            this.posY = room.posY;
            this.height = 1;
        } else {

            if (room.posY >= nextRoom.posY) {
                this.posY = nextRoom.posY;
                this.height = room.posY - nextRoom.posY;
            } else {
                this.posY = room.posY;
                this.height = nextRoom.posY - room.posY;
            }

            this.posX = room.posX;
            this.width = 1;
        }

        for (let i = this.posY; i < (this.posY + this.height); i++) {
            if (i < game.map.length) {

                for (let j = this.posX; j < (this.posX + this.width); j++) {
                    if (j < game.map[i].length) {
                        game.map[i][j].block = false;
                    }
                }

            } else {
                continue;
            }

        }
    }
}

class Room {

    constructor(game) {
        this.width = 7;
        this.height = 7;
        this.color = "blue";

        let colision = false;

        do {
            this.posX = Math.floor(Math.random() * (game.width - this.width));
            this.posY = Math.floor(Math.random() * (game.height - this.height));

            colision = !game.map[this.posY][this.posX].block || !game.map[this.posY + this.height][this.posX].block || !game.map[this.posY][this.posX + this.width].block || !game.map[this.posY + this.height][this.posX + this.width].block ;
        } while (colision);

        for (let i = this.posY; i < (this.posY + this.height); i++) {
            for (let j = this.posX; j < (this.posX + this.width); j++) {
                game.map[i][j].block = false;
            }
        }
    }
}

function main() {
    const game = new Game();

    let rooms = [];
    let corridors = [];

    const directions = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
    ];

    let labirinth = [];

    let exitPath = [];

    for (let i = 0; i < 5; i++){
        if (i == 0) {
            let path;
            let isValid = false;

            do {
                path = Math.floor(Math.random() * 4);

                if (path != 3) {
                    isValid = true;
                }
            } while (!isValid);

            exitPath.push(path);
        } else {
            let path;
            let isValid = false;

            do {
                path = Math.floor(Math.random() * 4);

                const oposite = exitPath[i-1]%2 == 0 ? exitPath[i-1] + 1 : exitPath[i-1] - 1;

                if (path != oposite) {
                    console.log(oposite)
                    isValid = true;
                }
            } while (!isValid);

            exitPath.push(path);
        }
    }

    console.log(exitPath);

    for (let i = 0; i <= 6; i++) {
        rooms.push(new Room(game));
    }

    for (let each = 0; each <= 5; each++) {

        const room = rooms[each];
        const nextRoom = rooms[each + 1];

        const coin = Math.random() < 0.5;

        corridors.push(new Corridor(game, room, nextRoom, coin))
        corridors.push(new Corridor(game, nextRoom, room, !coin))
    }

    for (let each in exitPath) {
        let currentDirection = directions[exitPath[each]];
        let center = [game.map[0].length/2, game.map.length/2];

        labirinth.push(new Corridor(game,
            {posX: center[0], posY: center[1]},
            {posX: center[0] + (center[0] * currentDirection[0]), posY: center[1] + (center[1] * currentDirection[1])},
            currentDirection[1] == 0));

    }

    console.log(labirinth);

    const player = new Player({
        startX: rooms[0].posX,
        startY: rooms[0].posY
    }, game);

    const boss = new Boss({
        startX: rooms.slice(-1)[0].posX,
        startY: rooms.slice(-1)[0].posY
    }, game);

    window.addEventListener('keydown', event => {
        game.handleKeyDown(event, player);
    });

    game.render([...rooms, ...corridors, player, boss]);
    // game.render([...labirinth, player]);
}

main();
