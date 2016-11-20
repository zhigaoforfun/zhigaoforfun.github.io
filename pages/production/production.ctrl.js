define(["app", "prdmodel", "querybuilder-zhcn", "bootstrap-slider", "bootstrap-datepicker"], 
	function(controllers) {
	var PrdModel = require('prdmodel');
	controllers.controller('productionCtrl', 
		['$rootScope','$scope','$window', '$http', '$q', '$location','$timeout', '$mdMedia', '$mdDialog', 'ReportService', 'ScriptService',
		function($rootScope, $scope, $window, $http, $q, $location, $timeout, $mdMedia, $mdDialog, ReportService, ScriptService) {
		$scope.templateUrl = "./pages/production/production.html";

		$scope.baiduOptions={
			callback: function(api){
			  $scope.baiduApi = api;
	          $scope.baiduApi.regionOverlays={};
	          $scope.baiduApi.wellOverlays={};
	          $scope.baiduApi.addEventListener("touchend",  function(e){
	              var reg = null;
	              for (var i = 0; i < $scope.prdModel.regions.length; i++)
	              {
	                var r = $scope.prdModel.regions[i];
	                var lng = e.point.lng;
	                var lat = e.point.lat;
	                if ( (lng >= r.longitude && lng <= r.longitude + r.width)
	                   && (lat >=r.latitude && lat <=r.latitude + r.height))
	                {
	                  reg = r;
	                }
	              }
	              if (reg != null)
	              {
	                updateRegion(reg);
	              }
	            }
	         );
	         $scope.$watch("prdModel.regions", baiduUpdateRegions, true);
		     $scope.$watch("prdModel.wells", baiduUpdateWells, true);
		     $scope.prdModel.updateRegions($http);
			 $scope.updateWells("all");
			}
		}

	   function baiduUpdateRegions(newVal, oldVal) {
	       if (typeof $scope.baiduApi != 'undefined' && typeof newVal != 'undefined')
	       {
	         var minx=127, maxx=127, miny=46, maxy=46;
	         for (var i = 0; i < newVal.length; i++)
	         {
	           var r = newVal[i];
	           var assemble = [];
	           minx =Math.min(minx, r.longitude);
	           maxx =Math.max(maxx, r.longitude + r.width);
	           miny =Math.min(miny, r.latitude);
	           maxy =Math.max(maxy, r.latitude + r.height);
	           assemble.push(new BMap.Point(r.longitude, r.latitude));
	           assemble.push(new BMap.Point(r.longitude + r.width, r.latitude));
	           assemble.push(new BMap.Point(r.longitude + r.width, r.latitude + r.height));
	           assemble.push(new BMap.Point(r.longitude, r.latitude + r.height));
	           var layer = new BMap.Polygon(assemble, {strokeColor:"blue", strokeWeight:2, strokeOpacity:0.5});
	           layer.region = r;
	           layer.addEventListener("click", baiduRegionClick);
	           $scope.baiduApi.addOverlay(layer);
	           $scope.baiduApi.regionOverlays[r.name] = layer;
	         }
	         minx = (minx + maxx) /2;
	         miny = (miny + maxy) /2;
	         //$scope.baiduApi.panTo(new BMap.Point(minx, miny));
	       }
	     }
	     function baiduUpdateWells(newVal, oldVal) {
	      if (typeof $scope.baiduApi != 'undefined' && typeof newVal != 'undefined')
	   		{
	      //Potential bug. If the baidu map initialization is later than the prdModel.wells change , the map may not be fully initialized yet
	 	    setTimeout(function(){
	       for (var prop in $scope.baiduApi.wellOverlays) {
	          if ($scope.baiduApi.wellOverlays.hasOwnProperty(prop)) {
	            $scope.baiduApi.wellOverlays[prop].wellActive = false;
	          }
	        }
	       for (var i = 0; i < newVal.length; i++)
	       {
	         var myIcon = new BMap.Symbol(BMap_Symbol_SHAPE_CIRCLE, {
	           scale: 3,
	           fillColor: "red",
	           fillOpacity: 0.8,
	           strokeWeight: 0.5 });
	         var w = newVal[i];
	         if (typeof $scope.baiduApi.wellOverlays[w.name] == 'undefined')
	         {
	           var point = new BMap.Point(w.longitude, w.latitude);
	           if (w.type == '生产井')
	           {
	              myIcon.style.fillColor = 'green';
	           }
	           else if (w.type == '探井')
	           {
	              myIcon.style.fillColor = 'yellow';
	           }
	           else if (w.type == '注水井')
	           {
	              myIcon.style.fillColor = 'purple';
	           }
	           var marker = new BMap.Marker(point, {icon: myIcon});  // 创建标注
	           $scope.baiduApi.addOverlay(marker); 
	           $scope.baiduApi.wellOverlays[w.name] = marker;
	           marker.well = w;
	           marker.addEventListener("click", baiduWellClick);
	           $scope.baiduApi.wellOverlays[w.name].wellActive = true;
	         }
	         else if (!$scope.baiduApi.wellOverlays[w.name].wellActive)
	         {
	            $scope.baiduApi.wellOverlays[w.name].wellActive = true;
	            $scope.baiduApi.addOverlay($scope.baiduApi.wellOverlays[w.name]);
	         }
	       };
	       for (var prop in $scope.baiduApi.wellOverlays) {
	          if ($scope.baiduApi.wellOverlays.hasOwnProperty(prop)) {
	            if (!$scope.baiduApi.wellOverlays[prop].wellActive)
	            {
	              $scope.baiduApi.removeOverlay($scope.baiduApi.wellOverlays[prop]);
	            }
	          }
	        }
	     }, 30); 
	   	}
	 }

	     function baiduRegionClick(target) {
	        $scope.prdModel.activeRegion = target.currentTarget.region;
	        $scope.$apply();
	     };
	     function baiduWellClick(target) {
	     	$scope.prdModel.activeWell = target.currentTarget.well;
	     	$scope.showActiveWell();    
	     };

		function createPrdChartOptions(){
			return {
				chart: {
					type: 'stackedAreaChart',
					height: 400,
					margin : {
						top: 20,
						right: 20,
						bottom: 30,
						left: 60
					},
					x: function(d){return d[0];},
					y: function(d){return d[1];},
					useVoronoi: false,
					clipEdge: true,
					duration: 200,
					useInteractiveGuideline: true,
					showControls:false,
					color:['blue', 'green', 'red'],
					xAxis: {
						showMaxMin: true,
						tickFormat: function(d) {
							return d3.time.format('%Y-%m-%d')(new Date(d))
						}
					},
					yAxis: {
						tickFormat: function(d){
							return d3.format(',.2f')(d);
						}
					},
					stacked: {
						dispatch: {
							areaClick: function(e){
							//$scope.$digest();
						},
					}
				},
				/*  it seems zoom doesn't work on dynamic data https://github.com/krispo/angular-nvd3/issues/296 */
				zoom: {
					enabled: true,
					scaleExtent: [1, 10],
					useFixedDomain: false,
					useNiceScale: false,
					horizontalOff: false,
					verticalOff: true,
					unzoomEventType: 'dblclick.zoom'
				},
				noData: "",
				callback:function(chart){
            		chart.update();
            	}

			},
			title: {
				enable: false,
				text: '产量/时间'
			}
		};
	}
	$scope.api = {};
	$scope.timePrdOptions = createPrdChartOptions();
	$scope.prdPieDayOptions = {
		chart: {
			type: 'pieChart',
			height: 400,
			margin : {
				top: 20,
				right: 20,
				bottom: 20,
				left: 20
			},
			x: function(d){return d.key;},
			y: function(d){return d.y;},
			showLabels: true,
			duration: 200,
			labelThreshold: 0.01,
			labelType: 'value',
			labelSunbeamLayout: true,
			color:['blue', 'green', 'red'],
			legend: {
				margin: {
					top: 10,
					right: 35,
					bottom: 5,
					left: 55
				}
			},
			noData: "",
			callback:function(chart){
            		chart.update();
            	}
		}
	};

	$scope.prdBarDayOptions = {
		chart: {
			type: 'multiBarChart',
			height: 400,
			margin : {
				top: 20,
				right: 20,
				bottom: 20,
				left: 60
			},
		//x: function(d){return d.label;},
		//y: function(d){return d.value + (1e-10);},
		showValues: true,
		valueFormat: function(d){
			return d3.format(',.2f')(d);
		},
		showControls:false,
		showLabels: true,
		duration: 200,
		color:['blue', 'green', 'red'],
		xAxis: {
			axisLabel: '月份',
			tickFormat: function(d) {
				return d3.time.format('%Y-%m-%d')(new Date(d))
			}

		},
		yAxis: {
			axisLabel: '产量',
			axisLabelDistance: -10,
			tickFormat: function(d){
				return d3.format(',.2f')(d);
			}
		},
		noData: "",
		callback:function(chart){
        	chart.update();
           	}
		}
	};

	$scope.prdBarDayData = [];
	$scope.prdPieDayData = [];
	$scope.timePrdData = [];

	$scope.regionGridOptions = { 
		data: 'prdModel.wells',
		enableColumnMenus: false,
		columnDefs:[
			{ field: 'name', displayName:'井名'},
			{ field: 'region', displayName:'区块'},
			{ field: 'type', displayName:'类型'},
			{ field: 'depth', displayName:'深度'},
			{ field: 'method', displayName:'生产方法'},
		]
	};


	$scope.showWells = function(ev) {
	    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
	    $mdDialog.show({
	      templateUrl: './pages/production/dlgwells.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: useFullScreen,
	      controller: function DialogController(scope, $mdDialog) {
	      			scope.wellGridOptions = { 
						data: "wells",
						enableColumnMenus: false,
						showSelectionCheckbox: true,
						enableRowSelection: true,
						enableSelectAll: true,
						selectionRowHeaderWidth: 35,
						multiSelect:true,
						columnDefs:[
						{ field: 'name', displayName:'井名',width: 100},
						{ field: 'region', displayName:'区块',width: 100},
						{ field: 'longitude', displayName:'经度', width: 50,  visible: false},
						{ field: 'latitude', displayName:'纬度',width: 50, visible: false},
						{ field: 'type', displayName:'类型',width: 100},
						{ field: 'depth', displayName:'深度',width: 100},
						{ field: 'casingsize', displayName:'套管尺寸',width: 100},
						{ field: 'pipesize', displayName:'油管尺寸',width: 100},
						{ field: 'nozzlesize', displayName:'油嘴尺寸',width: 100},
						{ field: 'bottomtemp', displayName:'井底温度',width: 100},
						{ field: 'toptemp', displayName:'井口温度',width: 100},
						{ field: 'method', displayName:'生产方法',width: 100},
						]
					};
					scope.wellGridOptions.onRegisterApi = function(gridApi){
						//set gridApi on scope
						scope.wellGridApi = gridApi;
						setTimeout(function(){
							scope.wellGridApi.selection.selectAllRows(scope.wellGridApi.grid );
						}, 10);
					};

			  		scope.wells = angular.copy($scope.prdModel.wells);	      	
					scope.closeWells = function(){
						var selections = scope.wellGridApi.selection.getSelectedRows();
			      		$mdDialog.hide();						
			      		if (selections.length == 0)
							return;
						var selectedWells = [];
						for (var i=0; i < selections.length; i++)
						{
							selectedWells.push(selections[i].name);
						}
						var dateRule = getDateQueryRule();
						$scope.prdModel.updateWellProduction($http, {name: selectedWells, start: dateRule.start, stop: dateRule.stop});
			  		};
			  		scope.cancel = function()
			  		{
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

	$scope.showActiveWell = function(ev) {
	    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
	    $mdDialog.show({
	      templateUrl: './pages/production/dlgactivewell.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: useFullScreen,
	      controller: function DialogController(scope, $mdDialog) {
			  scope.activeWell = angular.copy($scope.prdModel.activeWell);	      	
			  scope.closeActiveWell = function(){
			      $mdDialog.hide();
			  };
			  scope.monitorActiveWell=function(){
			  	  $mdDialog.hide();
			  	  $rootScope.activeWell = scope.activeWell;
				  $location.path("/monitor")
			  }
			  scope.popupImage=function(title, img)
			  {
			  	$mdDialog.hide();
			  	$scope.showWellImage(title, img);
			  }
  			  scope.popupLog=function()
			  {
			  	$mdDialog.hide();
			  	$scope.showLog();
			  }

			}
	    });
	    $scope.$watch(function() {
	      return $mdMedia('xs') || $mdMedia('sm');
	    }, function(wantsFullScreen) {
	      $scope.customFullscreen = (wantsFullScreen === true);
	    });
 	 };

 	 $scope.showLog = function(ev) {
	    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
	    $mdDialog.show({
	      templateUrl: './pages/production/dlgwelllog.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: useFullScreen,
    	  onComplete: function(){
    	  	ScriptService.loadScript("./logfiles/project.obf.js", "LgDisplayScript", function()
    	  		{
			      	new Window['LogDisplay']();
			      	$('.loading-banner').hide();
    	  		});
	      },
	      controller: function DialogController(scope, $mdDialog) {
			  scope.close = function(){
			      $mdDialog.hide();
			      $scope.showActiveWell();
			  };
			}
	    });
	    $scope.$watch(function() {
	      return $mdMedia('xs') || $mdMedia('sm');
	    }, function(wantsFullScreen) {
	      $scope.customFullscreen = (wantsFullScreen === true);
	    });
 	 };

 	 $scope.showWellImage = function(title,img, ev) {
	    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
	    $mdDialog.show({
	      templateUrl: './pages/production/dlgwellimage.html',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:false,
	      fullscreen: useFullScreen,
	      controller: function DialogController(scope, $mdDialog) {
	      	  scope.image = img;
	      	  scope.title = title;
			  scope.close = function(){
			      $mdDialog.hide();
			      $scope.showActiveWell();
			  };
			}
	    });
	    $scope.$watch(function() {
	      return $mdMedia('xs') || $mdMedia('sm');
	    }, function(wantsFullScreen) {
	      $scope.customFullscreen = (wantsFullScreen === true);
	    });
 	 };

	function getComponentHeight(percent, rows)
	{
		var h= Math.max(200, $('#content').height() * percent - rows * 8);
		return Math.min(400, h);
	}

	function updateLayout()
	{
		$scope.timePrdOptions.chart.height =  getComponentHeight(0.4, 2);
		$scope.prdPieDayOptions.chart.height = getComponentHeight(0.4, 2);
		$scope.prdBarDayOptions.chart.height = getComponentHeight(0.4, 2);
		$("#mapContainer").height(getComponentHeight(0.45, 2));
		$("#searchRegion").css('max-height', getComponentHeight(0.45, 2) + $("#searchRegion").css("margin").replace('px', '') * 2);

		if(!$scope.$$phase) {
			$scope.$apply();
		}
	}
	$scope.desktopManualFlex = function()
	{
		var isMobile = false; //initiate as false
		// device detection
		if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    		|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;
		return !isMobile;
	}


	// angular.element(document).ready(function () {
	// });
	$scope.prdModel = PrdModel.createNew();
	$scope.prdModel.changedCallback = function()
	{
		if(!$scope.$$phase) {
			$scope.$apply();
		}
	}
	$scope.$watch("prdModel.production", function(newVal, oldVal) {
		var dateRule = getDateQueryRule();
		var prdData = $scope.prdModel.generatePrdChartData(dateRule.start, dateRule.stop);
		$scope.prdBarDayData = prdData[0];
		$scope.prdPieDayData = prdData[1];
		$scope.timePrdData = prdData[2];

		//tricks to update the chart
		$scope.api.timePrdChart.refresh();
		$scope.api.timePrdChart.updateWithData($scope.timePrdData);
	});
	
	$scope.$watch("prdModel.compareWith", function(newVal, oldVal) {
		var dateRule = getDateQueryRule();
		var prdData = $scope.prdModel.generatePrdChartData(dateRule.start, dateRule.stop);
		$scope.prdBarDayData = prdData[0];
	});
	

	$scope.$watch("prdModel.activeRegion", function(newVal, oldVal) {
		$scope.updateWells($scope.prdModel.activeRegion.name);
	});

	$scope.$watch("prdModel.wells", function(newVal, oldVal) {
		if (oldVal.length ==0 && newVal.length == 0)
			return;
		var dateRule = getDateQueryRule();
		var selectedWells = [];
		for (var i = 0; i < $scope.prdModel.wells.length; i++)
		{
			selectedWells.push($scope.prdModel.wells[i].name);
		}
		$scope.prdModel.updateWellProduction($http, {name: selectedWells, start: dateRule.start, stop: dateRule.stop});
	});


	function getDateQueryRule()
	{
		var dateRule = {start:'2010-01-01', stop: new Date().toISOString().slice(0,10)};
		try
		{
			var rules  = $('#builder-widgets').queryBuilder('getRules').rules;
			for (var i = 0; i < rules.length; i++)
			{
				if (rules[i].id == 'date')
				{
					dateRule = rules[i];
					break;
				}
			}
			if (dateRule != null)
			{
				if (dateRule.operator == "between")
				{
					dateRule.start = dateRule.value[0];
					dateRule.stop = dateRule.value[1];
				}
				if (dateRule.operator == 'less')
				{
					dateRule.start = '2010-01-01';
					dateRule.stop = dateRule.value;
				}
				if (dateRule.operator == 'greater')
				{
					dateRule.start = dateRule.value;
					dateRule.stop = new Date().toISOString().slice(0,10);
				}
			}
		}
		catch(e)
		{
			console.log(e);
		}
		return dateRule;
	}

	function getRangeQueryRule(type)
	{
		var rule = {min: 0.01 , max: 100000000};
		try
		{
			var rules  = $('#builder-widgets').queryBuilder('getRules').rules;
			for (var i = 0; i < rules.length; i++)
			{
				if (rules[i].id == type)
				{
					rule = rules[i];
					break;
				}
			}
			if (rule != null)
			{
				if (rule.operator == "between")
				{
					rule.min = rule.value[0];
					rule.max = rule.value[1];
				}
				if (rule.operator == 'less')
				{
					rule.min = 0.01;
					rule.max = rule.value;
				}
				if (rule.operator == 'greater')
				{
					rule.min = rule.value;
					rule.max = 100000000
				}
			}
		}
		catch(e)
		{}
		return rule;
	}

	function getValueQueryRule(type)
	{
		var rule = {value: 'all'};
		try
		{
			var rules  = $('#builder-widgets').queryBuilder('getRules').rules;
			for (var i = 0; i < rules.length; i++)
			{
				if (rules[i].id == type)
				{
					rule = rules[i];
					break;
				}
			}
		}
		catch(e)
		{}
		return rule;
	}

	$scope.updateWells = function(regionName)
	{
		var dateRule = getDateQueryRule();
		var oilRule = getRangeQueryRule('oil');
		var gasRule = getRangeQueryRule('gas');
		var typeRule = getValueQueryRule('welltype');
		$scope.prdModel.updateWells($http, {name:regionName, start: dateRule.start, stop:dateRule.stop, 
				minOil:oilRule.min, maxOil: oilRule.max, minGas: gasRule.min, maxGas: gasRule.max, welltype: typeRule.value});
	}

	$scope.queryProduction = function(){
		var regionRule = getValueQueryRule('region');
		$scope.updateWells(regionRule.value);
	}

	var DEFSTART = '2015-11-01';
	var DEFSTOP = '2015-12-31';
	$scope.onsliderload = function() {
		var rules_widgets = {
			condition: 'AND',
			rules: [{
				id: 'region',
				operator: 'equal',
				value: 'all'
			},
			{
				id: 'date',
				operator: 'between',
				value: [DEFSTART,DEFSTOP]
			},
			{
			    id: 'oil',
			    operator: 'greater',
			    value: 80
	    	}]
		};
		$('#builder-widgets').on('afterCreateRuleInput.queryBuilder', function(e, rule) {
			if (rule.filter.plugin == 'selectize') {
				rule.$el.find('.rule-value-container').css('min-width', '200px')
				.find('.selectize-control').removeClass('form-control');
			}
		});

		$('#builder-widgets').queryBuilder({
			plugins: {
			    'bt-tooltip-errors': { delay: 100 }
			    },
			allow_groups: false,
			filters: [{
				id: 'region',
				label: '区块',
				lang_code:'zh-CN',
				operators: ['equal'],
				type: 'string',
				input: 'select',
				values: {
					'all': '全部',
					'A': 'A',
					'B': 'B',
					'C': 'C'
				},
			},
			{
				id: 'welltype',
				label: '井类型',
				lang_code:'zh-CN',
				operators: ['equal'],
				type: 'string',
				input: 'select',
				values: {
					'all': '全部',
					'生产井': '生产井',
					'探井': '探井',
					'注水井': '注水井'
				},
			},
			{
				id: 'date',
				label: '日期',
				type: 'date',
				validation: {
					format: 'YYYY-MM-DD'
				},
				plugin: 'datepicker',
				plugin_config: {
					format: 'yyyy-mm-dd',
					todayBtn: 'linked',
					todayHighlight: true,
					autoclose: true
				},
				operators: ['between', 'greater', 'less'],
				lang_code:'zh-CN'
			},
			{
			    id: 'oil',
			    label: '产油量',
			    type: 'double',
			    operators: ['greater', 'less', 'between'],
			    validation: {
			      min: 0,
			      step: 0.1
			  }
			},
			{
			    id: 'gas',
			    label: '产气量',
			    type: 'double',
			    operators: ['greater', 'less', 'between'],
			    validation: {
			      min: 0,
			      step: 10
			  }
			},
			],
		rules: rules_widgets
	});

		updateLayout();

	};

	//$(window).on("resize.doResize",	updateLayout());

	 $scope.generateReport=function()
 	 {
 	 	ReportService.generateReport();
 	 }

	$scope.$on("$destroy",function (){
		 //$(window).off("resize.doResize"); //remove the handler added earlier
		});
}]);
});