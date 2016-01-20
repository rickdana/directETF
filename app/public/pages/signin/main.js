angular.module("DirectETF")
    .controller('RegisterController', function($scope, $element, $http, $window, $routeParams) {
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
                username: "",
                password: "",
                firstName: "",
                secondName: "",
                city: "",
                address: "",
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
            register: function() {
                $scope.alert.info("Création du compte en cours...");
                this.status = 1;
                var riskLevel = 'Low';

                try {

                    var riskLevel = parseFloat(/riskLevel=(\d+)/.exec(location.href)[1]) > 50 ? 'High' : 'Low';
                } catch (e) {}

                this.user.id = 'clientModel' + riskLevel;
                this.user.firstName = this.user.firstName || 'Nouveau compte';
                this.user.username = this.user.username || new Date().getTime();
                this.user.password = this.user.password || '123';

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

        $scope.alert.clear();
        $scope.account.ping();
    });