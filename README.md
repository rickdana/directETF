# directETF

### Configuration d'un environnement:
1/ Installer Node (version 4.2)

2/ Git et Java 8 doivent être installés.

3/ Git clone directETF & directETF-ws

4/ npm install -g bower

5/ Installer maven 3.3 (pour project WS)

6/ Installer Tomcat 8 (pour project WS)

### Déploiement en dev

#### Web services:

Créer une configuration runtime Tomcat:
Deployer le WAR Dans tomcat (Before deploy, put maven goal install / deployer le WAR exploded)
PEut aussi être lancé en JAR (attention refactorng à faire sur getFile / getRessource)

#### Web:

1/ Pour configurer environnement (AWS par defaut, dev explicite)
Sous mac: NODE_ENV=dev
Sous windows: set NODE_ENV=dev

2/ npm start

Si besoin, modifier le proxy dans la config bower (.bowerrc), sinon erreur lors de npm install.

### Déploiement Sur AWS BeanStalk

#### WS

upload the WAR produced by maven. Should work out of the box.
Select a tomcat config, default options.

#### Web


modifier proxy bower
verifier que le shell a git (utliser git shell)

Pour deployer sur EC2:
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

Build web package for AWS: ne fonctionne plus (erreur causée par dependances)

Zip the directETF folder (should be at the root, not the folder itself) & remove before the
•         Remove node modules & bower install folders
•         Select the fliles in the folder & compress (not the folder itself)
•         Verifier que bowerrc n’a plus le proxy
•         (tmp : supprimé goal test)
