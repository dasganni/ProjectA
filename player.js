//Klasse Player

function Player(name) {
    
    this.lives = 3;
    this.ammo = 1;
    this.attack = 0;
    this.__defend = false;
    this.name = name;
    this.alive = true;
    
    this.shootPistol = function() {
        this.attack = 1;
        this.ammo -= 1;
        this.__defend = false;
    };    

    this.shootRifle = function() {
        this.attack = 2;
        this.ammo -= 3;
        this.__defend = false;
    };
    this.shootShotgun = function() {
        this.attack = 3;
        this.ammo -= 5;
        this.__defend = false;
    };
    this.reload = function() {
        this.ammo += 1;
        this.attack = 0;
        this.__defend = false;
    };
    this.defend = function() {
        this.__defend = true;
    };
    this.looseLife = function(x) {
        this.lives -= x;
    };
    this.getLives = function() {
        return this.lives;
    };
    this.getAttack = function() {
        return this.attack;
    };
    this.getAmmo = function() {
        return this.ammo;
    };
    this.getDefense = function() {
        return this.__defend;
    };
    this.getName = function() {
        return this.name;
    };
    this.setDead = function() {
        this.alive=false;
    };
}

module.exports = {Player: Player};