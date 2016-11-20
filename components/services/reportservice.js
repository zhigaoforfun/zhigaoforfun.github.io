define(['app'], function(services) {
	services.service('ReportService',  ['$http','$q', function($http, $q){
   	//$(window).on("resize.doResize",	updateLayout());

	 this.generateReport=function()
 	 {
 	 	$http.defaults.useXDomain = true;
		//$http.defaults.withCredentials = true;
		delete $http.defaults.headers.common["X-Requested-With"];
		// $http.defaults.headers.common["Accept"] = "application/json";
		// $http.defaults.headers.common["Content-Type"] = "application/json";

		//var rect = getPositionOnWindow("#oilplot1Container");
 	 	generateSnapshot(getPositionOnWindow("#oilplot1Container"), "totalprd")
 	 	.then(function(){
 	 			generateSnapshot(getPositionOnWindow("#oilplot2Container"), "prdcompare")})
 	 	.then(function(){
 	 			generateSnapshot(getPositionOnWindow("#oilplot3Container"), "totalprdpie");	
 	 		})
 	 	.then(function(){
 	 			var url = 'http://localhost:9000/api/report/generate';
 	 			postCommand(url);
 	 		});
 	 }
	
	function generateSnapshot(rect, name){
		var url = 'http://localhost:9000/api/report/snapshot?' + 'x='+rect.x +'&y='+rect.y+'&width='+rect.width + '&height='+rect.height + '&name='+name;
		return postCommand(url);
	}

	function postCommand(url)
	{
		$http.defaults.useXDomain = true;
		//$http.defaults.withCredentials = true;
		delete $http.defaults.headers.common["X-Requested-With"];
		var deferred = $q.defer();
		$http({
	        method: 'POST',
	        url: url,
	        headers: {
	            //'Content-Type': 'application/x-www-form-urlencoded',
	            //'Content-Type': "application/json",
	            'Content-Type': undefined,
	            'Access-Control-Allow-Origin':'*',
	        	}
		    })
		    .success(function (data) {
			    deferred.resolve();
		    })
		    .error(function (data, status) {
		    	deferred.reject();
		    	alert("生成报表失败：" + data);

	    });
		return deferred.promise;
	}

	function getPositionOnWindow(selector)
	{
		var offset = $(selector).offset();
		var posY = (offset.top - $(window).scrollTop()) | 0;
		var posX = (offset.left - $(window).scrollLeft()) | 0; 
		var eWidth = $(selector).width()|0;
		var eHeight = $(selector).height()|0;
		console.log("h:" + eHeight);
		return {x: posX, y: posY, width: eWidth, height: eHeight}
	}
}]);
});