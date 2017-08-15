angular.module('armsApp').controller('login', function($scope, $rootScope, $state, cognito){

$scope.rememberCheckBox = true; //remember device by default


    $scope.onLoginClicked = function() {
        console.log("onLoginClicked");
        console.log("rememberedCheckBox: " + $scope.rememberCheckBox);
        cognito.signIn($scope.username, $scope.password, $scope.rememberCheckBox)
            .then(
                function(result){


                    if ($scope.rememberCheckBox === true){
                        console.log("User wants to remember device");
                        cognito.enableTrackDevice();
                    }
                    if ($scope.rememberCheckBox === false) {
                        console.log("User doesn't want to remember device");
                        cognito.disableTrackDevice();
                    }


                    if ($rootScope.returnToState && $rootScope.returnToStateParams){
                        console.log("SUCCESSFUL, next action :" + $rootScope.returnToState.name + " " + JSON.stringify($rootScope.returnToStateParams ));
                        $state.go($rootScope.returnToState.name, $rootScope.returnToStateParams);
                    } else{
                        console.log("SUCCESSFUL, next action: default state");
                        $state.go('root.dashboard');
                    }



                }).catch(
            function(error){
                alert("error getting tokens: "  + error);
                //TODO: present error details, and do it more cleanly on view
            });


    };


});