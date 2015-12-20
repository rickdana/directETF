# directETF

### Configuration d'un environnement:
1/ Installer Node (version 4.2)
2/ Git et Java 8 doivent être installés.
3/ Git clone directETF & directETF-ws
4/ npm install -g bower
5/ Installer maven 3.3

### Déploiement en dev

#### Web services:
make package
Deployer le WAR Dans tomcat (Before deploy, put maven goal install / deployer le WAR exploded)
PEut aussi être lancé en JAR (attention refactorng à faire sur getFile / getRessource)

#### Web:
configurer environnement (prod par defaut, dev explicite)
Sous mac:
NODE_ENV=dev
(Npm install si packages.json a été modifié)
(modifier le prox si besoin dans config bower , npm install appelle bower)
npm start

### Déploiement Sur AWS BeanStalk

#### WS
upload the WAR produced by maven. Should work out of the box
Select a tomcat config, default options

#### Web
pour deployer sur EC2:
creer VM, s'y connecter (il faut le PEM et faire reqest password + 
download file)
installer node
installer git (il faut modifier les options de securite de IE pour 
autoriser telechargement)
faire git clone
faire npm start
configurer firewall windows, ouvrir port 80
configurer le groupe de securité de l'instance, ajouter inbound rule 
pour 80 http
attention au proxy bower

Build web package for AWS:
Zip the directETF folder (should be at the root, not the folder itself) & remove before the
•         Remove node modules & bower install folders
•         Select the fliles in the folder & compress (not the folder itself)
•         Verifier que bowerrc n’a plus le proxy
•         (tmp : supprimé goal test)
