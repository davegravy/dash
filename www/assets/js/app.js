/* eslint no-param-reassign: ["error", { "props": false }] */
/* global $ angular */
/* eslint max-len: ["error", 100] */

const armsApp = angular.module('armsApp', ['ui.router', 'ngIdle', 'oc.lazyLoad']);

armsApp.run(() => {
  console.log('Arms_app.run');
});

armsApp.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
  $ocLazyLoadProvider.config({
    debug: true,
    events: false,

  });
}]);


armsApp.config(($stateProvider, $urlRouterProvider) => {
  $urlRouterProvider.otherwise('/');
  $stateProvider

    .state('root', {
      url: '',
      abstract: true,
      views: {
        navbar: { templateUrl: 'partial-navbar.html' },
        main: { templateUrl: 'partial-main.html' },

      },
      resolve: {
        /*
           authorize: ['authorization',
           function(authorization) {
           console.log('stateProvider resolve');
           return authorization.authorize();
           }
           ],
           */
        loadMyLibraries: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load(['assets/js/core/limitless-app.js']);
        }],
        // asset2: function() {loadScript("assets/js/pages/layout_fixed_custom.js");}
      },

    })

    .state('root.monitor', {
      url: '/monitor/{id}',
      views: {
        sidebar: { templateUrl: 'main_sidebar.html' },
        container: { templateUrl: 'partial-monitor.html' },
      },
      data: {
        roles: ['arn:aws:iam::144349053222:role/ARMS-app-user'],
      },
      resolve: {
        loadMyLibraries: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load(['assets/js/pages/monitorUIElements.js']);
        }],
        // asset1: function () {loadScript("assets/js/core/limitless-app.js");},
        // asset2: function() {loadScript("assets/js/pages/layout_fixed_custom.js");}

      },


    })


    .state('root.historical', {
      url: '/historical/{id}',
      views: {
        sidebar: { templateUrl: 'main_sidebar.html' },
        container: { templateUrl: 'partial-historical.html' },
      },
      data: {
        roles: ['arn:aws:iam::144349053222:role/ARMS-app-user'],
      },
      resolve: {
        // asset1: function () {loadScript("assets/js/core/limitless-app.js");},
        loadMyLibraries: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load(['assets/js/plugins/visualization/d3/crossfilter.js',
            'assets/js/plugins/visualization/d3/dc.js', 'assets/js/pages/historicalUIElements.js',
            '/assets/css/dc.css']);
        }],
        // asset2: function() {loadScript("assets/js/pages/layout_fixed_custom.js");}
      },


    })

    .state('root.dashboard', {
      url: '/',
      views: {
        sidebar: { templateUrl: 'main_sidebar.html' },
        container: { templateUrl: 'partial-dashboard.html' },
      },
      data: {
        roles: ['arn:aws:iam::144349053222:role/ARMS-app-user'],
      },
      resolve: {
        asset1() {
          // loadScript('assets/js/core/limitless-app.js');
        },
        // asset2: function() {loadScript("assets/js/pages/layout_fixed_custom.js");}
      },
    })

    .state('reports', {
      url: '/reports?key',
      views: {
        //                'sidebar': {templateUrl: 'main_sidebar.html'},
        main: { templateUrl: 'partial-reports.html' },
      },
      data: {
        roles: ['arn:aws:iam::144349053222:role/ARMS-app-user'],
      },
      resolve: {
        // asset1() {loadScript("assets/js/core/limitless-app.js");},
        // asset2: function() {loadScript("assets/js/pages/layout_fixed_custom.js");}
      },
    })

    .state('root.login', {
      url: '/login',
      views: {
        'main@': { templateUrl: 'login_advanced.html' },
      },
      resolve: {
        // asset1() { loadScript('assets/js/core/limitless-app.js'); },
      },
      data: {
        roles: [],
      },


    })

    .state('root.error_403', {
      url: '/error_403',
      views: {
        'main@': { templateUrl: 'partial-error_403.html' },
      },
      resolve: {
        // asset1() { loadScript('assets/js/core/limitless-app.js'); },

      },
      data: {
        roles: [],
      },


    });
}).config((IdleProvider) => {
  IdleProvider.idle(900);
  IdleProvider.timeout(0);
});

/* armsApp.run(($trace) => {
  // $trace.enable('TRANSITION');
}); */

armsApp.run((Idle, $rootScope, $timeout) => {
  $rootScope.idleFlag = false;

  Idle.watch();

  $rootScope.$on('IdleStart', () => {
    $rootScope.idleFlag = true;
    $('#idle_modal').modal('show');
  });

  $rootScope.$on('IdleEnd', () => {
    $rootScope.idleFlag = false;
    $timeout(() => {
      $('#idle_modal').modal('hide');
    }, 1000);
  });

  $rootScope.pnotify_stack = { dir1: 'right', dir2: 'up', push: 'top' };
});


armsApp.run(($rootScope, $state, $transitions, $stateParams, authorization) => {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;


  $transitions.onStart({}, (trans) => {
    console.log('onStart transition');

    // track the state the user wants to go to;
    // authorization service needs this
    $rootScope.toState = trans.to();
    $rootScope.toStateParams = trans.params();

    // if the principal is resolved, do an
    // authorization check immediately. otherwise,
    // it'll be done when the state it resolved.

    console.log(`going to state:${trans.to().name}`);
    console.log(`state requires roles:${trans.to().data.roles}`);
    console.log(`params:${trans.params().id}`);
    console.log(`params2:${JSON.stringify(trans.params())}`);


    /* if (principal.isIdentityResolved()) TODO:figure out why this was here originally */
    return authorization.authorize().then((response) => {
      console.log(`authorize() response: ${response}`);
      return response;
    });
    // return authorization.testAsyncFunction().then(function(response) {return response});
  });
});

