	var Model = iCat.util.getModel({
		asyncfunc: function(fn){
			var that = this,
				api = that.get('api') || {},
				argus = that.get('ajaxargus');
			if(api.getListUrl){
				that.getData(api.getListUrl, argus, function(data){
					fn && fn(data);
				});
			}
		}
	});