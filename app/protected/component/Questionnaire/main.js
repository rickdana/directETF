angular.module('MetronicApp')
    .controller('QuestionnaireController', function($ocLazyLoad, $scope, $http, $element, $attrs, $q, $compile, $templateCache) {
        if ($attrs.json) {
            $ocLazyLoad.load({
                insertBefore: '#ng_load_plugins_before',
                files: [
                    '/protected/component/Questionnaire/style.css',
                ]
            });

            var templateUrl = '/protected/component/Questionnaire/node.html';

            $q.all([
                $http.get(templateUrl, { cache : $templateCache })
            ]).then(function(resp) {
                $scope.templateNode = resp;
            });

            $scope.questionnaire = {
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
                        if (child.strategy) {
                            var exists = false;

                            for (var i = 0; i < this.entries.length; i++) {
                                if (this.entries[i][1].id == child.id) {
                                    exists = true;
                                    this.entries = this.entries.slice(0, i).concat(this.entries.slice(i + 1));
                                    break;
                                }
                            }

                            if (!exists) {
                                this.entries.push([node, child]);
                            }
                        }
                    },
                    exists: function(child) {
                        for (var i = 0; i < this.entries.length; i++) {
                            if (this.entries[i][1].id == child.id) {
                                return true;
                            }
                        }
                        return false;
                    },
                    remove: function(index) {
                        var rest = this.entries.slice((this.entries.length || index) + 1 || this.entries.length);
                        this.entries.length = index < 0 ? this.entries.length + index : index;
                        this.entries.push.apply(this.entries, rest);

                        this.query()
                        console.log('questionnaire.current.node = ', $scope.questionnaire.current.node)
                    },
                    query: function() {
                        $scope.$strategy.keyword.clear();

                        for(var i in this.entries) {
                            if (this.entries[i][1].strategy) {
                                for (var keyword in this.entries[i][1].strategy) {
                                    var weight = this.entries[i][1].strategy[keyword];

                                    $scope.$strategy.keyword.add(keyword, weight, this.entries[i][0].operator);
                                }
                            }
                        }
                    }
                },
                children: function(id) {
                    $scope.node = $scope.questionnaire.node(id);
                    $element.find('.filter-items.children').html($compile($templateCache.get(templateUrl)[1])($scope));
                }
            };

            $http.get($attrs.json)
                .then(function(questionnaireFile) {
                    $scope.questionnaire.nodes = questionnaireFile.data.nodes;

                    var node = $scope.questionnaire.nodes[0];
                    var child = node.children[0];

                    setTimeout(function() {
                        $scope.questionnaire.current.node = child.goto;
                        $scope.questionnaire.children(child.goto);
                    }, 5);
                });
        }
    })
    .controller('RootController', function($scope, $http, $element, $attrs) {
        if ($attrs.id) {
            $scope.$watch(function() {
                return $scope.questionnaire;
            }, function(questionnaire) {
                $scope.node = questionnaire.node($attrs.id);
            });
        }
    })
    .directive('questionnaire', function() {
        return {
            controller: "QuestionnaireController",
            restrict: 'E',
            scope: {
                $strategy: '=strategy'
            },
            templateUrl: "/protected/component/Questionnaire/template.html"
        };
    })
    .directive('root', function() {
        return {
            controller: "RootController",
            templateUrl: "/protected/component/Questionnaire/root.html"
        };
    })