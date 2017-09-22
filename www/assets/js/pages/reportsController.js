/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint max-len: ["error", 100] */
/* global angular AWS alert window */

angular.module('armsApp').controller('reports', ($scope, $rootScope, $stateParams, cognito) => {
  const params = {
    Bucket: 'switchboard.aercoustics.com',
    // Key:"R44G-44GS/ARMS-NVM-P13/2017/08-August/
    // 31/11/2017-08-31T11-28-48+00-00/2017-08-31T11-28-48+00-00_vEVT.html"
    Key: $stateParams.key,
  };

  // console.log($stateParams);

  if (!AWS.config.credentials) {
    cognito.setAWSCredentials();
  }

  const s3 = new AWS.S3();


  s3.getSignedUrl('getObject', params, (err, data) => {
    if (err) alert(`err: ${err}`);
    else window.location.replace(data);
    // console.log('data: ' + data);
  });
});
