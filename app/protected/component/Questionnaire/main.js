angular.module('MetronicApp')
    .controller('QuestionnaireController', function($ocLazyLoad, $rootScope, $scope, $http, $element, $attrs, $compile) {
        if ($attrs.json) {
            $ocLazyLoad.load({
                insertBefore: '#ng_load_plugins_before',
                files: [
                    '/protected/component/Questionnaire/style.css',
                ]
            });

            $rootScope.questionnaire = {
                current: {
                    node: null,
                    child: null
                },
                node: function(id) {
                    for (var i in this.nodes) {
                        if (this.nodes[i].id == id) {
                            return this.nodes[i];
                        }
                    }
                    return null;
                },
                history: {
                    entries: [],
                    add: function(node, child) {
                        if (child.resume) {
                            this.entries.push([node, child]);
                        }
                    },
                    remove: function(index) {
                        var rest = this.entries.slice((this.entries.length || index) + 1 || this.entries.length);
                        this.entries.length = index < 0 ? this.entries.length + index : index;
                        this.entries.push.apply(this.entries, rest);

                        this.query()
                        console.log('questionnaire.current.node = ', $scope.questionnaire.current.node)
                    },
                    query: function() {
                        var query = [];

                        for(var i in this.entries) {
                            query.push(this.entries[i][1].id);
                        }

                        console.log(query.join('-'));
                        // TODO Add the filter code here
                    },
                    goto: function(id) {
                        $scope.node = $rootScope.questionnaire.node(id);
                        $element.find('.filter-items').html($compile('<node data-id="' + id + '"></node>')($scope));
                    }
                },
            }

            $http.get($attrs.json)
                .then(function(questionnaireFile) {
                    $rootScope.questionnaire.nodes = questionnaireFile.data.nodes;
                });
        }
    })
    .controller('NodeController', function($rootScope, $scope, $http, $element, $attrs, $q, $compile, $templateCache) {
        if ($attrs.id) {
            $scope.$watch(function() {
                return $rootScope.questionnaire;
            },function() {
                $scope.node = $rootScope.questionnaire.node($attrs.id);
            })

            var templateUrl = '/protected/component/Questionnaire/node.html';

            $q.all([
                $http.get(templateUrl, { cache : $templateCache })
            ]).then(function(resp) {
                $rootScope.templateNode = resp;
            });

            $scope.goto = function(id) {
                $scope.node = $rootScope.questionnaire.node(id);
                $element.after($compile($templateCache.get(templateUrl)[1])($scope));
            };
        }
    })
    .directive('questionnaire', function() {
        return {
            controller: "QuestionnaireController",
            templateUrl: "/protected/component/Questionnaire/template.html"
        };
    })
    .directive('node', function() {
        return {
            controller: "NodeController",
            templateUrl: "/protected/component/Questionnaire/node.html"
        };
    });