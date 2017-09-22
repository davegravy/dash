/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint max-len: ["error", 100] */
/* global angular location */


angular.module('armsApp').factory('historicalManager', ['$q', '$http', 'cognito', 'authorization',

  function ($q, $http, cognito, authorization) {
    // const _historical_data = {};

    return {

      /*      getHistoricalData() {
        const deferred = $q.defer();

        function loadAll(page) {
          const token = cognito.getToken('id');
          // let deferred = $q.defer();

          return $http({
            // details
          })
            .then((response) => {

              if (response.data.pages < page) {
                loadAll(page + 1);
              } else {
                deferred.resolve(response.data);
              }
            });
        }
        loadAll(0);
        return deferred.promise;
      }, */


      getHistoricalData(deviceID, siteKey, startTime) {
        const token = cognito.getToken('id');
        // let deferred = $q.defer();

        const formData = `device_id=${deviceID}&site_key=${siteKey}&start_time=${startTime}
        &jwt_token=${token}`;

        console.log(`historical data:: device_id: ${deviceID} site_key: ${siteKey} 
        start time: ${startTime}`);
        /* let formData = {};
         formData.jwt_token = identity.token;
         if (use !== undefined) {formData.use = use;}
         if (scope !== undefined) {formData.scope = scope;}
         console.log(JSON.stringify(formData)); */

        return $http({
          method: 'POST',
          // url: 'https://' + location.host + '/proxy/getMonitorValues',
          url: `https://${location.host}/int-fetcher/getIntervals`,
          data: formData,
          timeout: 60000, // TODO: this is way too long, paginate or something!
          responseType: 'text',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
          .then(response =>

            // console.log(data);
            $q.when(response.data),

          )
          .catch((error) => {
            console.log('getHistoricalData error');
            console.log(`getHistoricalData call failed: ${error.data}`);
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

      /*      getHistoricalData2(deviceID, siteKey, startTime) {
       let requestID = undefined;
       let completed = false;


       }, */

      getHistoricalData2(deviceID, siteKey, startTime) {
        const deferred = $q.defer();

        /* let formData = {};
         formData.jwt_token = identity.token;
         if (use !== undefined) {formData.use = use;}
         if (scope !== undefined) {formData.scope = scope;}
         console.log(JSON.stringify(formData)); */
        function loadAll(deviceID, siteKey, startTime, requestID) {
          const token = cognito.getToken('id');
          // let deferred = $q.defer();

          let formData = `device_id=${deviceID}&site_key=${siteKey}&start_time=${startTime}
        &jwt_token=${token}`;
          if (requestID) { formData += `&request_id=${requestID}`; }

          /* console.log(`historical data:: device_id: ${deviceID} site_key: ${siteKey}
        start time: ${startTime} request_id: `); */

          return $http({
            method: 'POST',
            // url: 'https://' + location.host + '/proxy/getMonitorValues',
            url: `https://${location.host}/int-fetcher/getIntervals2`,
            data: formData,
            timeout: 5000, // TODO: this is way too long, paginate or something!
            responseType: 'text',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
            .then((response) => {
              // console.log('HM then');
              // console.log(response.data);
              if (response.data.complete === false) {
                deferred.notify(response.data);
                loadAll(deviceID, siteKey, startTime, response.data.request_id);
              } else {
                deferred.resolve(response.data);
              }
            })
            .catch((error) => {
              console.log('getHistoricalData error');
              console.log(`getHistoricalData call failed: ${error.data}`);
              console.log(`error status:${error.status}`);


              if (error.status === 401) {
                console.log('authentication error, attempting re-authentication');
                authorization.authorize().then((result) => {
                  console.log(`authorization result: ${result}`);
                });
              }

              // TODO handle other error types (e.g. 503 - service unavailable)

              deferred.reject(error.status);
            });
        }
        loadAll(deviceID, siteKey, startTime);
        return deferred.promise;
      },

    };
  }]);
