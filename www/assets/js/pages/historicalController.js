
/* eslint max-len: ["error", 100] */
/* global window angular $ WindSpeedHistogram document */


angular.module('armsApp').controller('historical',
  ($scope, $rootScope, $interval, $stateParams, $sce, monitorManager, historicalManager) => {
    function jqueryInit() {
      function containerHeight() {
        const availableHeight = $(window).height()
          - $('.page-container').offset().top - $('.navbar-fixed-bottom').outerHeight();

        $('.page-container').attr('style', `min-height:${availableHeight}px`);
      }

      console.log('historicalController: jquery init');
      // Hide if collapsed by default
      $('.category-collapsed').children('.category-content').hide();


      // Rotate icon if collapsed by default
      $('.category-collapsed').find('[data-action=collapse]').addClass('rotate-180');


      // Collapse on click
      $('.category-title [data-action=collapse]').click(function (e) {
        e.preventDefault();
        const $categoryCollapse = $(this).parent().parent().parent()
          .nextAll();
        $(this).parents('.category-title').toggleClass('category-collapsed');
        $(this).toggleClass('rotate-180');

        containerHeight(); // adjust page height

        $categoryCollapse.slideToggle(150);
      });


      //
      // Panels
      //

      // Hide if collapsed by default
      $('.panel-collapsed').children('.panel-heading').nextAll().hide();


      // Rotate icon if collapsed by default
      $('.panel-collapsed').find('[data-action=collapse]').addClass('rotate-180');


      // Collapse on click
      $('.panel [data-action=collapse]').click(function (e) {
        e.preventDefault();
        const $panelCollapse = $(this).parent().parent().parent()
          .parent()
          .nextAll();
        $(this).parents('.panel').toggleClass('panel-collapsed');
        $(this).toggleClass('rotate-180');

        containerHeight(); // recalculate page height

        $panelCollapse.slideToggle(150);
      });


      // Remove elements
      // -------------------------

      // Panels
      $('.panel [data-action=close]').click(function (e) {
        e.preventDefault();
        const $panelClose = $(this).parent().parent().parent()
          .parent()
          .parent();

        containerHeight(); // recalculate page height

        $panelClose.slideUp(150, function () {
          $(this).remove();
        });
      });

      $('.panel-footer').has('> .heading-elements:not(.not-collapsible)')
        .prepend('<a class="heading-elements-toggle"><i class="icon-more"></i></a>');
      $('.page-title, .panel-title').parent()
        .has('> .heading-elements:not(.not-collapsible)').children('.page-title, .panel-title')
        .append('<a class="heading-elements-toggle"><i class="icon-more"></i></a>');


      // Toggle visible state of heading elements
      $('.page-title .heading-elements-toggle, .panel-title .heading-elements-toggle')
        .on('click', function () {
          $(this).parent().parent().toggleClass('has-visible-elements')
            .children('.heading-elements')
            .toggleClass('visible-elements');
        });
      $('.panel-footer .heading-elements-toggle').on('click', function () {
        $(this).parent().toggleClass('has-visible-elements').children('.heading-elements')
          .toggleClass('visible-elements');
      });
    }

    jqueryInit(); // so that page controls do all the "limitless" stuff they're supposed to


    $scope.windSpeedHistogram = new WindSpeedHistogram('#windSpeedHistogram');
    $scope.monitorIdShort = $stateParams.id.replace('ARMS-', '');

    monitorManager.getMonitor(undefined, $stateParams.id).then((monitor) => {
      // console.log(monitor);
      $scope.siteId = monitor.site;
      $scope.ipAddress = monitor.ip;
      if (monitor.monitorType === 'nvm') { $scope.monitorType = 'NVM'; }
      if (monitor.monitorType === 'tvm') { $scope.monitorType = 'TVM'; }
    });


    // $scope.monitorIdShort = $stateParams.id.replace("ARMS_", "")
    // .replace("_", "-");//not sure why "_" had to be used instead of "-"

    // Initialize Defaults
    $scope.date = '00/00/0000';
    $scope.time = '00:00:00';

    // const data = null;

    $scope.Timer = $interval(() => {
      if (!document.hidden && !$rootScope.idleFlag) {

        // do stuff
      }
    }, 1000);

    // when we leave the state, stop the interval
    $scope.$on('$destroy', () => {
      if (angular.isDefined($scope.Timer)) {
        $interval.cancel($scope.Timer);
      }
    });

    $scope.lastHistogramUpdate = window.performance.now();

    function updateHistogram(historical) {
      // console.log(historical);
      // console.log(historical);
      Object.keys(historical).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(historical, key)) {
          // console.log("key: " + key);
          // const subkey = historical[key]['ARMS-NVM data'].weather['measurement data'];
          // console.log(subkey[Object.keys(subkey)[0]]);
          /* subkey[Object.keys(subkey)[0]]['average wind speed'] =
            10 * Math.random(); // TODO:temporary for debugging */
          // TODO: verify support for multiple intervals in key
          $scope.windSpeedHistogram.addInterval(
            historical[key]['ARMS-NVM data'].weather['measurement data']);
        }
      });

      if ((window.performance.now() - $scope.lastHistogramUpdate) > 125) {
        $scope.windSpeedHistogram.updatePlot();
        $scope.lastHistogramUpdate = window.performance.now();
      }
    }

    historicalManager.getHistoricalData2('ARMS-NVM-P0', 'ARMS-NVM-P0', '1506096710')
      .then((historical) => {
        // console.log('HC then');
        updateHistogram(historical.keys);
      }, (error) => {
        console.error(error);
      }, (historical) => {
        // console.log('HC notify');
        updateHistogram(historical.keys);
      });

    angular.element(document).ready(() => {

    });
  });

