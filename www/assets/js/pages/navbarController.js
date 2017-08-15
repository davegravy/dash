angular.module('armsApp').controller('navbar', function($scope, $state, cognito){

    $scope.cognito = cognito;
    $scope.$state = $state;

    console.log('cognito.isSessValid: ' + cognito.isSessValid());

    $scope.onLogoutClicked = function() {

        console.log('onLogoutClicked');
        cognito.signOut();
        $state.go('root.login');

    }



});