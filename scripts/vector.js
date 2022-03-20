class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    static randAngle(magnitude = 1) {
        let angle = Math.random() * Math.PI * 2;
        return new Vector(Math.cos(angle)*magnitude, Math.sin(angle)*magnitude);
    }
    static rand2D(maxMagnitude = 1) {
        return Vector.randAngle().mult(Math.random() * maxMagnitude);
    }
    static randBox(width, height = width) {
        return new Vector(Math.random()*width, Math.random()*height);
    }
    copy() {
        return new Vector(this.x, this.y);
    }
    set(other) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    sub(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    mult(num) {
        this.x = this.x*num;
        this.y = this.y*num;
        return this;
    }
    div(num) {
        this.x = this.x/num;
        this.y = this.y/num;
        return this;
    }
    addXY(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }
    subXY(x, y) {
        this.x -= x;
        this.y -= y;
        return this;
    }
    sqMag() {
        return this.x**2 + this.y**2;
    }
    mag() {
        return Math.sqrt(this.sqMag());
    }
    dist(other) {
        return this.copy().sub(other).mag();
    }
    setMag(newMag) {
        let mag = this.mag();
        if (mag == 0) { // if no direction make up something random
            this.set(Vector.randAngle().mult(newMag));
            return this;
        }
        this.mult(newMag/this.mag());
        return this;
    }
    normalize() {
        this.setMag(1);
        return this;
    }
    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }
    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
    getAngle() {
        return Math.atan2(this.y, this.x);
    }
    setAngle(angle) {
        let oldMag = this.mag();
        this.x = Math.cos(angle)*oldMag;
        this.y = Math.sin(angle)*oldMag;
        return this;
    }
    rotate(angle) {
        this.setAngle(this.getAngle() + angle);
        return this;
    }
    dot(other) {
        return this.x*other.x + this.y*other.y;
    }
    hasNaN() {
        return isNaN(this.x) || isNaN(this.y);
    }
    assertNaN() {
        if (this.hasNaN()) throw "found NaN";
    }
    isInRect(width, height, radius) {
        return (this.x > radius && this.y > radius && this.x < width-radius && this.y < height-radius);
    }
    putInRect(width, height, radius) {
        if (this.x < radius) this.x = radius;
        if (this.y < radius) this.y = radius;
        if (this.x > width-radius) this.x = width-radius;
        if (this.y > height-radius) this.y = height-radius;
        return this;
    }
}