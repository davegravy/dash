angular.module('armsApp').controller('monitor', function($scope, $interval, $stateParams, monitorManager){



    $scope.pc1 = new ProgressCounter('#disk-space-remaining', 38, 2, "#F06292", 0.68, "icon-drive text-pink-400", 'drive space remaining', '20,000MB');
    $scope.pc2 = new ProgressCounter('#battery-voltage', 38, 2, "#F06292", 0.68, "icon-battery-6 text-pink-400", 'battery voltage', '12.2V');
    $scope.vibrationTSC = new TimeSeriesChart('#vibration-tsc', 255,["#558B2F", "#EF6C00", "#0277BD"],15,"acceleration (ug)"); // initialize chart
    $scope.soundTSC = new TimeSeriesChart('#sound-tsc', 255,["#6A1B9A", "#AD1457"],15,"pressure (dB re 20uPa)"); // initialize chart

    $scope.pc1.updateProgress(0.68);
    $scope.pc2.updateProgress(0.68);



    monitorManager.getMonitor(undefined,$stateParams.id).then((monitor)=>{
        //console.log(monitor);
        $scope.siteId = monitor["site"];
        if (monitor["monitor_type"] == "nvm") {$scope.monitorType = "NVM";}
        if (monitor["monitor_type"] == "tvm") {$scope.monitorType = "TVM";}
    });


    //$scope.monitorIdShort = $stateParams.id.replace("ARMS_", "").replace("_", "-");//not sure why "_" had to be used instead of "-"
    $scope.monitorIdShort = $stateParams.id.replace("ARMS-", "");


    $scope.ipAddress = '74.198.224.31';

    $scope.date = '04/03/2017';
    $scope.time = '04:42:38';

    let data = null;



    $scope.Timer = $interval(function(){
        if (!document.hidden) {

            console.log('looping');
            $scope.pc1.animateUpdateProgress(Math.random(), 1000);
            $scope.pc2.animateUpdateProgress(Math.random(), 1000);

            data = {
                "date": generateCrioStyleDate(),
                "X": (Math.random() * 500).toString(),
                "Y": (Math.random() * 1000).toString(),
                "Z": (Math.random() * 100).toString()
            };

            $scope.vibrationTSC.pushData(data);

            $scope.xVibration = parseFloat(data["X"]).toFixed(1);
            $scope.yVibration = parseFloat(data["Y"]).toFixed(1);
            $scope.zVibration = parseFloat(data["Z"]).toFixed(1);


            data = {
                "date": generateCrioStyleDate(),
                "dBA": (Math.random() * 100).toString(),
                "dB": (Math.random() * 100).toString()
            };

            $scope.soundTSC.pushData(data);

            $scope.soundDB = parseFloat(data["dB"]).toFixed(1);
            $scope.soundDBA = parseFloat(data["dBA"]).toFixed(1);



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