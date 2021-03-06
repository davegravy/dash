/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint max-len: ["error", 100] */
/* global angular */

angular.module('armsApp').factory('authorization', ['$rootScope', '$state', 'cognito', '$q',
  function ($rootScope, $state, cognito, $q) {
    return {

      authorize() {
        if ($rootScope.toState.data.roles
                    && $rootScope.toState.data.roles.length > 0) {
          // console.log('state has required roles:'
          // + JSON.stringify($rootScope.toState.data.roles));

          return cognito.getSession()
            .then(
              (session) => {
                if (session) { // if the user is authenticated
                  console.log('user is authenticated');

                  return cognito.isInAnyRole($rootScope.toState.data.roles).then(
                    (value) => {
                      // console.log("finished determining role compliance");
                      if (!value) { // if the user doesn't have the required role
                        console.log("user isn't authenticated but doesn't have required role(s)");

                        $state.go('root.error_403', {}, { location: false });
                        return false;
                      }
                      return $q.when(true);
                    }).catch(

                    (err) => {
                      // alert("isInAnyRole Error: " + err);
                      console.log(`isInAnyRole Error: ${err}`);
                      return false;
                    });
                }


                // console.log("user isn't authenticated, sending to login");

                $rootScope.returnToState
                                        = $rootScope.toState;
                $rootScope.returnToStateParams
                                        = $rootScope.toStateParams;

                // now, send them to the signin state
                // so they can log in
                $state.go('root.login');
                return false;
              },
            )
            .catch(
              (err) => {
                console.log(`getSessions Error:${err}`);
                return false;
              },
            );
        }
        console.log('state is public, access granted');
        return $q.when(true);
      },
    };
  }]);
