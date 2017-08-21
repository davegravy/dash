angular.module('armsApp').factory('monitorManager', ['$q', '$http', 'cognito',

    function($q, $http, cognito) {

        let _sites = {};

        return {

            syncSites: function(){
                let token = cognito.getToken('id');
                //let deferred = $q.defer();

                let formData ="jwt_token=" + token;

                /*let formData = {};
                 formData.jwt_token = identity.token;
                 if (use !== undefined) {formData.use = use;}
                 if (scope !== undefined) {formData.scope = scope;}
                 console.log(JSON.stringify(formData));*/

                return $http({
                    method: 'POST',
                    url: 'https://10.0.1.26/proxy/getSites',
                    data: formData,
                    timeout: 5000,
                    responseType: 'text',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                    .then(function(response){

                        //console.log(data);
                        _sites = response.data;
                        return $q.when(response.data);

                    })
                    .catch(function(error){

                        console.log("syncSites error");
                        console.log("syncSites call failed: " + error.data);
                        return $q.reject(error.status);
                    });



            },

            getSites: function () {
                if (_sites.length > 0) {
                    return $q.when(_sites);
                }
                else {
                    return this.syncSites().then(function(data){
                        return $q.when(data);
                    })
                }

            },

            formatSites: function (sites) {
                let result = [];

                for (var key in sites) {
                    if (sites.hasOwnProperty(key)) {
                        let monitor_type = sites[key]["monitor_type"];
                        let status = sites[key]["status"];


                        if (((monitor_type == "nvm") || (monitor_type == "tvm")))  { //filter out instantel and inactive monitors
                            result.push({"site":key, "device_id":sites[key]["device_id"], "monitor_type":monitor_type, "status":status});
                        }
                    }
                }

                return result;
            },

            getMonitorList: function () {
                return this.getSites().then( (sites)=> {
                    let monitorList = this.formatSites(sites);
                    return $q.when(monitorList);
                })
            },

            getMonitor: function(site=undefined, device_id=undefined){

                if ((site == undefined) && (device_id == undefined)) {
                    return $q.reject("either site or device_id must be supplied");
                }
                if ((site != undefined) && (device_id != undefined)) {
                    return $q.reject("only one of site or device_id must be supplied");
                }
                return this.getMonitorList().then((monitorList)=>{

                    for (var i = 0; i < monitorList.length; i++) {
                        if (site != undefined) {
                            if (monitorList[i]["site"] == site) {
                                return $q.when(monitorList[i])
                            }
                        }
                        else {
                            if (monitorList[i]["device_id"] == device_id) {
                                return $q.when(monitorList[i])
                            }
                        }
                    }
                    return $q.when(null);
                })

            }
        }


    } ]);