angular.module('DirectETF')
    .controller('QuestionnaireController', function($ocLazyLoad, $scope, $http, $element, $attrs) {
        if ($attrs.json) {
            $ocLazyLoad.load({
                insertBefore: '#ng_load_plugins_before',
                files: [
                    '/protected/component/Questionnaire/style.css',
                ]
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
                    exists: function(id) {
                        for (var i = 0; i < this.entries.length; i++) {
                            if (this.entries[i][1].id == id) {
                                return true;
                            }
                        }

                        return $scope.$strategy.keywords.exists(id);
                    },
                    remove: function(index) {
                        var rest = this.entries.slice((this.entries.length || index) + 1 || this.entries.length);
                        this.entries.length = index < 0 ? this.entries.length + index : index;
                        this.entries.push.apply(this.entries, rest);

                        this.query()
                        console.log('questionnaire.current.node = ', $scope.questionnaire.current.node)
                    },
                    query: function() {
                        $scope.$strategy.keywords.clear();

                        for(var i in this.entries) {
                            if (this.entries[i][1].strategy) {
                                for (var keyword in this.entries[i][1].strategy) {
                                    var weight = this.entries[i][1].strategy[keyword];

                                    $scope.$strategy.keywords.add(keyword, weight, this.entries[i][0].operator);
                                }
                            }
                        }
                    },
                    sync: function() {
                        for (var i in $scope.questionnaire.nodes) {
                            var node = $scope.questionnaire.nodes[i];

                            if (node.children) {
                                for (var j in node.children) {
                                    var child = node.children[j];

                                    if ($scope.$strategy.keywords.exists(child.id)) {
                                        this.add(node, child);
                                    }
                                }
                            }
                        }
                    }
                },
                children: function(id) {
                    this.current.node = this.node(id);
                }
            };

            $http.get($attrs.json)
                .then(function(questionnaireFile) {
                    // Expose the questionnaire node
                    $scope.questionnaire.nodes = questionnaireFile.data.nodes;

                    // Sync the questionnaire history with the linked portfolio's strategy
                    $scope.questionnaire.history.sync();

                    // Select the first node as a root entry
                    var node = $scope.questionnaire.nodes[0];
                    var child = node.children[0];

                    setTimeout(function() {
                        $scope.questionnaire.children(child.goto);
                    }, 5);
                });
        }
    })
    .controller('NodeController', function($scope, $element, $attrs) {
        if ($attrs.id) {
            console.log($attrs.id)
            $scope.node = $scope.questionnaire.node($attrs.id);
        }
    })
    .controller('StrategyKeywordsController', function($ocLazyLoad, $PortfolioFactory, $scope, $compile, $element, $attrs) {
        $ocLazyLoad.load({
            insertBefore: '#ng_load_plugins_before',
            files: [
                '/protected/component/Questionnaire/style.css',
            ]
        });

        $scope.remove = function(id) {
            $scope.$strategy.keywords.remove(id);
        };

        $scope.$watch(function() {
            return $scope.$strategy && $scope.$strategy.keywords && $scope.$strategy.keywords.length();
        }, function() {
            if (!$scope.$strategy || !$scope.$strategy.get) {
                return;
            }

            $attrs.action = $attrs.action || false;

            var keywords = $scope.$strategy.get();
            var keywords_sentence = [];

            for (var id in keywords) {
                var keyword = $PortfolioFactory.Keywords.get(id);

                if (keyword === null) {
                    console.log('Unregistred key %s', id);
                    continue;
                }

                if ($attrs.action) {
                    keywords_sentence.push('<span class="questionnaire-sentence-keyword">' + keyword.name
                                            + '<a ng-click="remove(\'' + id + '\')"></a></span>');
                } else {
                    keywords_sentence.push('<span class="questionnaire-sentence-keyword">' + keyword.name
                                            + '</span>');
                }
            }

            $element.find('.questionnaire-sentence-keywords').html($compile(keywords_sentence.join(''))($scope));
            $scope.hasKeywords = keywords_sentence.length > 0;
        });
    })
    .directive('questionnaire', function() {
        return {
            controller: "QuestionnaireController",
            restrict: 'E',
            scope: {
                $strategy: '=strategy'
            },
            templateUrl: "/protected/component/Questionnaire/main.html"
        };
    })
    .directive('strategyKeywords', function() {
        return {
            controller: "StrategyKeywordsController",
            restrict: 'E',
            scope: {
                $strategy: '=strategy'
            },
            template: '<div ng-show="hasKeywords"><span class="questionnaire-sentence-keywords"></span></div>'
        };
    })
    .directive('node', function() {
        return {
            controller: "NodeController",
            templateUrl: "/protected/component/Questionnaire/node.html",
            restrict: 'E',
        };
    })