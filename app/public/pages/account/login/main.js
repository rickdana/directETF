angular.module("DirectETF")
    .factory('$AccountFactory', function() {
        var handleLogin = function ($element) {
            $element.find('.login-form').validate({
                errorElement: 'span', //default input error message container
                errorClass: 'help-block', // default input error message class
                focusInvalid: false, // do not focus the last invalid input
                rules: {
                    username: {
                        required: true
                    },
                    password: {
                        required: true
                    },
                    remember: {
                        required: false
                    }
                },

                messages: {
                    username: {
                        required: "Username is required."
                    },
                    password: {
                        required: "Password is required."
                    }
                },

                invalidHandler: function (event, validator) { //display error alert on form submit
                    $('.alert-danger', $('.login-form')).show();
                },

                highlight: function (element) { // hightlight error inputs
                    $(element)
                        .closest('.form-group').addClass('has-error'); // set error class to the control group
                },

                success: function (label) {
                    label.closest('.form-group').removeClass('has-error');
                    label.remove();
                },

                errorPlacement: function (error, element) {
                    error.insertAfter(element.closest('.input-icon'));
                },

                submitHandler: function (form) {
                    form.submit(); // form validation success, call ajax form submit
                }
            });

            $element.find('.login-form input').keypress(function (e) {
                if (e.which == 13) {
                    if ($('.login-form').validate().form()) {
                        $('.login-form').submit(); // form validation success, call ajax form submit
                    }
                    return false;
                }
            });
        }

        var handleForgetPassword = function ($element) {
            $element.find('.forget-form').validate({
                errorElement: 'span', //default input error message container
                errorClass: 'help-block', // default input error message class
                focusInvalid: false, // do not focus the last invalid input
                ignore: "",
                rules: {
                    email: {
                        required: true,
                        email: true
                    }
                },

                messages: {
                    email: {
                        required: "Email is required."
                    }
                },

                invalidHandler: function (event, validator) { //display error alert on form submit

                },

                highlight: function (element) { // hightlight error inputs
                    $(element)
                        .closest('.form-group').addClass('has-error'); // set error class to the control group
                },

                success: function (label) {
                    label.closest('.form-group').removeClass('has-error');
                    label.remove();
                },

                errorPlacement: function (error, element) {
                    error.insertAfter(element.closest('.input-icon'));
                },

                submitHandler: function (form) {
                    form.submit();
                }
            });

            $('.forget-form input').keypress(function (e) {
                if (e.which == 13) {
                    if ($('.forget-form').validate().form()) {
                        $('.forget-form').submit();
                    }
                    return false;
                }
            });

            jQuery('#forget-password').click(function () {
                jQuery('.login-form').hide();
                jQuery('.forget-form').show();
            });

            jQuery('#back-btn').click(function () {
                jQuery('.login-form').show();
                jQuery('.forget-form').hide();
            });

        }

        var handleRegister = function ($element) {

            function format(state) {
                if (!state.id) {
                    return state.text;
                }
                var $state = $(
                    '<span><img src="../assets/global/img/flags/' + state.element.value.toLowerCase() + '.png" class="img-flag" /> ' + state.text + '</span>'
                );

                return $state;
            }

            if (jQuery().select2 && $('#country_list').size() > 0) {
                $("#country_list").select2({
                    placeholder: '<i class="fa fa-map-marker"></i>&nbsp;Select a Country',
                    templateResult: format,
                    templateSelection: format,
                    width: 'auto',
                    escapeMarkup: function (m) {
                        return m;
                    }
                });


                $('#country_list').change(function () {
                    $('.register-form').validate().element($(this)); //revalidate the chosen dropdown value and show error or success message for the input
                });
            }

            $('.register-form').validate({
                errorElement: 'span', //default input error message container
                errorClass: 'help-block', // default input error message class
                focusInvalid: false, // do not focus the last invalid input
                ignore: "",
                rules: {

                    fullname: {
                        required: true
                    },
                    email: {
                        required: true,
                        email: true
                    },
                    address: {
                        required: true
                    },
                    city: {
                        required: true
                    },
                    country: {
                        required: true
                    },

                    username: {
                        required: true
                    },
                    password: {
                        required: true
                    },
                    rpassword: {
                        equalTo: "#register_password"
                    },

                    tnc: {
                        required: true
                    }
                },

                messages: { // custom messages for radio buttons and checkboxes
                    tnc: {
                        required: "Please accept TNC first."
                    }
                },

                invalidHandler: function (event, validator) { //display error alert on form submit

                },

                highlight: function (element) { // hightlight error inputs
                    $(element)
                        .closest('.form-group').addClass('has-error'); // set error class to the control group
                },

                success: function (label) {
                    label.closest('.form-group').removeClass('has-error');
                    label.remove();
                },

                errorPlacement: function (error, element) {
                    if (element.attr("name") == "tnc") { // insert checkbox errors after the container
                        error.insertAfter($('#register_tnc_error'));
                    } else if (element.closest('.input-icon').size() === 1) {
                        error.insertAfter(element.closest('.input-icon'));
                    } else {
                        error.insertAfter(element);
                    }
                },

                submitHandler: function (form) {
                    form.submit();
                }
            });

            $('.register-form input').keypress(function (e) {
                if (e.which == 13) {
                    if ($('.register-form').validate().form()) {
                        $('.register-form').submit();
                    }
                    return false;
                }
            });

            jQuery('#register-btn').click(function () {
                jQuery('.login-form').hide();
                jQuery('.register-form').show();
            });

            jQuery('#register-back-btn').click(function () {
                jQuery('.login-form').show();
                jQuery('.register-form').hide();
            });
        }

        return {
            initLogin: handleLogin,
            initForgetPassword: handleForgetPassword,
            initRegister: handleRegister
        };
    })
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
    .controller('LoginController', function($AccountFactory, $scope, $element, $http, $window) {
        $AccountFactory.initLogin($element);
    })
    .controller('ForgetPasswordController', function($AccountFactory, $scope, $element, $http, $window) {
        $AccountFactory.initForgetPassword($element);
    })
    .controller('RegisterController', function($AccountFactory, $scope, $element, $http, $window) {
        $AccountFactory.initRegister($element);
    })