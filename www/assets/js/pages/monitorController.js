angular.module('armsApp').controller('monitor', function($scope, $interval, $stateParams, monitorManager){



    $scope.pc1 = new ProgressCounter('#disk-space-remaining', 38, 2, "#F06292", 0.68, "icon-drive text-pink-400", 'drive space remaining', '20,000MB');
    $scope.pc2 = new ProgressCounter('#battery-voltage', 38, 2, "#F06292", 0.68, "icon-battery-6 text-pink-400", 'battery voltage', '12.2V');
    $scope.vibrationTSC = new TimeSeriesChart('#vibration-tsc', 255,["#558B2F", "#EF6C00", "#0277BD"],15,"acceleration (ug)"); // initialize chart
    $scope.soundTSC = new TimeSeriesChart('#sound-tsc', 255,["#6A1B9A", "#AD1457"],15,"pressure (dB re 20uPa)"); // initialize chart

    $scope.pc1.updateProgress(0.68);
    $scope.pc2.updateProgress(0.68);



    $scope.monitorIdShort = $stateParams.id.replace("ARMS-", "");

    monitorManager.getMonitor(undefined,$stateParams.id).then((monitor)=>{
        //console.log(monitor);
        $scope.siteId = monitor["site"];
        $scope.ipAddress = monitor["ip"];
        if (monitor["monitor_type"] == "nvm") {$scope.monitorType = "NVM";}
        if (monitor["monitor_type"] == "tvm") {$scope.monitorType = "TVM";}

    });


    //$scope.monitorIdShort = $stateParams.id.replace("ARMS_", "").replace("_", "-");//not sure why "_" had to be used instead of "-"




    //Initialize Defaults
    $scope.date = '00/00/0000';
    $scope.time = '00:00:00';

    let data = null;



    $scope.Timer = $interval(function(){
        if (!document.hidden) {

            console.log('looping');

            monitorManager.getMonitorValues($stateParams.id).then(function(monitorValues){

                if (monitorValues["WSCGetCRIOInstrumentStatus"]["status"] == true) {
                    let CRIOInstrumentStatus = monitorValues["WSCGetCRIOInstrumentStatus"]["data"];
                    let date = new Date(Date.parse(CRIOInstrumentStatus["Time and Date"]));

                    $scope.time = ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2);
                    $scope.date = ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth()+1)).slice(-2) + '/' + date.getFullYear();

                    switch (CRIOInstrumentStatus["Monitor State"]) {
                        case "Initializing":
                            break;
                        case "Ready":
                            break;
                        case "PDR":
                            break;
                    }

                    //CRIOInstrumentStatus["WeatherData"]["r1"]["windDirAvg"]
                    //CRIOInstrumentStatus["WeatherData"]["r1"]["windSpdAvg"]
                    //CRIOInstrumentStatus["WeatherData"]["r2"]["airTemp"]
                    //CRIOInstrumentStatus["WeatherData"]["r2"]["relHumid"]
                    //CRIOInstrumentStatus["WeatherData"]["r2"]["airPress"]
                    //CRIOInstrumentStatus["WeatherData"]["r3"]["precipitation"]

                    //CRIOInstrumentStatus["Leq (1s dBLin)"]
                    //CRIOInstrumentStatus["Leq (1s dBA)"]

                    let x = CRIOInstrumentStatus["Level - X (1s RMS)"];
                    let y = CRIOInstrumentStatus["Level - Y (1s RMS)"];
                    let z = CRIOInstrumentStatus["Level - Z (1s RMS)"];

                    let sound_linear = CRIOInstrumentStatus["Leq (1s dBLin)"];
                    let sound_a = CRIOInstrumentStatus["Leq (1s dBA)"];

                    x = x*1000000;
                    y = y*1000000;
                    z = z*1000000;
                    
                    data = {
                        //"date": CRIOInstrumentStatus["Time and Date"],
                        //"date": Date.parse(CRIOInstrumentStatus["Time and Date"]),
                        "date": date,
                        "X": x,
                        "Y": y,
                        "Z": z
                    };

                    $scope.vibrationTSC.pushData(data);

                    $scope.xVibration = x;
                    $scope.yVibration = y;
                    $scope.zVibration = z;

                    data = {
                        "date": date,
                        "dBA": sound_a,
                        "dB": sound_linear
                    };

                    $scope.soundTSC.pushData(data);

                    $scope.soundDB = sound_linear;
                    $scope.soundDBA = sound_a;


                }
                else
                {

                }

            });







            $scope.pc1.animateUpdateProgress(Math.random(), 1000);
            $scope.pc2.animateUpdateProgress(Math.random(), 1000);







        }
    }, 1000);

//when we leave the state, stop the interval
    $scope.$on("$destroy", function() {
        if (angular.isDefined($scope.Timer)) {
            $interval.cancel($scope.Timer);
        }
    });

    angular.element(document).ready(function() {

    });


});


function generateCrioStyleDate() {
    let date = new Date();
    let hours;
    //temp date calc
    let PM_AM = date.getHours() > 12 ? "PM" : "AM";
    if (PM_AM === "PM") {
        hours = ((date.getHours() - 12) < 10 ? '0' : '') + (date.getHours() - 12);
    }
    else {
        hours = (date.getHours() < 10 ? '0' : '') + date.getHours();
    }

    let minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    let seconds = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
    let month = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1);
    //console.log(date.getDate());
    let day = (date.getDate() < 10 ? '0' : '') + date.getDate();

    let ret = hours + ":" + minutes + ":" + seconds + "." + date.getMilliseconds() + " " + PM_AM + " " + month + "/" + day + "/" + date.getFullYear();

    date = null;
    hours = null;
    PM_AM = null;
    minutes = null;
    seconds = null;
    month = null;
    day = null;
    //console.log(ret);
    return ret;
}
