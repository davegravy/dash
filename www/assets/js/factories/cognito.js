angular.module('armsApp').factory('cognito', ['$q', '$http',
    function($q, $http) {

        let _poolData = {
            UserPoolId : 'us-east-1_C17D4qjgy', // Your user pool id here
            ClientId : '493284o06dmr8c62cms5l9um21' // Your client id here
        };

        let _userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(_poolData);
        let _testVar = {};
        let _cognitoUser;
        let _cognitoUserSession;
        let _decodedIdToken;



        return{


            getUserLocal: function () {



                if (!_cognitoUser)
                    _cognitoUser = _userPool.getCurrentUser();

                if (_cognitoUser)
                    return _cognitoUser;
                else
                    return null;
            },

            getSession: function () {
                console.log("getSession");
                let deferred = $q.defer();

                if (!this.getUserLocal()) {
                    deferred.resolve(null);
                    console.log("getSession: no cached cognitoUser");
                    return deferred.promise;
                }
                if (!_cognitoUserSession || !_cognitoUserSession.isValid()) {

                    if (!_cognitoUserSession) {console.log("getSession: no cognitoUserSession");}
                    else if (!_cognitoUserSession.isValid()) {console.log("getSession: no cognitoUserSession");}

                    _cognitoUser.getSession(function(err,session) {

                        if (err) {
                            console.log("getSession Error:" + err);
                            return deferred.reject(err);
                        } else {
                            console.log("getSession: cognitoUserSession fetched from cognito");
                            _cognitoUserSession = session;
                            deferred.resolve(_cognitoUserSession);
                        }
                    });
                    return deferred.promise;
                }

                if (_cognitoUserSession && _cognitoUserSession.isValid()) {
                    console.log("getSession: valid cognitoUserSession retrieved");
                    deferred.resolve(_cognitoUserSession);
                }
                else
                    console.log("getSession: could not get valid cognitoUserSession");
                    deferred.resolve(null);

                return deferred.promise;
            },


            isSessValid: function () {
                if (!_cognitoUserSession)
                    return false;
                else
                    return _cognitoUserSession.isValid();
            },


            getToken: function (use) {
                //console.log("getToken");
                if (!_cognitoUserSession || !use)
                    return null;
                else {
                    if (use === "id")
                        return _cognitoUserSession.getIdToken().getJwtToken();

                    if (use === 'access')
                        return _cognitoUserSession.getAccessToken().getJwtToken();

                    return null;
                }

            },

            getDecodedToken: function(use) {
                //send jwt to backend, receive decoded token (or forbidden)
                //TODO separate into own service


                //console.log("getDecodedToken");

                if (_decodedIdToken) { //use RAM cache if we have it
                    //console.log("found decoded token in memory");
                    return $q.when(_decodedIdToken);

                }

                let token = this.getToken(use);


                if (!token) {
                    console.log("getDecodedToken Error");
                    return $q.reject('no jwt token');
                } else {


                    let formData = "jwt_token=" + token;
                    //console.log("formData:" + formData);
                    if (use !== undefined) {
                        formData += "&use=" + use;
                    }
                    //if (scope !== undefined) {formData += "&scope=" + scope;}

                    /*let formData = {};
                     formData.jwt_token = identity.token;
                     if (use !== undefined) {formData.use = use;}
                     if (scope !== undefined) {formData.scope = scope;}
                     console.log(JSON.stringify(formData));*/

                    return $http({
                        method: 'POST',
                        url: 'https://' + location.host + '/proxy/verifyToken',
                        data: formData,
                        timeout: 5000,
                        responseType: 'text',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    })
                        .then(function (response) {

                            //  identity.lastVerifiedTime = (new Date()).getTime(); //TODO: Move all lastverified time manip here or principal
                            //console.log("DECODED TOKEN: " + JSON.stringify(response.data)); //TODO: backend still returns success even with bad POST called
                            //identity.decoded=data;
                            console.log("SUCCESSFULLY VERIFIED ID");
                            _decodedIdToken = response.data;
                            return $q.when(response.data);

                        })
                        .catch(function (error) {
                            console.log('INVALID TOKEN');
                            console.log('Error getting decoded token: ' + error.data);
                            console.log('Error status code: ' + error.status);
                            //TODO: notify view about why
                            return $q.reject(error.status);
                        });
                }


            },



            getRoles: function () {
                //get decoded ID token, return
                //console.log("getRoles");


                return this.getDecodedToken('id')
                    .then(
                        function(data){
                            //console.log("received decoded token: " + JSON.stringify(data));
                            return $q.when(data['cognito:roles']);
                        })
                    .catch(
                        function(error){
                            console.log("getRoles Error: " + error);
                            return $q.when(null);
                        }
                    );

            },

            isInRole: function(rolesRequired){

                return this.getRoles().then(
                    function(rolesAssigned){
                        if (!rolesAssigned)
                            return $q.when(false);
                        else
                            return $q.when(rolesAssigned.indexOf(rolesRequired) !== -1);
                    }).catch(
                    function(error){
                        console.log("No roles available");
                        return $q.reject(error);
                    });

            },

            isInAnyRole: function(rolesRequired){
                //console.log ("isInAnyRole:" + JSON.stringify(rolesRequired));

                return this.getRoles().then(
                    (rolesAssigned) => { //don't actually need rolesAssigned

                        if (!rolesAssigned && rolesRequired.length > 0){
                            return $q.when(false);
                        }

                        //console.log ("successfully retrieved roles");
                        let promises =[];

                        for (let i = 0; i < rolesRequired.length; i++) {
                            promises.push(this.isInRole(rolesRequired[i]));
                        }

                        return $q.all(promises)
                            .then(
                                (values)=>{
                                    for (let i = 0; i < promises.length; i++) {
                                        if (values[i]) {
                                            //console.log("found match");
                                            return $q.when(true);
                                        }
                                    }
                                    console.log("found no matches");
                                    return $q.when(false);
                                })
                            .catch(
                                (errors)=>{
                                    //console.log("isInAnyRole: isInRole callback");
                                    console.log(JSON.stringify(errors));
                                    return $q.reject(errors);
                                });

                    }).catch(
                    function(err){
                        console.log("getRoles Error2");
                        return $q.reject(err);
                    });


            },


            signOut: function () {
                if (this.getUserLocal()) {
                    _cognitoUser.signOut();
                    //console.log("signOut: cognito sdk .signOut()");
                }

                //console.log("signOut: clearing ram cache");
                _cognitoUserSession = null;
                _decodedIdToken = null;


                if (_cognitoUserSession) {
                    alert("sign-out FAILED");
                }

                /*                this.getSession().then(function(session){
                 if (session)
                 console.log("signout failed, session still available");
                 }) */

            },

            signIn: function (login, password) {


                let deferred = $q.defer();

                // check already signed in, else:

                let userData = {
                    Username: login,
                    Pool: _userPool
                };

                let authenticationData = {
                    Username: login,
                    Password: password
                };

                let authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

                _cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
                _cognitoUser.authenticateUser(authenticationDetails,
                    {
                        onSuccess: function(result) {



                            /*                           _cognitoUser.getUserAttributes(function(err,result){
                             for (i = 0; i < result.length; i++) {
                             console.log(JSON.stringify(result));
                             }
                             });*/

                            //console.log(_cognitoUser.getUsername());
                            _cognitoUserSession = result;

                            deferred.resolve(result);},


                        onFailure: function(error) {
                            alert(error);
                            deferred.reject(error);},

                        newPasswordRequired: function(userAttributes, requiredAttributes) {
                            // User was signed up by an admin and must provide new
                            // password and required attributes, if any, to complete
                            // authentication.

                            // the api doesn't accept this field back
                            delete userAttributes.email_verified;

                            // Get these details and call
                            let newPassword = "vI0letrose3";
                            _cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
                        }

                    });
                return deferred.promise;
            },

            getUsername: function (){
                return _cognitoUser.getUsername()
            },

            enableTrackDevice: function () {

                //console.log('enableTrackDevice');
                if (_cognitoUser) {
                    _cognitoUser.setDeviceStatusRemembered({
                        onSuccess: function (result) {
                            //console.log('call result: ' + result);
                        },

                        onFailure: function (err) {
                            alert(err);
                        }
                    });
                }
            },

            disableTrackDevice: function () {

                //console.log('disableTrackDevice');

                if (_cognitoUser) {
                    _cognitoUser.setDeviceStatusNotRemembered({
                        onSuccess: function (result) {
                            //console.log('call result: ' + result);
                        },

                        onFailure: function(err) {
                            alert(err);
                        }
                    });
                }
            }





        }}]);