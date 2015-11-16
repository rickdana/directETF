angular.module('MetronicApp')
    .factory('$EtfsFactory', ['$http', function($http) {
        var etfs = [];
        var queries = {};
    
        function load(etfs_list, cb) {
            if (typeof cb == 'function') {
                var etfs = [];
            }

            for (var i = 0; i < etfs_list.length; i++) {
                $http.get(WS_URL + '/etf/desc/' + etfs_list[i])
                    .success(function (desc, status, headers, config) {
                        var countries = []
                          , sectors = [];
    
                        for (var i = 0; i < desc.countries.length; i++) {
                            for (var country in desc.countries[i]) {
                                countries.push(country);
                            }
                        }
    
                        for (var i = 0; i < desc.sectors.length; i++) {
                            for (var sector in desc.sectors[i]) {
                                sectors.push(sector);
                            }
                        }
    
                        desc.countriesStr = countries.join(', ');
                        desc.sectorsStr = sectors.join(', ');
                        
                        $http.get(WS_URL + '/etf/price/' + desc.isin)
                            .success(function (__data) {
                                var price = 0;
    
                                for (var __p in __data) {
                                    price = __data[__p] || 0;
                                }
    
                                desc.price = price;
                                etfs.push(desc);
    
                                if (etfs.length == etfs_list.length) {
                                    // end of list
                                    if (typeof cb == 'function') {
                                        cb(etfs);
                                    }
                                }
                            })
                            .error(function(data, status, headers, config) {
                                desc.price = '0';
                                etfs.push(desc);
    
                                if (etfs.length == etfs_list.length) {
                                    // end of list
                                    if (typeof cb == 'function') {
                                        cb(etfs);
                                    }
                                }
    
                                console.error("Failed to get price of ETF %s", desc.isin);
                            });
                    })
                    .error(function(data, status, headers, config) {
                        console.error("Failed to get description of ETF %s", etfs_list[i]);
                    });
            }
        }

        function parseFilters(filters) {
            var _filters = [];

            if (typeof filters == 'string') {
                filters = filters.trim();

                if (filters.length > 0) {
                    try {
                        // try if is a JSON
                        _filters = JSON.parse(filters);
                    } catch (e) {
                        // a string
                        _filters = filters.split(',');
                    }

                    if (_filters instanceof Array && _filters.length > 0) {
                        for (var i = 0; i < _filters.length; i++) {
                            _filters[i] = _filters[i].trim();
                        }
                    }
                }
            }

            return _filters;
        };

        return {
            load: function(filters, cb) {
                filters = parseFilters(filters);

                var query = JSON.stringify(filters);

                if (queries[query] instanceof Array) {
//                    console.log('   return the cache results')
//                    return cb(queries[query]);
                }

                if (filters instanceof Array && filters.length > 0) {
                    load(filters, function(etfs) {
                        queries[query] = etfs;
                        cb(etfs);
                    });
                } else if (typeof filters == 'object' && !(filters instanceof Array)) {
                    var filters_array = [];

                    for (var isin in filters) {
                        filters_array.push(isin);
                    }

                    // delta parsing
                    load(filters_array, function(etfs) {
                        for (var i = 0; i < etfs.length; i++) {
                            var delta = etfs[i].quantity - filters[etfs[i].isin];

                            for (var j = 0; j < etfs[i].countries.length; j++) {
                                for (var country in etfs[i].countries[j]) {
                                    etfs[i].countries[j][country] = Math.abs(etfs[i].countries[j][country] - delta);
                                }
                            }

                            for (var j = 0; j < etfs[i].sectors.length; j++) {
                                for (var sector in etfs[i].sectors[j]) {
                                    etfs[i].sectors[j][sector] = Math.abs(etfs[i].sectors[j][sector] - delta);
                                }
                            }

                            etfs[i].quantity = filters[etfs[i].isin];
                        }

                        queries[query] = etfs;

                        cb(etfs);
                    });
                } else {
                    $http.get(WS_URL + '/etf/list')
                        .success(function(data) {
                            load(data, function(etfs) {
                                queries[query] = etfs;
                                cb(etfs);
                            });
                        })
                        .error(function(data, status, headers, config) {
                            console.error("Failed to get the list of ETFs");
                        });
                }
            }
        };
    }]);