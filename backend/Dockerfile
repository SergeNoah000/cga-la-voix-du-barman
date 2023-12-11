# Utilisation de l'image Node.js officielle en tant qu'image de base
FROM node:20

# Définition du répertoire de travail dans le conteneur pour votre application
WORKDIR /usr/src/app

# Copie de tous les fichiers de votre application dans le conteneur
COPY . .

# Installation des dépendances pour votre application
RUN npm install

RUN node dabase.js
# Exposer le port sur lequel le serveur Express va écouter (vous pouvez changer cela selon le port utilisé par votre serveur)
EXPOSE 8080

# Commande pour démarrer votre serveur Express
CMD ["node", "server.js"]
