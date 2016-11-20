define(['app'], function(directives) {
    directives.directive('baidumap', ['$http','$q', function($http, $q) {
	return {
		scope: {
      option: '=',
		},
		restrict: 'E',
		template: '<div id="mapContainer">',
		link: function(scope, http, element, attr) {
        //load baidu map api
        var mapApi = $q.defer();

        if (typeof window.baiduApiLoaded != 'undefined')
        {
        	setTimeout(function(){mapApi.resolve();}, 20);
        }
        else 
        {
	        var script = document.createElement('script');
	        var baiduLoader = [
	          'http://api.map.baidu.com/api?',
	          'v=', '2.0',
	          '&ak=', '3p1Wl37n5VGpWgbU3RtGgrfL',
	           '&callback=', "baiduApiLoaded"
	        ].join('');
	        script.src = baiduLoader;
	        document.body.appendChild(script);
	        window.baiduApiLoaded = function()
	        {
	          mapApi.resolve();
	        }
	    }
        mapApi.promise.then(function(){
          var m = new BMap.Map("mapContainer", {minZoom:8,maxZoom:10});    // 创建Map实例
			    m.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
			    m.enableAutoResize();
          m.centerAndZoom(new BMap.Point(125.8, 45.6), 9);  // 初始化地图,设置中心点坐标和地图级别

          if (typeof scope.option.callback != 'undefined')
          {
            scope.option.callback(m);
          }

      });
		}
	}
}]);
});