var homeModule = angular.module('HomeModule', ['ngCookies']);

homeModule.controller('HeaderController', function ($scope, $cookieStore) {
    var response = {
        "code": 0,
        "message": "Login Successful",
        "sessionId": "6ee57979-43bc-403f-9642-a07d1553196f",
        "data": {
            "username": "john.doe",
            "firstname": "John",
            "lastname": "Doe"
        }
    };
    
    this.userFullName=response.data.firstname+' '+response.data.lastname


});


