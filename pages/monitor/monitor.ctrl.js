define(['app', 'monitormodel'], function(controllers) {
    controllers.controller('monitorCtrl', ['$rootScope','$scope','$http','$mdMedia', '$mdDialog', function($rootScope,$scope,$http, $mdMedia, $mdDialog) {
	$scope.templateUrl = "./pages/monitor/monitor.html";
	function createChartOptions(){
		return {
            chart: {
                type: 'lineChart',
                height: 300,
                margin : {
                    top: 20,
                    right: 40,
                    bottom: 60,
                    left: 55
                },
                x: function(d){ return d.x; },
                y: function(d){ return d.y; },
                useInteractiveGuideline: true,
                xAxis: {
                    axisLabel: '时间',
                    tickFormat: function(d) {
							return d3.time.format('%H:%M:%S')(new Date(d));
					}
                },
                yAxis: {
                    axisLabel: '数值',
                    tickFormat: function(d){
                        return d3.format('.0f')(d);
                    },
                    axisLabelDistance: -10
                },
            	callback:function(chart){
            		chart.update();
            	}
            },
        };
	}
	$scope.prdOption1 = createChartOptions();
	$scope.prdOption2 = createChartOptions();
	$scope.api={};
	function updateLayout()
	{
		 setTimeout(function(){
	   // 	    var height = $('#prdPlotContainer').height();
	   // 	    height = Math.min(height, 700);
		 	// var h = height / 2-6;
	  	//  	 $scope.prdOption1.chart.height = h;
  		//  	 $scope.prdOption2.chart.height = h;
  		//  	 $("#plot1Container").height(height/2);
  		//  	 $("#plot2Container").height(height/2);
 	    	$scope.api.prdChart1.refresh();
			$scope.api.prdChart2.refresh();
		 }, 20)
	}
	$(window).resize(function(){
		updateLayout();
	});
	$scope.onsliderload = function() {
		 setTimeout(function(){
			$(window).trigger('resize');
		 	//updateLayout();
		 }, 20);

	};

	$scope.showSetting = function(ev) {
	    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
	    $mdDialog.show({
	      templateUrl: './pages/monitor/dlgsetting.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: useFullScreen,
	      controller: function SettingDialogController(scope, $mdDialog) {
			  scope.allGauges = angular.copy($scope.monitorModel.allGauges);
			  scope.closeSetting = function(){
			  	  $scope.monitorModel.allGauges = angular.copy(scope.allGauges);
			      $mdDialog.hide();
			  };
			  scope.resetSetting=function(){
				   scope.allGauges = angular.copy($scope.monitorModel.allGauges);
			  }
			  scope.cancel = function(){
			  	$mdDialog.hide();
			  }
			}
	    });
	    $scope.$watch(function() {
	      return $mdMedia('xs') || $mdMedia('sm');
	    }, function(wantsFullScreen) {
	      $scope.customFullscreen = (wantsFullScreen === true);
	    });
 	 };

 	 $scope.showProgress = function(ev) {
	    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
	    $mdDialog.show({
	      templateUrl: './pages/monitor/dlgprogress.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: useFullScreen,
	      controller: function ProgressDialogController(scope, $mdDialog) {
	      	scope.events = [{
				badgeClass: 'info',
				badgeIconClass: 'glyphicon-check',
				title: '巡井',
				contentHtml: '执行时间：2015年10月25日<br>执行人: Jack Ma<br>备注：设备老化'
			}, {
				badgeClass: 'info',
				badgeIconClass: 'glyphicon-credit-card',
				title: '问题确认并关井',
				contentHtml: '执行时间：2015年10月26日<br>执行人: Jack Ma<br>备注：设备老化'
			}, {
				badgeClass: 'info',
				badgeIconClass: 'glyphicon-credit-card',
				title: '通知管道维修',
				contentHtml: '执行时间：2015年10月27日<br>执行人: Jack Ma<br>备注：设备老化'
			},{
				badgeClass: 'info',
				badgeIconClass: 'glyphicon-credit-card',
				title: '维修完成',
				contentHtml: '执行时间：2015年10月28日<br>执行人: Jack Ma<br>备注：设备老化'
			},{
				badgeClass: 'default',
				badgeIconClass: 'glyphicon-credit-card',
				title: '开井继续生产',
				contentHtml: '执行时间：2015年10月29日<br>执行人: Jack Ma<br>备注：设备老化'
			}];
			  scope.close = function(){
			      $mdDialog.hide();
			  };
			}
	    });
	    $scope.$watch(function() {
	      return $mdMedia('xs') || $mdMedia('sm');
	    }, function(wantsFullScreen) {
	      $scope.customFullscreen = (wantsFullScreen === true);
	    });
 	 };

 	 $scope.generateReport=function()
 	 {
 	 	$http.defaults.useXDomain = true;
		//$http.defaults.withCredentials = true;
		delete $http.defaults.headers.common["X-Requested-With"];
		// $http.defaults.headers.common["Accept"] = "application/json";
		// $http.defaults.headers.common["Content-Type"] = "application/json";

 	 	var img = $('#equipmentPic');
 	 	console.log(img.attr('src'));
 	 	uploadBase64Image(img.attr('src'));

 	 }

	$scope.monitorModel = MonitoringModel.createNew();

	$scope.monitorModel.update();

	$scope.monitorModel.changedCallback = function()
	{
		if(!$scope.$$phase) {
			$scope.$apply();
		}
	}
	if (typeof $rootScope.activeWell != 'undefined')
	{
		$scope.monitorModel.activeWell = $rootScope.activeWell;
	}

	$scope.desktopManualFlex = function()
	{
		var isMobile = false; //initiate as false
		// device detection
		if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    		|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;
		return !isMobile;
	}

/**********************the content below are for uploading image to localhost which is not suitable currently*************/
	 //to File blob reference to:http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
 	 //http://techslides.com/save-svg-as-an-image
 	 function getBase64Image(url, width, height) {
 	 	var img = new Image();
 	 	img.src = url;

	    // Create an empty canvas element
	    var canvas = document.createElement("canvas");
	    canvas.width = img.naturalWidth ;
	    canvas.height = img.naturalHeight ;
	    if (typeof width != 'undefined')
	    {
	    	canvas.width = width;
	    	canvas.height = height;
	    }

	    // Copy the image contents to the canvas
	    var ctx = canvas.getContext("2d");
	    ctx.drawImage(img, 0, 0);

	    // Get the data-URL formatted image
	    // Firefox supports PNG and JPEG. You could check img.src to
	    // guess the original format, but be aware the using "image/jpg"
	    // will re-encode the image.
	    var dataURL = canvas.toDataURL("image/png");

	    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
	}

	function getBase64SVGImage()
	{
        var bBox = d3.select("#gaugeChart1 svg").node().getBBox()

		var html = d3.select("#gaugeChart1 svg")
        .attr("version", 1.1)
        .attr("width", bBox.width)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;
        $('#canvas').css("display", "block");
		 var canvas = document.createElement("canvas");
		 document.getElementById('canvas').innerHTML = '';
		 document.getElementById('canvas').appendChild(canvas);
		 $('#canvas').css("width", bBox.width + 20);

		 canvas.width = bBox.width + 20;
		 canvas.height = bBox.height ;

	  	 canvg(canvas, html, {
				ignoreMouse: true,
				ignoreAnimation: true,
				renderCallback: function() {
					var dataURL = canvas.toDataURL("image/png");
					var base64img = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
					postBase64Img(base64img);
				 },
			});
	  	 //var dataURL = canvas.toDataURL("image/png");
	  	 // setTimeout(function(){
	  	 // 	document.getElementById('canvas').innerHTML = '';
	  	 // }, 1000);
	    //return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
	}
	function postBase64Img(base64img){
		$http({
	        method: 'POST',
	        url: 'http://localhost:9000/api/imageupload/post',
	        headers: {
	            'Content-Type': undefined,
	            //'Content-Type': "application/json",
	            'Access-Control-Allow-Origin':'*',
	        },
	        data: {
	        		imgdata: base64img,
	        	},
	        transformRequest: function (data, headersGetter) {
	            var formData = new FormData();
	            angular.forEach(data, function (value, key) {
	                formData.append(key, value);
	            });
			    var headers = headersGetter();
	            delete headers['Content-Type'];

	            return formData;
	        }

		    })
		    .success(function (data) {
		    	console.log("success")
		    })
		    .error(function (data, status) {
		    	console.log("fail" + status);

	    });
	}
	function uploadBase64Image(url)
	{
 	 	//var base64img = getBase64Image(url);
 	 	//postBase64Img(base64img);
 	 	getBase64SVGImage();
	}
}]);
});