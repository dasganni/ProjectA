//Klasse Player

exports.Player = class {
    constructor(name) {
        this.lives = 3;
        this.ammo = 1;
        this.attack = 0;
        this.__defend = false;
        this.name = name;
    }
    shootPistol() {
        this.attack = 1;
        this.ammo -= 1;
        this.__defend = false;
    };
    shootRifle () {
        this.attack = 2;
        this.ammo -= 3;
        this.__defend = false;
    };
    shootShotgun () {
        this.attack = 3;
        this.ammo -= 5;
        this.__defend = false;
    };
    reload () {
        this.ammo += 1;
        this.attack = 0;
        this.__defend = false;
    };
    defend () {
        this.__defend = true;
    };
    looseLife (x) {
        this.lives -= x;
    };
    getLives () {
        return this.lives;
    };
    getAttack () {
        return this.attack;
    };
    getAmmo () {
        return this.ammo;
    };
    getDefense () {
        return this.__defend;
    };
    getName () {
        return this.name;
    };
}