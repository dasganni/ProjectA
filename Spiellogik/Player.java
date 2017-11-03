public class Player{
	
	private String name = " ";
	private int lives = 3;
	private int ammo = 1;
	private int attack =0;
	private boolean defend = false;
	
	public Player(String name){
		this.name = name;
	}

	public void shootPistol(){
		attack =1;
		ammo -=1;
		defend = false;
	}
	
	public void shootRifle(){
		attack =2;
		ammo -=3;
		defend = false;
	}
	
	public void shootShotgun(){
		attack =3;
		ammo -=5;
		defend = false;
	}
	
	public void reload(){
		ammo +=1;
		attack =0;
		defend = false;
	}
	public void defend(){
		defend = true;
	}
	
	public void looseLife(int x){
		lives -=x;
	}
	
	public int getLives(){
		return lives;
	}
	public int getAttack(){
		return attack;
	}
	public int getAmmo(){
		return ammo;
	}

	public boolean getDefense(){
		return defend;
	}
	
	public String getName(){
		return name;
	}
	
	
}