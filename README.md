# Get Right - Application de Covoiturage

Bienvenue sur Get Right, une application de covoiturage basée sur Next.js, JavaScript, MySQL et Prisma. Permet aux utilisateurs de proposer et de réserver des trajets en covoiturage, offrant une solution pratique pour partager vos voyages avec d'autres.

## Prérequis

Assurez-vous d'avoir les éléments suivants installés localement avant de commencer :

- Node.js (version recommandée)
- Yarn
- MySQL Server
- Prisma 

## Configuration de l'application
```
git clone https://github.com/Alim1337/get-right.git
cd get-right
yarn
yarn dev
```

## Configuration de la base de données

1. Créez une base de données MySQL pour l'application.

2. Créez un fichier `.env`. Remplissez les informations de connexion à la base de données dans ce fichier sous cette forme: "
3.      DATABASE_URL=mysql://root@localhost:3306/get_right
        JWT_SECRET="A#9_çç^:872012P<+2"
        "
4. Exécutez les migrations pour créer les tables de la base de données :

   les commandes :
 npm install -g prisma
 # Installer Yarn Prisma CLI globalement (si ce n'est pas déjà fait) :
yarn global add prisma

# Créer et initialiser le projet Prisma dans le répertoire actuel :
yarn prisma init

# Appliquer les migrations pour créer la base de données :
yarn prisma migrate dev
# Cette commande génère et exécute les scripts SQL nécessaires à la création de la base de données
# en utilisant le schéma défini dans le fichier 'schema.prisma' du dossier 'prisma'.

# Générer les clients Prisma pour faciliter l'interaction avec la base de données :
prisma generate
# Cette commande génère le code client Prisma à partir des modèles définis dans le schéma,
# facilitant ainsi l'accès et la manipulation des données dans votre application.

#ajouter ce trigger : (
DELIMITER //
CREATE TRIGGER update_seats_after_reservation
AFTER INSERT ON reservations
FOR EACH ROW
BEGIN
DECLARE seats_needed INT;
SELECT nbr_seat_req INTO seats_needed FROM ride_requests WHERE tripId = NEW.tripId;
UPDATE trips SET availableSeats = availableSeats - seats_needed WHERE tripId = NEW.tripId;
END; //
DELIMITER ;)
    
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

