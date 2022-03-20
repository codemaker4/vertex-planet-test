class Camera {
    constructor(ctx, canvas, pos = new Vector(0,0), zoom = 1) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.diagonalRadius = new Vector(this.canvas.width/2, this.canvas.height/2).mag();
        this.pos = pos;
        this.zoom = zoom;
    }
    get rotation() {
        return this.pos.getAngle()+Math.PI/2
    }
    doTransform() {
        this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
        this.ctx.rotate(-this.rotation);
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.pos.x, -this.pos.y);
    }
    isOnScreen(pos, margin = 0) {
        return this.distToScreen(pos) < margin;
    }
    distToScreen(pos) {
        return (pos.dist(this.pos)*this.zoom) - this.diagonalRadius
    }
    getOnWorldPos(pos) {
        return pos.copy().subXY(this.canvas.width/2, this.canvas.height/2).div(this.zoom).rotate(this.rotation).add(this.pos);
    }
    zoomBy(factor) {
        this.zoom = this.zoom*factor;
        if (this.zoom > 1) this.zoom = 1;
    }
    move(delta) {
        this.pos.add(delta.copy().div(this.zoom));
    }
    moveRotated(delta) {
        this.move(delta.copy().rotate(this.rotation));
    }
    goTo(pos) {
        this.pos.set(pos);
    }
}