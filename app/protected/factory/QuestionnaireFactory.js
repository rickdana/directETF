angular.module('MetronicApp')
    .factory('$QuestionnaireFactory', function($http) {
        return {
            get: function (type, cb) {
                $http.get(WS_URL + '/questionnaire/' + type)
                    .success(function (questionnaire, status, headers, config) {
                        cb(false, questionnaire);
                    })
                    .error(function(data, status, headers, config) {
                        var err = new Error("Failed to get questionnaire");
                        cb(err, portfolio);
                    });
            },

            answers: function (type, answers, cb) {
                $http.post(WS_URL + '/questionnaire/' + type, {answers: answers})
                    .success(function (portfolio, status, headers, config) {
                        cb(false, null);
                    })
                    .error(function(data, status, headers, config) {
                        var err = new Error("Failed to get portfolio result");
                        cb(err, null);
                    });
            },

        };
    });