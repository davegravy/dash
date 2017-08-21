/*
function disposeTokens() {
    localStorage.removeItem('ARMS_idtoken');
    localStorage.removeItem('ARMS_accesstoken');
}


function verifyToken(token, use=undefined, scope=undefined, success, error) {

    let formData ="jwt_token=" + token;
    //console.log("formData:" + formData);
    if (use !== undefined) {formData += "&use=" + use;}
    if (scope !== undefined) {formData += "&scope=" + scope;}

    $.ajax({
        type: 'POST',
        url: 'https://10.0.1.26/proxy/verifyToken',
        data: formData,
        timeout: 5000,
        dataType: "text",
        success: success,
        error: error
    });

}

function getTokens(login,password, success, error){

    var authenticationData = {
        Username : login,
        Password : password};

    var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

    var poolData = {
        UserPoolId : 'us-east-1_C17D4qjgy', // Your user pool id here
        ClientId : '493284o06dmr8c62cms5l9um21' // Your client id here
    };

    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var userData = {
        Username : login,
        Pool : userPool};

    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails,
        {
            onSuccess: success,

            onFailure: error,

            newPasswordRequired: function(userAttributes, requiredAttributes) {
                // User was signed up by an admin and must provide new
                // password and required attributes, if any, to complete
                // authentication.

                // the api doesn't accept this field back
                delete userAttributes.email_verified;

                // Get these details and call
                var newPassword = "vI0letrose3";
                cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
            }

        }
    );
}



function loginSubmit(login, password, success, error) {



    getTokens(login, password, onGetTokenSuccess, onGetTokenError);

    function onVerifyTokenError(request, status, error) {
        console.log("onVerifyTokenError");
        console.log(request.status + ": " + JSON.stringify(request));
        disposeTokens();
        error(request, status, error);
    }

    function onVerifyTokenSuccess(data) {
        //console.log("onVerifyTokenSuccess");
        //console.log("data: " + data);
        //alert("Welcome Sub:" + JSON.parse(data)["sub"]);
        if (success)
            success(data);
    }

    function onGetTokenSuccess (result) {
        //console.log("Authenticated");
        localStorage.setItem('ARMS_accesstoken', result.getAccessToken().getJwtToken());
        let identity = {
            token: result.getIdToken().getJwtToken(),
            lastVerifiedTime: 0 //never been verified
        };

        localStorage.setItem('ARMS_identity', JSON.stringify(identity));
        //console.log("result2: " + JSON.stringify(result.getIdToken().getJwtToken()));

        verifyToken(result.getIdToken().getJwtToken(), "id", undefined , onVerifyTokenSuccess, onVerifyTokenError);
    }

    function onGetTokenError (err) {
        console.log("Error fetching tokens");
        error(err);
    }


}
*/
