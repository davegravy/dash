angular.module('armsApp').factory('monitorManager', ['$q', '$http',
    function($q, $http) {
        let _sites = {};
        return {
            fetchSites: function(){
                let deferred = $q.defer();

                let formData ="jwt_token=" + identity.token;
                console.log("formData:" + formData);
                if (use !== undefined) {formData += "&use=" + use;}
                if (scope !== undefined) {formData += "&scope=" + scope;}

                /*let formData = {};
                 formData.jwt_token = identity.token;
                 if (use !== undefined) {formData.use = use;}
                 if (scope !== undefined) {formData.scope = scope;}
                 console.log(JSON.stringify(formData));*/

                $http({
                    method: 'POST',
                    url: 'https://10.0.1.26/proxy/getSites',
                    data: formData,
                    timeout: 5000,
                    responseType: 'text',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                    .success(function(data){


                        deferred.resolve(identity); //TODO: sync change to cache
                    })
                    .error(function(){


                        deferred.reject(identity);
                    });

                return deferred.promise;
            },
            getDeviceList: function () {

            }



        }


    } ]);