define(['moment'], function(moment) {
    var PrdModel = {
        createNew: function() {
            //var ESServiceURL ="http://192.168.231.128:8088/";
            //var ESServiceURL ="http://192.168.56.101:8088/";
            var ESServiceURL = "http://45.118.134.114:8088/";

            var prdModel = {};
            prdModel.regions = [];
            prdModel.wells = [];
            //production, in [[oil, gas, water]...]
            prdModel.production = [];
            prdModel.activeRegion = {};
            prdModel.activeWell = {
                "name": "PA3",
                "type": "生产井",
                "depth": 3121.6,
                "longitude": 125.07,
                "latitude": 45.68,
                "casingsize": 139.7,
                "pipesize": 73,
                "nozzlesize": 7,
                "bottomtemp": 80.6,
                "toptemp": 36.6,
                "prdlayer": ["沙1", "沙2"],
                "prdlayercount": 2,
                "method": "抽油机"
            };
            //compareWith, can be month or week.
            prdModel.compareWith = "month";

            //callback when data changed.
            prdModel.changedCallback = function() {};

            //get regions
            prdModel.updateRegions = function($http) {
                $http.defaults.useXDomain = true;
                $http.get(ESServiceURL + 'region').
                then(function(response) {
                    prdModel.regions = response.data;
                    prdModel.changedCallback();

                }, function(response) {
                    console.log('failed to get regions');
                });
            }

            //update wells that meets the query conditions including oil/gas production in date range, region, etc.
            prdModel.updateWells = function($http, region) {
                $http.defaults.useXDomain = true;
                var url = ESServiceURL + "region/" + region.name + "/well?";
                if (typeof region.start != 'undefined' && typeof region.stop != 'undefined') {
                    url = url + 'start=' + region.start + '&stop=' + region.stop;
                };
                if (typeof region.minOil != 'undefined' && typeof region.maxOil != 'undefined') {
                    url = url + '&minoil=' + region.minOil + '&maxoil=' + region.maxOil;
                };
                if (typeof region.minGas != 'undefined' && typeof region.maxGas != 'undefined') {
                    url = url + '&mingas=' + region.minGas + '&maxgas=' + region.maxGas;
                };

                if (typeof region.welltype != 'undefined') {
                    url = url + '&wtype=' + region.welltype;
                };

                $http.get(url).
                then(function(response) {
                    prdModel.wells = response.data;
                    prdModel.changedCallback();
                }, function(response) {
                    console.log('failed to get wells');
                });
            }

            //get the production of a well list within a period of time
            prdModel.updateWellProduction = function($http, well) {
                $http.defaults.useXDomain = true;
                var url = ESServiceURL + "production/well";
                var qs = "?";
                if (well.name instanceof Array) {
                    if (well.name.length == 0) {
                        qs = qs = qs + "id=undefined&";
                    }

                    for (var i = 0; i < well.name.length; i++) {
                        qs = qs + "id=" + well.name[i] + "&";
                    }
                } else {
                    url = url + "/" + well.name;
                }
                if (typeof well.start != 'undefined' && typeof well.stop != 'undefined') {
                    qs = qs + 'start=' + well.start + '&stop=' + well.stop;
                };
                url = url + qs;

                $http.get(url).
                then(function(response) {
                    prdModel.production = response.data;
                    prdModel.changedCallback();
                }, function(response) {
                    console.log('failed to get wells');
                });
            }

            //generate chart data based on the current produciton data in a time range.
            prdModel.generatePrdChartData = function(start, stop) {
                var oil = [],
                    gas = [],
                    water = [];
                var production = prdModel.production;
                var prdBarDayData = [];
                var prdPieDayData = [];
                var timePrdData = [];

                if (production.length > 0) {
                    for (var i = 0; i < production.length; i++) {
                        var d = new Date(production[i].date).getTime();
                        oil.push([d, production[i].value[0]]);
                        gas.push([d, production[i].value[1] / 100]);
                        water.push([d, production[i].value[2]]);
                    }

                    function generatePrdChartDataWithinDate(prds, d1, d2, idx) {
                        var v = 0;
                        for (var i = 0; i < prds.length; i++) {
                            var d = new Date(prds[i].date);
                            if (d >= d1 && d < d2) {
                                v += prds[i].value[idx]
                            }
                        }
                        return v;
                    }
                    var d3 = moment(new Date(stop));
                    var d2 = moment(new Date(stop));
                    var d1 = moment(new Date(stop));
                    if (prdModel.compareWith == 'month') {
                        d2 = d2.subtract('months', 1).toDate();
                        d1 = d1.subtract('months', 2).toDate();
                    } else {
                        d2 = d2.subtract('weeks', 1).toDate();
                        d1 = d1.subtract('weeks', 2).toDate();
                    }

                    var barPrdData = [];
                    barPrdData.push({
                        key: "水(百吨)",
                        values: [{
                            x: d2,
                            y: generatePrdChartDataWithinDate(production, d1, d2, 2) / 100
                        }, {
                            x: d3,
                            y: generatePrdChartDataWithinDate(production, d2, d3, 2) / 100
                        }]
                    });
                    barPrdData.push({
                        key: "油(百吨)",
                        values: [{
                            x: d2,
                            y: generatePrdChartDataWithinDate(production, d1, d2, 0) / 100
                        }, {
                            x: d3,
                            y: generatePrdChartDataWithinDate(production, d2, d3, 0) / 100
                        }]
                    });
                    barPrdData.push({
                        key: "汽(万立方米)",
                        values: [{
                            x: d2,
                            y: generatePrdChartDataWithinDate(production, d1, d2, 1) / 10000
                        }, {
                            x: d3,
                            y: generatePrdChartDataWithinDate(production, d2, d3, 1) / 10000
                        }]
                    });
                    prdBarDayData = barPrdData;

                    prdPieDayData = [{
                        key: '水(百吨)',
                        y: generatePrdChartDataWithinDate(production, d2, d3, 2) / 100
                    }, {
                        key: '油(百吨)',
                        y: generatePrdChartDataWithinDate(production, d2, d3, 0) / 100
                    }, {
                        key: '汽(万立方米)',
                        y: generatePrdChartDataWithinDate(production, d2, d3, 1) / 10000
                    }];
                    timePrdData = [{
                        key: '水(吨)',
                        values: water
                    }, {
                        key: '油(吨)',
                        values: oil
                    }, {
                        key: '汽(百立方米)',
                        values: gas
                    }, ];
                } else {
                    var barPrdData = [];
                    barPrdData.push({
                        key: "水(百吨)",
                        values: [{
                            x: new Date(start),
                            y: 0
                        }, {
                            x: new Date(stop),
                            y: 0
                        }]
                    });
                    barPrdData.push({
                        key: "油(百吨)",
                        values: [{
                            x: new Date(start),
                            y: 0
                        }, {
                            x: new Date(stop),
                            y: 0
                        }]
                    });
                    barPrdData.push({
                        key: "汽(万立方米)",
                        values: [{
                            x: new Date(start),
                            y: 0
                        }, {
                            x: new Date(stop),
                            y: 0
                        }]
                    });
                    prdBarDayData = barPrdData;

                    prdPieDayData = [{
                        key: '水(百吨)',
                        y: []
                    }, {
                        key: '油(百吨)',
                        y: []
                    }, {
                        key: '汽(万立方米)',
                        y: []
                    }];

                    timePrdData = [{
                        key: '水(吨)',
                        values: [
                            [new Date(start).getTime(), 0],
                            [new Date(stop).getTime(), 0]
                        ]
                    }, {
                        key: '油(吨)',
                        values: [
                            [new Date(start).getTime(), 0],
                            [new Date(stop).getTime(), 0]
                        ]
                    }, {
                        key: '汽(百立方米)',
                        values: [
                            [new Date(start).getTime(), 0],
                            [new Date(stop).getTime(), 0]
                        ]
                    }, ];
                }
                return [prdBarDayData, prdPieDayData, timePrdData]
            };
            return prdModel;
        }
    }
    return PrdModel;
});