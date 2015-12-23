var loginModule = angular.module('LoginModule', ['angular-md5']);

loginModule.service("Helper", function (md5) {

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


function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null,
            str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
            );
}

loginModule.controller('LoginController', function ($http, Helper) {
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

        console.log(data.token);

        $http.post('http://localhost:8080/SRA/authenticate', data)
                .then(function (response) {
                    var code = response.data.code;
                    if (code == 0) {
                        document.location.href = 'home.html';
                    } else {

                    }
                    console.log(response);
                }, function (response) {
                    console.log('Error in post method');
                });
    }

});


