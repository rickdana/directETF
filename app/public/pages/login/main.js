angular.module("DirectETF")
    .controller('AccountController', function($scope, $element, $http, $window) {
        $scope.alert = {
            type: "",
            message: "",
            class: function () {
                return this.type == 'info' ? 'alert-info' : 'alert-danger';
            },
            info: function(msg) {
                this.type = 'info';
                this.message = msg;
            },
            error: function(msg) {
                this.type = 'error';
                this.message = msg;
            },
            clear: function() {
                this.type = '';
                this.message = '';
            }
        };

        $scope.account = {
            status: -1,
            user: {
                username: "demo@directetf.com",
                password: "demo",
                firstName: "Sébastien",
                secondName: "Demanou",
                city: "Paris",
                address: "",
            },
            page: {
                current: '',
                title: '',
                login: function() {
                    this.current = 'login';
                    this.title = 'Connexion';
                    $scope.alert.clear();
                },
                forget: function() {
                    this.current = 'forget';
                    this.title = 'Mot de passe oublié ?';
                    $scope.alert.clear();
                },
                register: function() {
                    this.current = 'register';
                    this.title = "Création d'un compte";
                    $scope.alert.clear();
                },
            },
            ping: function() {
                $scope.alert.info("Connexion au serveur...");
                this.status = 1;

                $http.head('/login')
                    .success(function(data, status) {
                        $scope.account.status = 2;

                        $scope.alert.info("Restauration de votre session...");

                        setTimeout(function() {
                            $window.location.href = '/dashboard';
                        }, 1000);
                    })
                    .error(function(data, status) {
                        $scope.account.status = 0;

                        if (status != 401) {
                            $scope.alert.error("Impossible de contacter le serveur. Veuillez reéssayer plus tard.");
                        } else {
                            $scope.alert.clear();
                        }
                    });
            },
            connect: function() {
                $scope.alert.info("Authentification...");
                this.status = 1;

                $http.post('/login', {email: this.user.username, password: this.user.password})
                    .success(function(data, status) {
                        $scope.account.status = 2;

                        $scope.alert.info("Authentification réussite...");
                        $window.location.href = '/dashboard';
                    })
                    .error(function(data, status) {
                        $scope.account.status = 0;
                        $scope.account.user.password = "";

                        switch (status) {
                            case 401:
                                $scope.account.status = 0;
                                $scope.alert.error("Identifiant ou mot de passe incorrect");
                                break;

                            default:
                                $scope.alert.error("Une erreur inattendue s'est produite pendant la connexion. Veuillez reéssayer plus tard.");
                                break;
                        }
                    });
            },
            register: function() {
                $scope.alert.info("Création du compte en cours...");
                this.status = 1;

                $http.post('/signup', this.user)
                    .success(function(data, status) {
                        $scope.account.status = 2;

                        $scope.alert.info("Compte créé...");

                        setTimeout(function() {
                            $scope.alert.info("Initialisation de votre session...");

                            setTimeout(function() {
                                $window.location.href = '/dashboard';
                            }, 2000);
                        }, 1000);
                    })
                    .error(function(data, status) {
                        $scope.account.status = 0;
                        $scope.account.password = "";

                        switch (status) {
                            case 400:
                                $scope.account.status = 0;
                                $scope.alert.error("Veuillez remplir correctement le formulaire");
                                break;

                            default:
                                $scope.alert.error("Une erreur inattendue s'est produite pendant la connexion. Veuillez reéssayer plus tard.");
                                break;
                        }
                    });
            }

        };

        $scope.account.page.login();
        $scope.account.ping();
    })
    .controller('LoginController', function($scope, $element) {
    })
    .controller('ForgetPasswordController', function($scope, $element) {
    })
    .controller('RegisterController', function($scope, $element) {
    })