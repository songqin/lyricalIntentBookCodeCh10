// Invoke 'strict' JavaScript mode
'use strict';

// Configure the 'upload' module routes
angular.module('uploads').config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
		when('/api/uploads', {
			templateUrl: 'uploads/views/create-upload.client.view.html'
		}).
		when('/api/uploads/show', {
			templateUrl: 'uploads/views/view-upload.client.view.html'
		});
	}
]); 