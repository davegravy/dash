let armsApp = angular.module('armsApp', ['ui.router']);


armsApp.run(function(){
    console.log("Arms_app.run");
});

armsApp.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider

        .state('root', {
            url: '',
            abstract: true,
            views: {
                'navbar': {templateUrl: 'partial-navbar.html'},
                'main': {templateUrl: 'partial-main.html'}

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

                //asset2: function() {loadScript("assets/js/pages/layout_fixed_custom.js");}
            }

        })

        .state('root.monitor', {
                url: '/monitor/{id}',
                views: {
                    'sidebar': {templateUrl: 'main_sidebar.html'},
                    'container': {templateUrl: 'partial-monitor.html'}
                },
                data: {
                    roles: ['arn:aws:iam::144349053222:role/ARMS-app-user']
                },
                resolve: {
                    asset1: function () {loadScript("assets/js/core/limitless-app.js");},
                    //asset2: function() {loadScript("assets/js/pages/layout_fixed_custom.js");}
                }



        })

        .state('root.dashboard', {
            url: '/',
            views: {
                'sidebar': {templateUrl: 'main_sidebar.html'},
                'container': {templateUrl: 'partial-dashboard.html'}
            },
            data: {
                roles: ['arn:aws:iam::144349053222:role/ARMS-app-user']
            },
            resolve: {
                asset1: function () {
                    loadScript("assets/js/core/limitless-app.js");
                },
                //asset2: function() {loadScript("assets/js/pages/layout_fixed_custom.js");}
            }
        })

        .state('root.login', {
            url: '/login',
            views: {
                'main@': {templateUrl: 'login_advanced.html'},
            },
            resolve: {
                asset1: function () {loadScript("assets/js/core/limitless-app.js");}
            },
            data: {
                roles: []
            },


        })

        .state('root.error_403', {
            url: '/error_403',
            views: {
                'main@': {templateUrl: 'partial-error_403.html'},
            },
            resolve: {
                asset1: function () {loadScript("assets/js/core/limitless-app.js");}

            },
            data: {
                roles: []
            },


        })


});

armsApp.run(function($trace) {
    //$trace.enable('TRANSITION');
});



armsApp.run(function($rootScope, $state, $transitions, $stateParams, authorization){

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;


    $transitions.onStart({}, function(trans) {
        console.log('onStart transition');

        // track the state the user wants to go to;
        // authorization service needs this
        $rootScope.toState = trans.to();
        $rootScope.toStateParams = trans.params();

        // if the principal is resolved, do an
        // authorization check immediately. otherwise,
        // it'll be done when the state it resolved.

        console.log("going to state:" + trans.to().name);
        console.log("state requires roles:" + trans.to().data.roles);
        console.log("params:" + trans.params().id);
        console.log("params2:" + JSON.stringify(trans.params()));



        /* if (principal.isIdentityResolved()) TODO:figure out why this was here originally*/
        return authorization.authorize().then(function(response) {
            return response;
        });
        //return authorization.testAsyncFunction().then(function(response) {return response});


    });

});


