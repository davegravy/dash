/* eslint max-len: ["error", 100] */
/* global window angular $ document PNotify TimeSeriesChart ProgressCounter */

angular.module('armsApp')
  .controller('monitor', ($scope, $rootScope, $interval, $stateParams, $sce, monitorManager) => {
    function jqueryInit() {
      function containerHeight() {
        const availableHeight = $(window).height()
          - $('.page-container').offset().top - $('.navbar-fixed-bottom').outerHeight();

        $('.page-container').attr('style', `min-height:${availableHeight}px`);
      }
      console.log('monitorController: jquery init');
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

    function onPowerOnConfirmed() {
      const stack = $rootScope.pnotify_stack;

      const notice = new PNotify({
        title: 'Power ON',
        icon: 'icon-power2',
        text: 'Command sent, waiting for reply...',
        addclass: 'stack-bottom-left bg-info',
        stack,
      });

      monitorManager.sendPowerOn($stateParams.id).then(() => {
        notice.update({
          text: 'Command sent successfully!',
          addclass: 'stack-bottom-left bg-success',
        });
      }).catch((data) => {
        notice.update({
          text: `Error sending command: ${data}`,
          addclass: 'stack-bottom-left bg-danger',
        });
      });
    }

    function onPowerOffSoftConfirmed() {
      const stack = $rootScope.pnotify_stack;

      const notice = new PNotify({
        title: 'Power OFF (soft)',
        icon: 'icon-power2',
        text: 'Command sent, waiting for reply...',
        addclass: 'stack-bottom-left bg-info',
        stack,
      });

      monitorManager.sendPowerOffSoft($stateParams.id).then(() => {
        notice.update({
          text: 'Command sent successfully!',
          addclass: 'stack-bottom-left bg-success',
        });
      }).catch((data) => {
        notice.update({
          text: `Error sending command: ${data}`,
          addclass: 'stack-bottom-left bg-danger',
        });
      });
    }

    function onPowerOffHardConfirmed() {
      const stack = $rootScope.pnotify_stack;

      /*        let notice = new PNotify({
       title: "Power OFF (hard)",
       icon: 'icon-power2',
       text: "Command sent, waiting for reply...",
       addclass: "stack-bottom-left bg-info",
       stack: stack
       }); */

      const notice = new PNotify({
        title: 'Power OFF (hard)',
        icon: 'icon-power2',
        text: 'error: command not implemented',
        addclass: 'stack-bottom-left bg-danger',
        stack,
      });

      notice.update({});
      /* monitorManager.sendPowerOn($stateParams.id).then(function(data){

       notice.update({
       text: "Command sent successfully!",
       addclass: "stack-bottom-left bg-success"
       });

       }).catch(function(data){

       notice.update({
       text: "Error sending command: " + data,
       addclass: "stack-bottom-left bg-danger"
       })

       }); */
    }

    function onStartRecordingConfirmed() {
      const stack = $rootScope.pnotify_stack;

      const notice = new PNotify({
        title: 'Start Recording',
        icon: 'icon-mic2',
        text: 'Command sent, waiting for reply...',
        addclass: 'stack-bottom-left bg-info',
        stack,
      });

      monitorManager.sendStartRecording($stateParams.id).then(() => {
        notice.update({
          text: 'Command sent successfully!',
          addclass: 'stack-bottom-left bg-success',
        });
      }).catch((data) => {
        notice.update({
          text: `Error sending command: ${data}`,
          addclass: 'stack-bottom-left bg-danger',
        });
      });
    }

    function onStopRecordingConfirmed() {
      const stack = $rootScope.pnotify_stack;

      const notice = new PNotify({
        title: 'Stop Recording',
        icon: 'icon-mic-off2',
        text: 'Command sent, waiting for reply...',
        addclass: 'stack-bottom-left bg-info',
        stack,
      });

      monitorManager.sendStopRecording($stateParams.id).then(() => {
        notice.update({
          text: 'Command sent successfully!',
          addclass: 'stack-bottom-left bg-success',
        });
      }).catch((data) => {
        notice.update({
          text: `Error sending command: ${data}`,
          addclass: 'stack-bottom-left bg-danger',
        });
      });
    }

    $scope.onPowerOnClicked = function () {
      // no confirmation necessary
      onPowerOnConfirmed();
    };

    $scope.onPowerOffSoftClicked = function () {
      console.log('onPowerOffSoftClicked');
      $scope.confirm_title = 'Turn off power?';
      $scope.confirm_text = $sce.trustAsHtml(
        '<p>Sending this command will initiate a shutdown of the cRIO and afterwards cut power.' +
        ' The process may take several minutes.</p> <p>Click confirm to proceed.</p>');
      $scope.confirm_icon = 'icon-power2';
      $scope.confirm_function = onPowerOffSoftConfirmed;
      $('#modal_theme_warning').modal('show');
    };

    $scope.onPowerOffHardClicked = function () {
      $scope.confirm_title = 'Turn off power?';
      $scope.confirm_text = $sce.trustAsHtml(
        '<p>Sending this command will instantly remove power to the cRIO.</p>' +
        "<p><div class='text-danger-800'>" +
        'THIS IS NOT A GRACEFUL SHUTDOWN AND MAY RESULT IN DATA LOSS.' +
        "</div> This should only be done when a soft shutdown isn't possible.</p> " +
        '<p>Click confirm to proceed.</p>');
      $scope.confirm_icon = 'icon-power2';
      $scope.confirm_function = onPowerOffHardConfirmed;
      $('#modal_theme_warning').modal('show');
    };

    $scope.onStartRecordingClicked = function () {
      // no confirmation necessary
      onStartRecordingConfirmed();
    };

    $scope.onStopRecordingClicked = function () {
      $scope.confirm_title = 'Stop recording?';
      $scope.confirm_text = $sce.trustAsHtml(
        '<p>Sending this command will put the cRIO in an idle state where it will no longer log ' +
        'data or respond to events.</p> <p>Click confirm to proceed.</p>');
      $scope.confirm_icon = 'icon-mic-off2';
      $scope.confirm_function = onStopRecordingConfirmed;
      $('#modal_theme_warning').modal('show');
    };


    $scope.dsr_pc = new ProgressCounter(
      '#disk-space-remaining', 38, 2, '#F06292', 0.99, 'icon-drive text-pink-400',
      'drive space remaining', '0 MB');
    $scope.voltage_pc = new ProgressCounter(
      '#battery-voltage', 38, 2, '#F06292', 0.99, 'icon-battery-6 text-pink-400',
      'battery voltage', '0 V');
    $scope.vibrationTSC = new TimeSeriesChart(
      '#vibration-tsc', 255, ['#558B2F', '#EF6C00', '#0277BD'], 15, 'acceleration (ug)');
    $scope.soundTSC = new TimeSeriesChart(
      '#sound-tsc', 255, ['#6A1B9A', '#AD1457'], 15, 'pressure (dB re 20uPa)');

    $scope.dsr_pc.updateProgress(0.01);
    $scope.voltage_pc.updateProgress(0.01);


    $scope.monitorIdShort = $stateParams.id.replace('ARMS-', '');

    monitorManager.getMonitor(undefined, $stateParams.id).then((monitor) => {
      console.log(monitor);
      $scope.siteId = monitor.site;
      $scope.ipAddress = monitor.ip;
      console.log(monitor.monitor_type);
      if (monitor.monitorType === 'nvm') { $scope.monitorType = 'NVM'; }
      if (monitor.monitorType === 'tvm') { $scope.monitorType = 'TVM'; }
    });


    // $scope.monitorIdShort = $stateParams.id.replace("ARMS_", "")
    // .replace("_", "-");//not sure why "_" had to be used instead of "-"


    // Initialize Defaults
    $scope.date = '00/00/0000';
    $scope.time = '00:00:00';

    let data = null;


    $scope.Timer = $interval(() => {
      if (!document.hidden && !$rootScope.idleFlag) {
        console.log('looping');

        monitorManager.getMonitorValues($stateParams.id).then((monitorValues) => {
          if (monitorValues.WSCGetCRIOInstrumentStatus.status === true) {
            const CRIOInstrumentStatus = monitorValues.WSCGetCRIOInstrumentStatus.data;
            const date = new Date(Date.parse(CRIOInstrumentStatus['Time and Date']));

            $scope.time = `${(`0${date.getHours()}`)
              .slice(-2)}:${(`0${date.getMinutes()}`)
              .slice(-2)}:${(`0${date.getSeconds()}`).slice(-2)}`;
            $scope.date = `${(`0${date.getDate()}`)
              .slice(-2)}/${(`0${date.getMonth() + 1}`)
              .slice(-2)}/${date.getFullYear()}`;


            $scope.crio_status_detailed = CRIOInstrumentStatus['Monitor State'];

            // CRIOInstrumentStatus["WeatherData"]["r1"]["windDirAvg"]
            // CRIOInstrumentStatus["WeatherData"]["r1"]["windSpdAvg"]
            // CRIOInstrumentStatus["WeatherData"]["r2"]["airTemp"]
            // CRIOInstrumentStatus["WeatherData"]["r2"]["relHumid"]
            // CRIOInstrumentStatus["WeatherData"]["r2"]["airPress"]
            // CRIOInstrumentStatus["WeatherData"]["r3"]["precipitation"]

            let x = parseFloat(CRIOInstrumentStatus['Level - X (1s RMS)']);
            let y = parseFloat(CRIOInstrumentStatus['Level - Y (1s RMS)']);
            let z = parseFloat(CRIOInstrumentStatus['Level - Z (1s RMS)']);

            const soundLinear = parseFloat(CRIOInstrumentStatus['Leq (1s dBLin)']);
            const soundAWeighted = parseFloat(CRIOInstrumentStatus['Leq (1s dBA)']);

            x *= 1000000;
            y *= 1000000;
            z *= 1000000;

            data = {
              // "date": CRIOInstrumentStatus["Time and Date"],
              // "date": Date.parse(CRIOInstrumentStatus["Time and Date"]),
              date,
              X: x,
              Y: y,
              Z: z,
            };

            $scope.vibrationTSC.pushData(data);

            $scope.xVibration = x.toFixed(0);
            $scope.yVibration = y.toFixed(0);
            $scope.zVibration = z.toFixed(0);

            data = {
              date,
              dBA: soundAWeighted,
              dB: soundLinear,
            };

            $scope.soundTSC.pushData(data);

            $scope.soundDB = soundLinear.toFixed(1);
            $scope.soundDBA = soundAWeighted.toFixed(1);

            $scope.crio_pdr = CRIOInstrumentStatus['Monitor State'] === 'PDR';
          }


          if (monitorValues.WSCGetWebrelayState.status === true) {
            if (monitorValues.WSCGetWebrelayState.data.datavalues.relay1state === '1'
              && monitorValues.WSCGetWebrelayState.data.datavalues.relay2state === '1') {
              $scope.webrelay_pos = true;
            } else { $scope.webrelay_pos = false; }
          }


          if (monitorValues.WSCGetCRIOSystemStatus.status === true) {
            const dsr = parseFloat(
              monitorValues.WSCGetCRIOSystemStatus.data['Drive Space Remaining MB']);

            $scope.dsr_pc.setSubText(`${dsr.toFixed(0)} MB`);

            const dsrPercent = dsr / 500000; // TODO programatically retrieve drive size
            $scope.dsr_pc.animateUpdateProgress(dsrPercent, 1000);

            switch (true) {
              default:
                $scope.dsr_pc.setColor('#F44336');
                $scope.dsr_pc.setIconClass('icon-drive text-danger');
                break;
              case dsr > 20000 && dsr <= 80000:
                $scope.dsr_pc.setColor('#FF5722');
                $scope.dsr_pc.setIconClass('icon-drive text-warning');
                break;
              case dsr > 80000:
                $scope.dsr_pc.setColor('#4CAF50');
                $scope.dsr_pc.setIconClass('icon-drive text-success');
                break;
            }
          }


          if (monitorValues.WSCGetWebrelayDiagnostics.status === true) {
            const voltage = parseFloat(monitorValues.WSCGetWebrelayDiagnostics.data.datavalues.vin);

            $scope.voltage_pc.setSubText(`${voltage.toFixed(1)} V`);

            const zeroPercent = 9.5; // 9.5V = empty
            const oneHundredPercent = 12.8; // 12.8V = full

            // convert voltage to percent (very approximate!)
            let voltagePercent = (voltage - zeroPercent) / (oneHundredPercent - zeroPercent);
            if (voltagePercent > 1) { voltagePercent = 1; } // limit to 100%


            $scope.voltage_pc.animateUpdateProgress(voltagePercent, 1000);

            switch (true) {
              default:
                $scope.voltage_pc.setColor('#F44336');
                $scope.voltage_pc.setIconClass('icon-battery-6 text-danger');
                break;
              case voltage > 10.5 && voltage <= 11.7:
                $scope.voltage_pc.setColor('#FF5722');
                $scope.voltage_pc.setIconClass('icon-battery-6 text-warning');
                break;
              case voltage > 11.8:
                $scope.voltage_pc.setColor('#4CAF50');
                $scope.voltage_pc.setIconClass('icon-battery-6 text-success');
                break;
            }
          }

          if (monitorValues.WSCGetCRIOSystemSettings.status === true) {
            $scope.crio_timing_mode =
              monitorValues.WSCGetCRIOSystemSettings.data['System Settings']['Timing Mode'];
          }

          $scope.crio_status = (monitorValues.WSCGetCRIOInstrumentStatus.status ||
          monitorValues.WSCGetCRIOSystemStatus.status ||
          monitorValues.WSCGetCRIOInstrumentSettings.status ||
          monitorValues.WSCGetCRIOSystemSettings.status);


          $scope.webrelay_status = (monitorValues.WSCGetWebrelayState.status ||
          monitorValues.WSCGetWebrelayDiagnostics.status);
        });
      }
    }, 1000);

    // when we leave the state, stop the interval
    $scope.$on('$destroy', () => {
      if (angular.isDefined($scope.Timer)) {
        $interval.cancel($scope.Timer);
      }
    });


    angular.element(document).ready(() => {

    });
  });
