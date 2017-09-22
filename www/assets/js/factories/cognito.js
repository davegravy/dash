/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint max-len: ["error", 100] */
/* global angular AWS AWSCognito location alert */

angular.module('armsApp').factory('cognito', ['$q', '$http',
  function ($q, $http) {
    const poolData = {
      UserPoolId: 'us-east-1_C17D4qjgy', // Your user pool id here
      ClientId: '493284o06dmr8c62cms5l9um21', // Your client id here
    };

    const userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    // const testVar = {};
    let cognitoUser;
    let cognitoUserSession;
    let decodedIdToken;


    return {


      getUserLocal() {
        if (!cognitoUser) { cognitoUser = userPool.getCurrentUser(); }

        if (cognitoUser) { return cognitoUser; }
        return null;
      },

      getSession() {
        console.log('getSession');
        const deferred = $q.defer();

        if (!this.getUserLocal()) {
          deferred.resolve(null);
          console.log('getSession: no cached cognitoUser');
          return deferred.promise;
        }
        // this code path executed on browser refresh
        if (!cognitoUserSession || !cognitoUserSession.isValid()) {
          if (!cognitoUserSession) {
            console.log('getSession: no cognitoUserSession');
          } else if (!cognitoUserSession.isValid()) {
            console.log('getSession: no valid cognitoUserSession');
          }

          cognitoUser.getSession((err, session) => {
            if (err) {
              console.log(`getSession Error:${err}`);
              return deferred.reject(err);
            }
            console.log('getSession: cognitoUserSession fetched from cognito');
            cognitoUserSession = session;
            return deferred.resolve(cognitoUserSession);
          });
          return deferred.promise;
        }

        if (cognitoUserSession && cognitoUserSession.isValid()) {
          // this code path executed on page change (not first load) or post-login
          console.log('getSession: valid cognitoUserSession retrieved');


          /*                    AWS.config.credentials.get(function(err) {
                        if (err) console.log('credget error: ' + err);
                        else {console.log("credget success");
                        console.log(AWS.config.credentials);}
                    }); */


          deferred.resolve(cognitoUserSession);
        } else { console.log('getSession: could not get valid cognitoUserSession'); }
        deferred.resolve(null);

        return deferred.promise;
      },


      isSessValid() {
        if (!cognitoUserSession) { return false; }
        return cognitoUserSession.isValid();
      },


      getToken(use) {
        // console.log("getToken");
        if (!cognitoUserSession || !use) { return null; }

        if (use === 'id') { return cognitoUserSession.getIdToken().getJwtToken(); }

        if (use === 'access') { return cognitoUserSession.getAccessToken().getJwtToken(); }

        return null;
      },

      getDecodedToken(use) {
        // send jwt to backend, receive decoded token (or forbidden)
        // TODO separate into own service


        // console.log("getDecodedToken");

        if (decodedIdToken) { // use RAM cache if we have it
          // console.log("found decoded token in memory");

          return $q.when(decodedIdToken);
        }

        const token = this.getToken(use);


        if (!token) {
          console.log('getDecodedToken Error');
          return $q.reject('no jwt token');
        }


        let formData = `jwt_token=${token}`;
        // console.log("formData:" + formData);
        if (use !== undefined) {
          formData += `&use=${use}`;
        }
        // if (scope !== undefined) {formData += "&scope=" + scope;}

        /* let formData = {};
                     formData.jwt_token = identity.token;
                     if (use !== undefined) {formData.use = use;}
                     if (scope !== undefined) {formData.scope = scope;}
                     console.log(JSON.stringify(formData)); */

        return $http({
          method: 'POST',
          url: `https://${location.host}/proxy/verifyToken`,
          data: formData,
          timeout: 5000,
          responseType: 'text',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
          .then((response) => {
            console.log('SUCCESSFULLY VERIFIED ID');
            decodedIdToken = response.data;
            return $q.when(response.data);
          })
          .catch((error) => {
            console.log('INVALID TOKEN');
            console.log(`Error getting decoded token: ${error.data}`);
            console.log(`Error status code: ${error.status}`);
            // TODO: notify view about why
            return $q.reject(error.status);
          });
      },


      getRoles() {
        // get decoded ID token, return
        // console.log("getRoles");


        return this.getDecodedToken('id')
          .then(
            data =>
              // console.log("received decoded token: " + JSON.stringify(data));
              $q.when(data['cognito:roles']),
          )
          .catch(
            (error) => {
              console.log(`getRoles Error: ${error}`);
              return $q.when(null);
            },
          );
      },

      isInRole(rolesRequired) {
        return this.getRoles().then(
          (rolesAssigned) => {
            if (!rolesAssigned) { return $q.when(false); }
            return $q.when(rolesAssigned.indexOf(rolesRequired) !== -1);
          }).catch(
          (error) => {
            console.log('No roles available');
            return $q.reject(error);
          });
      },

      isInAnyRole(rolesRequired) {
        // console.log ("isInAnyRole:" + JSON.stringify(rolesRequired));

        return this.getRoles().then(
          (rolesAssigned) => { // don't actually need rolesAssigned
            if (!rolesAssigned && rolesRequired.length > 0) {
              return $q.when(false);
            }

            // console.log ("successfully retrieved roles");
            const promises = [];

            for (let i = 0; i < rolesRequired.length; i += 1) {
              promises.push(this.isInRole(rolesRequired[i]));
            }

            return $q.all(promises)
              .then(
                (values) => {
                  for (let i = 0; i < promises.length; i += 1) {
                    if (values[i]) {
                      // console.log("found match");
                      return $q.when(true);
                    }
                  }
                  console.log('found no matches');
                  return $q.when(false);
                })
              .catch(
                (errors) => {
                  // console.log("isInAnyRole: isInRole callback");
                  console.log(JSON.stringify(errors));
                  return $q.reject(errors);
                });
          }).catch(
          (err) => {
            console.log('getRoles Error2');
            return $q.reject(err);
          });
      },


      signOut() {
        if (this.getUserLocal()) {
          cognitoUser.signOut();
          // console.log("signOut: cognito sdk .signOut()");
        }

        // console.log("signOut: clearing ram cache");
        cognitoUserSession = null;
        decodedIdToken = null;


        if (cognitoUserSession) {
          alert('sign-out FAILED');
        }

        /*                this.getSession().then(function(session){
                 if (session)
                 console.log("signout failed, session still available");
                 }) */
      },

      signIn(login, password) {
        const deferred = $q.defer();

        // check already signed in, else:

        const userData = {
          Username: login,
          Pool: userPool,
        };

        const authenticationData = {
          Username: login,
          Password: password,
        };

        const authenticationDetails =
          new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

        cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails,
          {
            onSuccess(result) {
              /*                           cognitoUser.getUserAttributes(function(err,result){
                             for (i = 0; i < result.length; i++) {
                             console.log(JSON.stringify(result));
                             }
                             }); */

              // console.log(cognitoUser.getUsername());
              cognitoUserSession = result;

              deferred.resolve(result);
            },


            onFailure(error) {
              alert(error);
              deferred.reject(error);
            },

            newPasswordRequired(userAttributes, requiredAttributes) {
              // User was signed up by an admin and must provide new
              // password and required attributes, if any, to complete
              // authentication.

              // the api doesn't accept this field back
              delete userAttributes.email_verified;

              // Get these details and call
              const newPassword = 'vI0letrose3';
              cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
            },

          });
        return deferred.promise;
      },

      getUsername() {
        return cognitoUser.getUsername();
      },

      setAWSCredentials() {
        if (!cognitoUserSession || !cognitoUserSession.isValid()) return false;

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: 'us-east-1:7166f2d1-bff6-4ca9-b286-acc36fb9c04a',
          Logins: { 'cognito-idp.us-east-1.amazonaws.com/us-east-1_C17D4qjgy':
            cognitoUserSession.getIdToken().getJwtToken() },
        });

        AWS.config.region = 'us-east-1';

        return true;
      },

      enableTrackDevice() {
        // console.log('enableTrackDevice');
        if (cognitoUser) {
          cognitoUser.setDeviceStatusRemembered({
            onSuccess(result) {
              console.log(`call result: ${result}`);
            },

            onFailure(err) {
              alert(err);
            },
          });
        }
      },

      disableTrackDevice() {
        // console.log('disableTrackDevice');

        if (cognitoUser) {
          cognitoUser.setDeviceStatusNotRemembered({
            onSuccess(result) {
              console.log(`call result: ${result}`);
            },

            onFailure(err) {
              alert(err);
            },
          });
        }
      },


    };
  }]);
