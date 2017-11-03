var Player = (function () {
    function Player(name) {
        this.name = " ";
        this.lives = 3;
        this.ammo = 1;
        this.attack = 0;
        this.__defend = false;
        this.name = name;
    }
    Player.prototype.shootPistol = function () {
        this.attack = 1;
        this.ammo -= 1;
        this.__defend = false;
    };
    Player.prototype.shootRifle = function () {
        this.attack = 2;
        this.ammo -= 3;
        this.__defend = false;
    };
    Player.prototype.shootShotgun = function () {
        this.attack = 3;
        this.ammo -= 5;
        this.__defend = false;
    };
    Player.prototype.reload = function () {
        this.ammo += 1;
        this.attack = 0;
        this.__defend = false;
    };
    Player.prototype.defend = function () {
        this.__defend = true;
    };
    Player.prototype.looseLife = function (x) {
        this.lives -= x;
    };
    Player.prototype.getLives = function () {
        return this.lives;
    };
    Player.prototype.getAttack = function () {
        return this.attack;
    };
    Player.prototype.getAmmo = function () {
        return this.ammo;
    };
    Player.prototype.getDefense = function () {
        return this.__defend;
    };
    Player.prototype.getName = function () {
        return this.name;
    };
    return Player;
}());
Player["__class"] = "Player";