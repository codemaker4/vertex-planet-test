class Planet {
    constructor() {
        // this.allTerrainVerts = [];
        // TODO this.terrainChunks = {};// this.terrainChunks[ix][iy] = [vert, vert, vert...]

        this.chainStarts = [];

        this.maxVertDist = 50;
        this.minVertDist = this.maxVertDist/2;
    }
    addShape(vecs) { // uses the given array of vectors to create a vertex loop
        if (vecs.length < 3) {
            console.warn(`Warn in Planet.addShape(vecs): The vecs array had a length of ${vecs.length}, meaning that the area would be 0. The shape was not added, as it would vanish anyway.`);
            return;
        }

        let newChain = []; // temp store newly created chain for linking algorithim
        for (let i = 0; i < vecs.length; i++) { // create new verts and store them
            const newVert = new Planet.Vert(this, vecs[i].copy(), undefined, undefined); // keep links undefined for now
            newChain.push(newVert);
            // this.allTerrainVerts.push(newVert);
        }

        // linking algorithim
        newChain[newChain.length-1].cwVert = newChain[0]; // link the ends of the chain together
        newChain[0].ccVert = newChain[newChain.length-1];
        for (let i = 0; i < newChain.length-1; i++) { // link the rest of the chain together
            newChain[i].cwVert = newChain[i+1];
            newChain[i+1].ccVert = newChain[i];
        }

        this.chainStarts.push(newChain[0]);
    }
    randomise() {
        const vertCount = 500000;
        let randomPlanet = [];
        let circleNoise = new Planet.CircleNoise(18, 0.50, 2, Math.PI);
        for (let i = 0; i < vertCount; i++) {
            const rotation = i/(vertCount+2)*Math.PI*2;
            randomPlanet.push(new Vector(1000000,0).mult(1+circleNoise.get(rotation)).rotate(rotation))
        }
        this.addShape(randomPlanet);
    }
    draw(ctx, camera) {
        ctx.fillStyle = '#75411c';
        let drawCallId = Math.random();
        let drawnVerts = 0;
        // for (let i = 0; i < this.allTerrainVerts.length; i++) {
        //     drawnVerts += this.allTerrainVerts[i].draw(ctx, drawCallId, camera);
        // }
        // drawnVerts += this.allTerrainVerts[0].draw(ctx, drawCallId, camera);
        for (let i = 0; i < this.chainStarts.length; i++) {
            drawnVerts += this.chainStarts[i].draw(ctx, drawCallId, camera);
        }
        console.log(drawnVerts);
    }
    static Vert = class {
        constructor(planet, pos, cwVert, ccVert) {
            this.planet = planet;
            this.pos = pos; // Vector relative to planet center
            this.cwVert = cwVert; // clockwise vertex from inside surface
            this.ccVert = ccVert; // counterclockwise vertex from inside surface

            this.lastDrawCallId = 0; // random number set everytime this vert is drawn to prevent double drawing;
            this.unused = false; // set to true to mark for deletion

            // TODO put in chunks
        }
        getChain() { // returns an array of all connected verts in the clockwise direction, starting with this and ending with this.ccVert
            let chain = [this];
            let nowVert = this.cwVert;
            while(nowVert !== this) { // loop clockwise until you get back to start, which is this vert
                chain.push(nowVert);
                nowVert = nowVert.cwVert;
            }
            return chain;
        }
        doChain(func, thisToo = true) { // executes given function func(Vert) on every vert in the connected chain in a clockwise direction.
            if (thisToo) {
                func(this);
            }
            let nowVert = this.cwVert;
            while(nowVert !== this) { // loop clockwise until you get back to start, which is this vert
                func(nowVert);
                nowVert = nowVert.cwVert;
            }
        }
        draw(ctx, drawCallId, camera) {
            if (this.lastDrawCallId == drawCallId) { // prevent double drawing
                return 0;
            }
            this.lastDrawCallId = drawCallId;
            
            let counter = 1;
            ctx.beginPath(); // draw the shape

            const onScreenInterval = Math.max(1, 2**Math.floor(Math.log2((5/camera.zoom) / this.planet.maxVertDist)));

            let drawnVerts = 0;

            let wasOnScreen = camera.isOnScreen(this.pos, this.planet.maxVertDist*camera.zoom);

            let distToScreen = camera.distToScreen(this.pos)-this.planet.maxVertDist*camera.zoom;
            let skipping = Math.floor((distToScreen/camera.zoom)/this.planet.maxVertDist);
            let skipDistCheck = -Math.floor((distToScreen/camera.zoom)/this.planet.maxVertDist);

            let isOnScreen, offScreenDirection, pointA, pointB;

            let chainFunc = (vert) => {
                if (skipping <= 0) {
                    if (skipDistCheck <= 0) {
                        distToScreen = camera.distToScreen(vert.pos)-this.planet.maxVertDist*camera.zoom;
                        skipDistCheck = -Math.floor((distToScreen/camera.zoom)/this.planet.maxVertDist);
                        skipping = Math.floor((distToScreen/camera.zoom)/this.planet.maxVertDist);
                    } else {
                        skipDistCheck --;
                    }
                    
                    isOnScreen = distToScreen < 0;
                    if (isOnScreen && !wasOnScreen) {
                        offScreenDirection = vert.pos.copy().sub(camera.pos).setMag(camera.diagonalRadius/camera.zoom);
                        pointB = offScreenDirection.copy().add(vert.pos);
                        pointA = pointB.copy().add(offScreenDirection.copy().rotate(-Math.PI/2).mult(4));
                        ctx.lineTo(pointA.x, pointA.y);
                        ctx.lineTo(pointB.x, pointB.y);
                        drawnVerts +=2;
                    }
                    if (counter%onScreenInterval == 0 && isOnScreen) {
                        ctx.lineTo(vert.pos.x, vert.pos.y); // add the vert
                        drawnVerts ++;
                    }
                    if (!isOnScreen && wasOnScreen) {
                        offScreenDirection = vert.pos.copy().sub(camera.pos).setMag(camera.diagonalRadius/camera.zoom);
                        pointA = offScreenDirection.copy().add(vert.pos);
                        pointB = pointA.copy().add(offScreenDirection.copy().rotate(Math.PI/2).mult(4));
                        ctx.lineTo(pointA.x, pointA.y);
                        ctx.lineTo(pointB.x, pointB.y);
                        drawnVerts +=2;
                    }
                    wasOnScreen = isOnScreen;
                } else {
                    skipping --;
                }
                counter ++;
                vert.lastDrawCallId = drawCallId; // register that this vert has already been drawn
            }
            this.doChain(chainFunc, true); // first vert has already been taken care of with the virst moveTo()
            
            chainFunc(this); // redo the func on this one more time to close the loop properly if this vert is on the edge of the screen

            ctx.fill();

            return drawnVerts;
        }
        checkConnection() { // checks clockwise connection and tries to solve distance issues
            if (this.pos.dist(this.cwVert.pos) < this.planet.minVertDist) {
                this.remove();
                return;
            }
            if (this.pos.dist(this.cwVert.pos) > this.planet.maxVertDist) {
                let newPos = this.cwVert.pos.copy().sub(this.pos).div(2).add(this.pos);
                this.addVert(newPos);
            }
        }
        addVert(newPos) { // adds a vert inbetween the clockwise connection
            // make new vertex and connect new to old
            let newVert = new Planet.Vert(this.planet, newPos, this.cwVert, this);
            this.planet.allTerrainVerts.push(newVert);

            // connect old verts to new vertex
            this.cwVert.ccVert = newVert;
            this.cwVert = newVert;
        }
        remove() { // removes vertex from planet and redoes connections
            // redo connections
            this.cwVert.ccVert = this.ccVert;
            this.ccVert.cwVert = this.cwVert;

            // mark for deletion
            this.unused = true;
        }
    }
    static CircleNoise = class {
        constructor(layerCount, layerWeightFactor, layerScaleFactor, initScaleFactor = Math.PI) {
            // layerCount = amount of 
            this.layers = [];
            let currentLayerWeightFactor = 1;
            let currentLayerScaleFactor = initScaleFactor;
            for (let i = 0; i < layerCount; i++) {
                this.layers.push(new Planet.CircleNoise.Layer(currentLayerWeightFactor, currentLayerScaleFactor));
                currentLayerWeightFactor = currentLayerWeightFactor * layerWeightFactor;
                currentLayerScaleFactor = currentLayerScaleFactor / layerScaleFactor;
            }
        }
        get(rotation) {
            let sum = 0
            for (let i = 0; i < this.layers.length; i++) {
                const layer = this.layers[i];
                sum += layer.get(rotation);
            }
            return sum;
        }
        static Layer = class {
            constructor(weight, stepSize) {
                this.stepSize = stepSize;
                this.points = [];
                for (let i = 0; i < Math.PI*2-0.000001; i+=stepSize) {
                    this.points.push(Math.random()*weight);
                }
            }
            get(rotation) {
                let i = Math.floor(rotation/this.stepSize);
                let a = this.points[i];
                let b;
                if (i+1 < this.points.length) {
                    b = this.points[i+1];
                } else {
                    b = this.points[0];
                }
                let fracion = (rotation/this.stepSize) - i;
                // return a*(1-fracion) + b*fracion;
                return a*(1-Planet.CircleNoise.smoothFac(fracion)) + b*Planet.CircleNoise.smoothFac(fracion);
            }
        }
        static smoothFac(x) {
            return (Math.sin((x-0.5)*Math.PI)/2)+0.5;
        }
    }
}