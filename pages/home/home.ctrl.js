	define(['app'], function(controllers) {
	controllers.controller('homeCtrl', ['$scope','$location', function($scope, $location) {
	$scope.templateUrl = "./pages/home/home.html";

	$scope.user={name:"", password:"", icon:"./imgs/icons/user.svg"};
	$scope.loginStatus = {
		accepted: false		
	};
	$scope.logIn=function()
	{
		if ($scope.user.name =="zhigao" && $scope.user.password=="zhu")
		{
			$scope.$parent.loggedInUser.name=$scope.user.name;
			$scope.$parent.loggedInUser.icon=$scope.user.icon;
			$location.path( "/production" );
		}
		else
		{
			$scope.user.name="";
			$scope.user.password ="";
		}
	}
}]);
});
