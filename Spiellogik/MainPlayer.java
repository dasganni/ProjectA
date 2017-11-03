import java.util.*;

public class MainPlayer{
	public static void main(String[] args){

		Player player1 = new Player("Player1");
		Player player2 = new Player("Player2");
		Scanner scanner = new Scanner(System.in);
		int eingabe =0;

		while(player1.getLives() > 0 && player2.getLives() > 0) {


			System.out.println("Spieler 1, was willst du tun? Du hast " + player1.getAmmo() + " Munition. [0]Schießen [1] Nachladen [2] Schützen");
			eingabe = scanner.nextInt();
			if (eingabe == 0){
				if(player1.getAmmo()>=5){

				System.out.println("Welche Waffe willst du verwenden? [0]Schrotflinte (3 Schaden, 5 Muni) [1] Gewehr(2 Schaden, 3 Muni) [2] Pistole");
				eingabe = scanner.nextInt();
				if (eingabe == 0){
					player1.shootShotgun();
				}
				else if (eingabe==1){
					player1.shootRifle();
				}
				else {
					player1.shootPistol();
				}
				}

				else if(player1.getAmmo()<5 && player1.getAmmo()>=3){

				System.out.println("Welche Waffe willst du verwenden? [0]Gewehr(2 Schaden, 3 Muni) [1] Pistole");
				eingabe = scanner.nextInt();
				if (eingabe == 0){
					player1.shootRifle();
				}
				else{
					player1.shootPistol();
				}
				
				}
				else if(player1.getAmmo()>0 && player1.getAmmo()<3){
					player1.shootPistol();
					}
				else{
						System.out.println("Nicht genug Munition. Es wird stattdessen nachgeladen.");
						player1.reload();
					}
			}
			else if(eingabe ==1){
				player1.reload();
			}
			else{
				player1.defend();
			}

			System.out.println("Spieler 2, was willst du tun? Du hast " + player2.getAmmo() + " Munition. [0]Schießen [1] Nachladen [2] Schützen");
			eingabe = scanner.nextInt();
			if (eingabe == 0){
				if(player2.getAmmo()>=5){

				System.out.println("Welche Waffe willst du verwenden? [0]Schrotflinte (3 Schaden, 5 Muni) [1] Gewehr(2 Schaden, 3 Muni) [2] Pistole");
				eingabe = scanner.nextInt();
				if (eingabe == 0){
					player2.shootShotgun();
				}
				else if (eingabe==1){
					player2.shootRifle();
				}
				else {
					player2.shootPistol();
				}
				}

				else if(player2.getAmmo()<5 && player2.getAmmo()>=3){

				System.out.println("Welche Waffe willst du verwenden? [0]Gewehr(2 Schaden, 3 Muni) [1] Pistole");
				eingabe = scanner.nextInt();
				if (eingabe == 0){
					player2.shootRifle();
				}
				else{
					player2.shootPistol();
				}
				
				}
				else if(player2.getAmmo()>0 && player2.getAmmo()<3){
					player2.shootPistol();
					}
				else{
						System.out.println("Nicht genug Munition. Es wird stattdessen nachgeladen.");
						player2.reload();
					}
			}
			else if(eingabe ==1){
				player2.reload();
			}
			else{
				player2.defend();
			}






			if (player1.getAttack()>player2.getAttack() && !player2.getDefense()){
				player2.looseLife((player1.getAttack()-player2.getAttack()));
			}

			else if (player2.getAttack()>player1.getAttack() && !player1.getDefense()){
				player1.looseLife((player2.getAttack()-player1.getAttack()));
			}

			else {
				System.out.println("Nichts passiert.");
			}
			System.out.println(player1.getLives() + "  " + player2.getLives());
		
		
		
		
		
		if (player1.getLives()==0){
			System.out.println("Spieler 2 gewinnt!");
		}
		else{
			System.out.println("Spieler 1 gewinnt!");
			}
			}
		
		
		
	}
}