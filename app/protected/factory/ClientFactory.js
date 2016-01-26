angular.module('DirectETF')
    .factory('$ClientFactory', function($http, $PortfolioFactory) {
        var cache = {};

        return {
            current: function(done) {
                this.load(CLIENT_ID, done);
            },
            load: function(id, done) {
                if (cache[id]) {
                    return done(false, cache[id]);
                }

                // Load the client's profile
                $http.get(WS_URL + '/client/desc/' + id)
                    .success(function(profile) {
                        cache[id] = {
                            id: id,
                            alreadyInvest: profile.firstName.length > 0, // just for demo
                            profile: profile
                        };
                        cache[id].profile.firstName = profile.firstName || CLIENT_FIRST_NAME; // just for demo

                        // Load the client's portfolio
                        cache[id].portfolio = new $PortfolioFactory.Portfolio(id, false, function() {
                            if (!cache[id].alreadyInvest) {
                                cache[id].portfolio.value = 0;
                            }
                        });

                        // Callback
                        done(false, cache[id]);
                    })
                    .error(function(data, status, headers, config) {
                        var err = new Error("Failed to load profile of ClientID " + client.id);

                        err.status = status;
                        err.headers = headers;

                        cb(err, null);

                        console.error(err.message);
                    });
            }
        };
    });