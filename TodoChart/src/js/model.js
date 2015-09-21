	var Model = iCat.util.getModel({
		asyncfunc: function(fn){
			var that = this,
				api = that.get('api') || {},
				argus = that.get('ajaxargus'),
				chartConfig = that.get('chartConfig') || {};
			if(api.getChartsUrl){
				that.getData(api.getChartsUrl, argus, function(data){
					if(data.success && fn){
						var d = iCat.mixin(chartConfig, {series:data.result});
						fn({chartData:d});
					}
				});
			}
		}
	});