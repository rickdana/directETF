angular.module('MetronicApp')
    .factory('$PortfolioFactory', function($http) {
        var models = {}
          , goals = [
                {
                    code: "just-invest",
                    label: "Juste investir",
                    tooltip: "Je souhaite juste investir",
                    icon: "icon-cloud-upload",
                    question: "",
                    questionComment: "Il s'agit d'un investissement sur le long terme, sans aucun objectif spécifique",
                },
                {
                    code: "retirement",
                    label: "Retraîte",
                    tooltip: "Je souhaite préparer ma retraîte",
                    icon: "icon-wallet",
                    question: "Dans combien d'années prévoyez-vous de partir en retraite ?",
                    questionComment: ""
                },
                {
                    code: "home",
                    label: "Maison",
                    tooltip: "Je souhaite économiser pour une maison ou un appartement",
                    icon: "icon-home",
                    question: "Dans combien d'années aurez-vous besoin de l'argent ?",
                    questionComment: ""
                },
                {
                    code: "child",
                    label: "Enfants",
                    tooltip: "Je souhaite mettre de l'argent de côté pour mes enfants",
                    icon: "icon-graduation",
                    question: "Dans combien d'années aurez-vous besoin de l'argent ?",
                    questionComment: ""
                },
                {
                    code: "rainy-day",
                    label: "Coups durs",
                    tooltip: "Je souhaite mettre de l'argent de côté pour des situations inattendues",
                    icon: "icon-umbrella",
                    question: "Dans combien d'années aurez-vous besoin de l'argent ?",
                    questionComment: ""
                },
                {
                    code: "big-spend",
                    label: "Grandes occasions",
                    tooltip: "Je souhaite économiser pour les grandes occasions (mariage, voiture, vacances, etc.)",
                    icon: "icon-plane",
                    question: "Dans combien d'années aurez-vous besoin de l'argent ?",
                    questionComment: ""
                },
                {
                    code: "other",
                    label: "Autre",
                    tooltip: "Je souhaite économiser pour toutes autres raisons",
                    icon: "icon-handbag",
                    question: "Dans combien d'années aurez-vous besoin de l'argent ?",
                    questionComment: ""
                },
            ]
          , risks = [
                {
                    level: "low",
                    label: 'Risque Faible',
                    tooltip: "Je ne veux pas prendre de risque sur mon capital investi"
                },
                {
                    level: "medium",
                    label: 'Risque Moyen',
                    tooltip: "J'accepte de prendre des risques modérés sur tout ou partie de mon capital investi"
                },
                {
                    level: "high",
                    label: 'Risque Elevé',
                    tooltip: "J'accepte de prendre des risques significatifs sur tout ou partie de mon capital investi"
                }
            ]
          , structure = {
            "fields": {
                "id": "integer",
                "name": "string",
                "goal": "string",
                "when": "integer",
                "amountMonthly": "float",
                "risk": "string"
            },
            "accepts": {
                "goal": ["just-invest", "retirement", "home", "child", "rainy-day", "big-spend", "other"],
                "risk": ["low", "medium", "high"]
            },
            "requirements": {
                "just-invest": {
                    "retirement": ["amountMonthly", "risk"]
                },
                "goal": {
                    "retirement": ["when", "amountMonthly", "risk"]
                },
                "home": {
                    "retirement": ["when", "amountMonthly", "risk"]
                },
                "child": {
                    "retirement": ["when", "amountMonthly", "risk"]
                },
                "rainy-day": {
                    "retirement": ["amountMonthly", "risk"]
                },
                "big-spend": {
                    "retirement": ["when", "amountMonthly", "risk"]
                },
                "other": {
                    "retirement": ["when", "amountMonthly", "risk"]
                }
            }
        };

        function loadModel(goal, amountMonthly, riskLevel, cb) {
            var key = goal + amountMonthly + riskLevel;

            if (models[key]) {
                return cb(false, models[key]);
            }

            $http.get(WS_URL + '/portfolio/model/' + riskLevel)
                .success(function (model, status, headers, config) {
                    models[key] = model;
                    cb(false, model);
                })
                .error(function(data, status, headers, config) {
                    var err = new Error("Failed to get model of the risk " + riskLevel);

                    err.status = status;
                    err.headers = headers;

                    cb(err, null);

                    console.error(err.message);
                });
        }

        return {
            /**
             * Get a portfolio model
             * @param goal A portfolio goal
             * @param amountMonthly A amount monthly
             * @param riskLevel A portfolio risk level
             * @param cb A callback function
             */
            model: function(goal, amountMonthly, riskLevel, cb) {
                if (typeof cb != 'function') {
                    throw new Error('cb must be a callback function!');
                }

                if (goals.length == 0) {
                    if (goal in structure.accepts.goal) {
                        loadModel(goal, amountMonthly, riskLevel, cb);
                    } else {
                        cb(new Error('Unknow goal ' + goal), null);
                    }
                } else {
                    loadModel(goal, amountMonthly, riskLevel, cb);
                }
            },

            /**
             * A portfolio prototype
             */
            prototype: {
                goal: function(goal) {
                    for (var i = 0; i < goals.length; i++) {
                        if (goal == goals[i].code) {
                            return goals[i];
                        }
                    }
                    throw new Error("Unknow goal " + goal);
                },

                risk: function(level) {
                    for (var i = 0; i < risks.length; i++) {
                        if (level == risks[i].level) {
                            return risks[i];
                        }
                    }
                    throw new Error("Unknow level risk " + level);
                },

                goals: function() {
                    return goals;
                },

                risks: function() {
                    return risks;
                }
            },
        };
    });