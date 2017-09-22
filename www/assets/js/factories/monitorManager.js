/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint max-len: ["error", 100] */
/* global angular location */

angular.module('armsApp').factory('monitorManager', ['$q', '$http', 'cognito', 'authorization',

  function ($q, $http, cognito, authorization) {
    let sites = {};

    return {

      syncSites() {
        console.log('syncSites');
        const token = cognito.getToken('id');
        // let deferred = $q.defer();

        const formData = `jwt_token=${token}`;

        /* let formData = {};
         formData.jwt_token = identity.token;
         if (use !== undefined) {formData.use = use;}
         if (scope !== undefined) {formData.scope = scope;}
         console.log(JSON.stringify(formData)); */

        return $http({
          method: 'POST',
          url: `https://${location.host}/proxy/getSites`,
          data: formData,
          timeout: 5000,
          responseType: 'text',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
          .then((response) => {
            // console.log(response);
            sites = response.data;
            return $q.when(response.data);
          })
          .catch((error) => {
            console.log('syncSites error');
            console.log(`syncSites call failed: ${error.data}`);
            return $q.reject(error.status);
          });
      },

      getSites() {
        if (sites.length > 0) {
          console.log('cached sites used');
          return $q.when(sites);
        }

        return this.syncSites().then(data => $q.when(data));
      },

      formatSites(sitesToFormat) {
        const result = [];

        Object.keys(sitesToFormat).forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(sitesToFormat, key)) {
            const monitorType = sitesToFormat[key].monitor_type;
            const status = sitesToFormat[key].status;
            const ip = sitesToFormat[key].MODEM.ip;

            // filter out instantel and inactive monitors
            if (((monitorType === 'nvm') || (monitorType === 'tvm'))) {
              result.push({
                site: key,
                device_id: sitesToFormat[key].device_id,
                monitorType,
                status,
                ip,
              });
            }
          }
        });

        return result;
      },

      getMonitorList() {
        return this.getSites().then((sitesList) => {
          const monitorList = this.formatSites(sitesList);
          return $q.when(monitorList);
        });
      },

      getMonitor(site = undefined, deviceID = undefined) {
        if ((site === undefined) && (deviceID === undefined)) {
          return $q.reject('either site or device_id must be supplied');
        }
        if ((site !== undefined) && (deviceID !== undefined)) {
          return $q.reject('only one of site or device_id must be supplied');
        }
        return this.getMonitorList().then((monitorList) => {
          for (let i = 0; i < monitorList.length; i += 1) {
            if (site !== undefined) {
              if (monitorList[i].site === site) {
                return $q.when(monitorList[i]);
              }
            } else if (monitorList[i].device_id === deviceID) {
              return $q.when(monitorList[i]);
            }
          }
          return $q.when(null);
        });
      },

      getMonitorValues(deviceID) {
        const token = cognito.getToken('id');
        // let deferred = $q.defer();

        const formData = `device_id=${deviceID}&jwt_token=${token}`;

        /* let formData = {};
         formData.jwt_token = identity.token;
         if (use !== undefined) {formData.use = use;}
         if (scope !== undefined) {formData.scope = scope;}
         console.log(JSON.stringify(formData)); */

        return $http({
          method: 'POST',
          url: `https://${location.host}/proxy/getMonitorValues`,
          data: formData,
          timeout: 5000,
          responseType: 'text',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
          .then(response =>

            // console.log(data);

            $q.when(response.data),
          )
          .catch((error) => {
            console.log('getMonitorValues error');
            console.log(`getMonitorValues call failed: ${error.data}`);
            console.log(`error status:${error.status}`);


            if (error.status === 401) {
              console.log('authentication error, attempting re-authentication');
              authorization.authorize().then((result) => {
                console.log(`authorization result: ${result}`);
              });
            }

            // TODO handle other error types (e.g. 503 - service unavailable)

            return $q.reject(error.status);
          });
      },

      sendPowerOn(deviceID) {
        const token = cognito.getToken('id');
        // let deferred = $q.defer();

        const formData = `device_id=${deviceID}&jwt_token=${token}`;

        console.log(`device_id: ${deviceID}`);

        return $http({
          method: 'POST',
          url: `https://${location.host}/proxy/setPowerOnInstrument`,
          data: formData,
          timeout: 5000,
          responseType: 'text',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
          .then((response) => {
            console.log(`sendPowerOn: ${response.data}`);

            return $q.when(response.data);
          })
          .catch((error) => {
            console.log('sendPowerOn: error');
            console.log(`sendPowerOn call failed: ${error.data}`);
            return $q.reject(error.status);
          });
      },

      sendPowerOffSoft(deviceID) {
        const token = cognito.getToken('id');
        // let deferred = $q.defer();

        const formData = `device_id=${deviceID}&jwt_token=${token}`;

        console.log(`device_id: ${deviceID}`);

        return $http({
          method: 'POST',
          url: `https://${location.host}/proxy/setPowerOffInstrument`,
          data: formData,
          timeout: 5000,
          responseType: 'text',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
          .then((response) => {
            console.log(`sendPowerOff: ${response.data}`);

            return $q.when(response.data);
          })
          .catch((error) => {
            console.log('sendPowerOff: error');
            console.log(`sendPowerOff call failed: ${error.data}`);
            return $q.reject(error.status);
          });
      },

      sendStartRecording(deviceID) {
        const token = cognito.getToken('id');
        // let deferred = $q.defer();

        const formData = `device_id=${deviceID}&jwt_token=${token}`;

        console.log(`device_id: ${deviceID}`);

        return $http({
          method: 'POST',
          url: `https://${location.host}/proxy/setStartInstrument`,
          data: formData,
          timeout: 5000,
          responseType: 'text',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
          .then((response) => {
            console.log(`sendPowerOff: ${response.data}`);

            return $q.when(response.data);
          })
          .catch((error) => {
            console.log('sendPowerOff: error');
            console.log(`sendPowerOff call failed: ${error.data}`);
            return $q.reject(error.status);
          });
      },

      sendStopRecording(deviceID) {
        const token = cognito.getToken('id');
        // let deferred = $q.defer();

        const formData = `device_id=${deviceID}&jwt_token=${token}`;

        console.log(`device_id: ${deviceID}`);

        return $http({
          method: 'POST',
          url: `https://${location.host}/proxy/setStopInstrument`,
          data: formData,
          timeout: 5000,
          responseType: 'text',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
          .then((response) => {
            console.log(`sendPowerOff: ${response.data}`);

            return $q.when(response.data);
          })
          .catch((error) => {
            console.log('sendPowerOff: error');
            console.log(`sendPowerOff call failed: ${error.data}`);
            return $q.reject(error.status);
          });
      },

    };
  }]);
