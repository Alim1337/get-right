# Application de covoiturage Next.js, JavaScript, MySQL, and Prisma

Bienvenue sur l'application de covoiturage Get Right basée sur Next.js, JavaScript, MySQL et Prisma. Cette application permet aux utilisateurs de proposer et de réserver des trajets en covoiturage.

## Prérequis

Assurez-vous d'avoir les éléments suivants installés localement avant de commencer :

- Node.js (version recommandée)
- Yarn
- MySQL Server
- Prisma CLI

## Configuration de la base de données

1. Créez une base de données MySQL pour l'application.

2. Créez un fichier `.env`. Remplissez les informations de connexion à la base de données dans ce fichier sous cette forme: `mysql://USER:PASSWORD@HOST:PORT/DATABASE` .

3. Exécutez les migrations pour créer les tables de la base de données :

   ```bash
   yarn prisma migrate dev
    ```
L'application sera accessible à l'adresse http://localhost:3000.

## Configuration de l'application
```
git clone https://github.com/votre-utilisateur/votre-repo.git
cd votre-repo
yarn
yarn dev
```

## Utilisation de l'Application

- Accédez à l'application dans votre navigateur.

- Connectez-vous à votre compte utilisateur ou créez-en un si nécessaire.

- Explorez les fonctionnalités de l'application pour proposer ou réserver des trajets en covoiturage.

## Auteurs

- Laribi Abdelalim
- Fethallah Mohamed Racim
- Yaici Aya
- Laraba Yamina Nesrine
-

