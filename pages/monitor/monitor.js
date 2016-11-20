var Gauge ={
	createNew:function(_name, _unit, _base, _warning, _dangerous)
	{
		var gauge ={};
		gauge.name = _name;
		gauge.unit = _unit;
		gauge.value = 0;
		gauge.base = _base;
		gauge.warning = _warning;
		gauge.dangrous = _dangerous;
		gauge.update = function()
		{
			var gap = this.dangrous - this.base;
			this.value = this.base + Math.floor(Math.random() * gap * 1.05)
			if (this.value >= this.dangrous)
			{
				this.status = 2;
			} else if (this.value >= this.warning)
			{
				this.status = 1;
			} else
			{
				this.status = 0;
			}
		}
		return gauge;
	}

}

var MonitoringModel ={
	createNew: function()
	{
		
		var monitorModel ={};
		monitorModel.activeWell = {"name":"PA1","region":"A","type":"生产井","depth":3348.7,"longitude":125.06,"latitude":45.63,"casingsize":139.7,"pipesize":73,"nozzlesize":8,"bottomtemp":88.3,"toptemp":54.2,"prdlayer":["沙1","沙2"],"prdlayercount":2,"method":"电泵"};


		monitorModel.allGauges = [
			Gauge.createNew("井底压力", "psi", 100, 120, 125),
			Gauge.createNew("井中压力", "psi", 200, 240, 250),
			Gauge.createNew("井口压力", "psi", 300, 360, 375),
			Gauge.createNew("井底温度", "deg C", 100, 120, 125),
			Gauge.createNew("井口温度", "deg C", 20, 35, 40),
			Gauge.createNew("井底频率", "hz", 40, 55, 60)

		];

		function initData(keys) {
			var opts = [];
			for (var i = 0; i < keys.length; i++)
			{
				opts.push({
			      values: [],      //values - represents the array of {x,y} data points
			      key: keys[i], //key  - the name of the series.
			    });
			}
			return opts;
		}
		
		function createData(){
				var split = Math.floor(monitorModel.allGauges.length / 2);
				var d = new Date();
				for (var i = 0 ; i < monitorModel.allGauges.length; i++)
				{
					monitorModel.allGauges[i].update();
					if (i < split)
					{
						monitorModel.prdData1[i].values.push({x: d, y:monitorModel.allGauges[i].value});
					}
					else
					{
						monitorModel.prdData2[i-split].values.push({x: d, y:monitorModel.allGauges[i].value});
					}
				}
		}

		monitorModel.init = function(){
			var split = Math.floor(monitorModel.allGauges.length / 2);
			var series = [];
			for (var i = 0 ; i < monitorModel.allGauges.length; i++)
			{
				series.push(monitorModel.allGauges[i].name);
			}
			monitorModel.prdData1 = initData(series.slice(0, split));
			monitorModel.prdData2 = initData(series.slice(split, monitorModel.allGauges.length));
			createData();
		}

		monitorModel.changedCallback = function(){};

		monitorModel.update = function()
		{
			setInterval(function(){
				createData();
				monitorModel.changedCallback();
			}, 2000);
		}

		monitorModel.init();
		return monitorModel;
	}
}


