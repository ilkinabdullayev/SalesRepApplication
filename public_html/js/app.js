var srModule = angular.module('SalesReportModule', ['angular-md5', 'ngCookies', 'ngRoute']);

srModule.config(function ($routeProvider) {
    $routeProvider

            // route for the home page
            .when('/', {
                templateUrl: 'pages/login.html',
                controller: 'LoginController as login'
            })

            // route for the home page
            .when('/master', {
                templateUrl: 'pages/master.html',
                controller: 'MasterController as master'
            })

            // route for the detail page
            .when('/detail', {
                templateUrl: 'pages/detail.html',
                controller: 'DetailController as detail'
            });
});

srModule.service('dataSharing', function () {

    // private variable
    var _dataObj = {};

    // public API
    this.dataObj = _dataObj;
})

srModule.factory('DataService', function ($http, $q, dataSharing) {
    return {
        setData: function (key, data) {
            dataSharing.dataObj[key] = data;
        },
        getData: function (key) {
            return dataSharing.dataObj[key];
        },
        login: function (data) {
            return $http.post('http://localhost:8080/SRA/authenticate', data)
                    .then(function (response) {
                        if (typeof response.data === 'object') {
                            return response.data;
                        } else {
                            return $q.reject(response.data);
                        }

                    }, function (response) {
                        return $q.reject(response.data);
                    });
        },
        logout: function (data) {
            return $http.post('http://localhost:8080/SRA/logout', data)
                    .then(function (response) {
                        if (typeof response.data === 'object') {
                            return response.data;
                        } else {
                            return $q.reject(response.data);
                        }

                    }, function (response) {
                        return $q.reject(response.data);
                    });
        },
        getAllCustomer: function (data) {
            return $http.post('http://localhost:8080/SRA/customer/list', data)
                    .then(function (response) {
                        if (typeof response.data === 'object') {
                            return response.data;
                        } else {
                            return $q.reject(response.data);
                        }

                    }, function (response) {
                        return $q.reject(response.data);
                    });
        },
        getCustomerDetails: function (data) {
            return $http.post('http://localhost:8080/SRA/customer/details', data)
                    .then(function (response) {
                        if (typeof response.data === 'object') {
                            return response.data;
                        } else {
                            return $q.reject(response.data);
                        }

                    }, function (response) {
                        return $q.reject(response.data);
                    });
        }
    };

});

srModule.service("Helper", function (md5) {

    this.md5Convert = function (value) {
        return md5.createHash(value);
    }

    this.hexToBase64 = function (value) {
        return btoa(String.fromCharCode.apply(null,
                value.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
                );
    }

    this.generateToken = function (length, chars) {
        var mask = '';
        if (chars.indexOf('a') > -1)
            mask += 'abcdefghijklmnopqrstuvwxyz';
        if (chars.indexOf('A') > -1)
            mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (chars.indexOf('#') > -1)
            mask += '0123456789';
        if (chars.indexOf('!') > -1)
            mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
        var result = '';
        for (var i = length; i > 0; --i)
            result += mask[Math.round(Math.random() * (mask.length - 1))];
        return result;
    }

});

srModule.controller('LoginController', function ($http, $scope, $cookies, Helper, DataService) {
    this.user = {};

    this.submit = function () {
        var data = {};
        data.token = Helper.generateToken(32, '#aA');

        var md5Password = Helper.md5Convert(this.user.password);
        var base64Password = Helper.hexToBase64(md5Password);

        data.user = this.user;
        data.user.password = base64Password;

        var md5Digest = Helper.md5Convert(this.user.username + ',' + base64Password + ',' + data.token);
        var base64Digest = Helper.hexToBase64(md5Digest);

        data.digest = base64Digest;

        DataService.login(data)
                .then(function (response) {
                    var code = response.code;
                    if (code == 0) {
                        $cookies.put('responseLogin', JSON.stringify(response));
                        document.location.href = '#/master';
                    } else {
                        $scope.message = response.message;
                    }
                }, function (error) {
                    console.log(error);
                });
    }

});

srModule.controller('MasterController', function ($scope, $cookies, DataService) {
    var responseLogin = JSON.parse($cookies.get('responseLogin'));

    this.sort = 'id';

    this.logout = function () {
        DataService.logout({'sessionId': responseLogin.sessionId})
                .then(function (response) {
                    console.log(response);
                    document.location.href = '#/';
                }, function (error) {
                    console.log(error);
                });
    }

    this.loadCustomerList = function () {
        DataService.getAllCustomer({'sessionId': responseLogin.sessionId})
                .then(function (response) {
                    console.log(response.data);
                    $scope.customers = response.data;
                }, function (error) {
                    console.log(error);
                });
    }

    this.loadCustomerList();

    this.sortCustomerList = function () {
        if (this.sort == 'id') {
            this.sort = '-id';
        } else if (this.sort == '-id') {
            this.sort = 'id';
        }
    }

    this.selectRow = function (row) {
        console.log(row);
        $cookies.put('selectCustomer', JSON.stringify(row));
        document.location.href = '#/detail';
    }
});


srModule.controller('DetailController', function ($scope, $cookies, DataService) {
    var responseLogin = JSON.parse($cookies.get('responseLogin'));
    var selectCustomer = JSON.parse($cookies.get('selectCustomer'));

    this.customerName = selectCustomer.customername;

    DataService.getCustomerDetails({
        'sessionId': responseLogin.sessionId,
        'customerid': selectCustomer.id+''
    })
            .then(function (response) {
                console.log(response);
                $scope.customerdetails = response.data;
            }, function (error) {
                console.log(error);
            });

    this.logout = function () {
        DataService.logout({'sessionId': responseLogin.sessionId})
                .then(function (response) {
                    console.log(response);
                    document.location.href = '#/';
                }, function (error) {
                    console.log(error);
                });
    }
});



