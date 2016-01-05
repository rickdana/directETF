angular.module('MetronicApp')
    .controller('QuestionnaireController', function($ocLazyLoad, $scope, $http, $attrs) {
        if ($attrs.json) {
            $ocLazyLoad.load({
                insertBefore: '#ng_load_plugins_before',
                files: [
                    '/protected/component/Questionnaire/style.css',
                ]
            });

            $http.get($attrs.json)
                .then(function(questionnaireFile) {
                    $scope.filters = {
                        current: {
                            category: questionnaireFile.data.start,
                            value: '',
                            question: '',
                            answer: '',
                        },
                        history: {
                            entries: [],
                            remove: function(array, from, to) {
                                var rest = array.slice((to || from) + 1 || array.length);
                                array.length = from < 0 ? array.length + from : from;
                                array.push.apply(array, rest)
                                return array.push.apply(array, rest);
                            }
                        },
                        exec: function(history, q, a) {
                            if (a.goto != questionnaireFile.data.end) {
                                return;
                            }

                            var query = [];

                            for(var i in history) {
                                query.push(history[i][1].id);
                            }

                            console.log(query.join('-'));
                        },
                        entries: questionnaireFile.data.questionnaire
                    };
                });
        }
    })
    .directive('questionnaire', function() {
        return {
            controller: "QuestionnaireController",
            templateUrl: "/protected/component/Questionnaire/template.html"
        };
    });