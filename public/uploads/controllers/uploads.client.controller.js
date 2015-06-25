// Invoke 'strict' JavaScript mode
'use strict';

// Create the 'uploads' controller
angular.module('uploads').controller('MyCtrl', ['$scope', 'Upload', 'Authentication', function ($scope, Upload, Authentication) {
    // Expose the Authentication service
    $scope.authentication = Authentication; 
    $scope.image = $scope.authentication.user.profileUrl;
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });

    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: 'api/uploads',
                    method: "POST",
                    // fields: {'username': $scope.username},
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    file.progress = progressPercentage;
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + ' uploaded. Response: ' + data );
                });
            }
        }
    };
}]);
