angular.module('MetronicApp')
    .factory('$EtfsFactory', function($http) {
        var etfs = [];
        var queries = {};
    
        function load(etfs_list, cb, getPrice) {
            getPrice = typeof getPrice == 'undefined' ? true : getPrice;

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

                        if (!getPrice) {
                            etfs.push(desc);

                            if (etfs.length == etfs_list.length) {
                                // end of list
                                if (typeof cb == 'function') {
                                    cb(etfs);
                                }
                            }
                            return;
                        }

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
            if (typeof filters == 'string') {
                var _filters = [];

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
                        if (typeof _filters[0] == 'string') {
                            for (var i = 0; i < _filters.length; i++) {
                                _filters[i] = _filters[i].trim();
                            }
                        }
                    }
                }

                return _filters;
            } else {
                return filters;
            }
        };

        function is_valid_isin(isin) {
            return isin[0].match(/[A-Z]/) instanceof Array;
        }

        return {
            load: function(filters, cb, getPrice) {
                filters = parseFilters(filters);

                var query = JSON.stringify(filters);

                if (queries[query] instanceof Array) {
//                    console.log('   return the cache results')
//                    return cb(queries[query]);
                }

                if (filters instanceof Array && filters.length > 0) {
                    if (typeof filters[0].isin == 'string') {
                        var filters_array = [];

                        for (var i = 0; i < filters.length; i++) {
                            filters_array.push(filters[i].isin);
                        }

                        if (typeof filters[0].price != undefined) {
                            getPrice = false;
                        }

                        if (typeof filters[0].quantity == undefined) {
                            load(filters, function(etfs) {
                                // Price
                                if (getPrice === false) {
                                    for (var i = 0; i < filters.length; i++) {
                                        for (var j = 0; j < etfs.length; j++) {
                                            if (filters[i].isin == etfs[j].isin) {
                                                etfs[j].price = filters[i].price;
                                                break;
                                            }
                                        }
                                    }
                                }

                                queries[query] = etfs;
                                cb(etfs);
                            }, getPrice);
                        } else {
                            // delta parsing
                            load(filters_array, function(etfs) {
                                // Quantity
                                for (var i = 0; i < filters.length; i++) {
                                    for (var j = 0; j < etfs.length; j++) {
                                        if (filters[i].isin == etfs[j].isin) {
                                            etfs[j].quantity = filters[i].quantity;
                                            break;
                                        }
                                    }
                                }

                                // Price
                                if (getPrice === false) {
                                    for (var i = 0; i < filters.length; i++) {
                                        for (var j = 0; j < etfs.length; j++) {
                                            if (filters[i].isin == etfs[j].isin) {
                                                etfs[j].price = filters[i].price;
                                                break;
                                            }
                                        }
                                    }
                                }

                                queries[query] = etfs;
                                cb(etfs);
                            }, getPrice);
                        }
                    } else if (is_valid_isin(filters[0])) {
                        // filters = [isin_1, isin_2, ..., isin_n]
                        load(filters, cb, getPrice);
                    }

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
                    }, getPrice);
                } else {
                    $http.get(WS_URL + '/etf/list')
                        .success(function(data) {
                            load(data, function(etfs) {
                                queries[query] = etfs;
                                cb(etfs);
                            }, getPrice);
                        })
                        .error(function(data, status, headers, config) {
                            console.error("Failed to get the list of ETFs");
                        });
                }
            }
        };
    });