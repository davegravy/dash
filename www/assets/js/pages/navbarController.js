/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint max-len: ["error", 100] */
/* global angular $ */

angular.module('armsApp').controller('navbar', ($scope, $state, cognito) => {
  $scope.cognito = cognito;
  $scope.$state = $state;

  // console.log('cognito.isSessValid: ' + cognito.isSessValid());

  $scope.onMainSidebarToggleClicked = function () {
    $('body').toggleClass('sidebar-xs');
  };

  $scope.onMobileSidebarToggleClicked = function () {
    $('body').toggleClass('sidebar-mobile-main')
      .removeClass('sidebar-mobile-secondary sidebar-mobile-opposite sidebar-mobile-detached');
  };

  $scope.onLogoutClicked = function () {
    // console.log('onLogoutClicked');
    cognito.signOut();
    $state.go('root.login');
  };
});
