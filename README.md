# Get Right - Application de Covoiturage

Bienvenue sur Get Right, une application de covoiturage basée sur Next.js, JavaScript, MySQL et Prisma. Permet aux utilisateurs de proposer et de réserver des trajets en covoiturage, offrant une solution pratique pour partager vos voyages avec d'autres.

## Prérequis

Assurez-vous d'avoir les éléments suivants installés localement avant de commencer :
- Node.js (version recommandée)
- Yarn
- MySQL Server
- Prisma
  
# Get Right App
Ce dépôt contient le code source de l'application Get Right. Suivez les instructions ci-dessous pour cloner, configurer et exécuter l'application localement.

## Clonage du dépôt

Vous pouvez cloner ce dépôt directement depuis VSCode ou en utilisant le terminal. Exécutez les commandes suivantes :

- git clone https://github.com/Alim1337/get-right.git
- cd get-right

## Installation des dépendances
- npm install -g yarn
- yarn install
- npm install -g prisma

## Configuration de la base de données

1. Créez un fichier .env à la racine du projet.

2. Remplissez les informations de connexion à la base de données dans le fichier .env selon le format suivant :
   

   - DATABASE_URL=mysql://root@localhost:3306/get_right
   - JWT_SECRET="A#9_çç^:872012P<+2"
        
4. Assurez-vous de ne pas utiliser le port 3306 ailleurs, puis connectez-vous au serveur MySQL.

## Création de la base de données
#Appliquer les migrations pour créer la base de données :
- yarn prisma migrate dev
  
 Cette commande génère et exécute les scripts SQL nécessaires à la création de la base de données
 en utilisant le schéma défini dans le fichier 'schema.prisma' du dossier 'prisma'.

Lorsqu'on vous demande un nom pour la migration, par exemple, saisissez migrate1.

Ensuite, remplissez les tables users et admins avec les données nécessaires en exécutant les commandes SQL.

Ajoutez également le trigger SQL fourni pour mettre à jour les sièges après une réservation.

## Ajouter ce trigger : 
DELIMITER //

CREATE TRIGGER update_seats_after_reservation

AFTER INSERT ON reservations

FOR EACH ROW

BEGIN
    DECLARE seats_needed INT;
    SELECT nbr_seat_req INTO seats_needed FROM ride_requests WHERE tripId = NEW.tripId;
    UPDATE trips SET availableSeats = availableSeats - seats_needed WHERE tripId = NEW.tripId;
    
END;

//

DELIMITER ;

## Démarrage de l'application
La configuration étant terminée, lancez l'exécution avec la commande suivante :
- yarn dev

L'application sera accessible à l'adresse http://localhost:3000.

## Utilisation de l'Application

- Accédez à l'application dans votre navigateur.

- Connectez-vous à votre compte utilisateur ou créez-en un si nécessaire.

- Explorez les fonctionnalités de l'application pour proposer ou réserver des trajets en covoiturage.

## Auteurs

- Laribi Abdelalim
- Fethallah Mohamed Racim
- Yaici Aya
- Laraba Yamina Nesrine
- Hamdi Nesrine

