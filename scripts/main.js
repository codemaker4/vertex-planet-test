let canvas;
let ctx;

let drawInterval;

let planet;

let mouseX = 0;
let mouseY = 0;
let mouseDown = 0;
window.addEventListener('mousedown', e => {
    ++mouseDown;
    mouseX = e.offsetX;
    mouseY = e.offsetY;
})
window.addEventListener('mouseup', e => {
    --mouseDown;
    mouseX = e.offsetX;
    mouseY = e.offsetY;
})
window.addEventListener('mousemove', e => {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
});

let keysPressed = {};
window.addEventListener('keydown', (e) => {
    keysPressed[e.key.toLowerCase()] = true;
    // console.log(`Pressed ${e.key.toLowerCase()}`);
});
window.addEventListener('keyup', (e) => {
    keysPressed[e.key.toLowerCase()] = false;
});
function keyIsPressed(key) {
    return keysPressed[key.toLowerCase()] === true; // looks stupid, but keys that have never been pressed before would return undefined instead of false if you don't do this.
}

let camera;

let camIndex = 0;

window.addEventListener("load", () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    planet = new Planet();
    planet.randomise();

    camera = new Camera(ctx, canvas, planet.chainStarts[0].pos.copy(), 1);

    window.addEventListener('mousemove', e => {
        if (mouseDown) {
            camera.moveRotated(new Vector(-e.movementX, -e.movementY));
        }
    });

    window.addEventListener('wheel', (e) => {
        camera.zoomBy(0.999**e.deltaY);
    })

    let draw = () => {
        if (keyIsPressed("-")) {
            camera.zoomBy(0.99);
        }
        if (keyIsPressed("=")) { // +
            camera.zoomBy(1/0.99);
        }
        const camMoveSpeed = 10;
        if (keyIsPressed("a")) {
            camera.moveRotated(new Vector(-camMoveSpeed,0));
        }
        if (keyIsPressed("d")) {
            camera.moveRotated(new Vector(camMoveSpeed,0));
        }
        if (keyIsPressed("w")) {
            camera.moveRotated(new Vector(0,-camMoveSpeed));
        }
        if (keyIsPressed("s")) {
            camera.moveRotated(new Vector(0,camMoveSpeed));
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0,0,canvas.width,canvas.height);

        camera.doTransform();

        planet.draw(ctx, camera);

        let mouseWorldPos = camera.getOnWorldPos(new Vector(mouseX, mouseY));
        ctx.fillStyle = "#0000FF";
        ctx.fillRect(mouseWorldPos.x, mouseWorldPos.y, 10/camera.zoom, 10/camera.zoom);

        window.requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // draw();
    });

    window.requestAnimationFrame(draw);

    // drawInterval = setInterval(draw, 1000/60);
})