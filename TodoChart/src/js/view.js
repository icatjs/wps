	var View = iCat.util.getView({
		widgetName: '<%=name%>',
		model: Model, //from model.js
		el: '.J_widgetWrap',
		tpl: '<%=template%>', //This is fixed, don't modify!
		style: '<%=css%>', //This is fixed, don't modify!
		events: {
		},
		setPlugins: function(data){
			$('.J_chartShow').highcharts(data.chartData);
		},

		widgetShow: function(){
			var model = this.model,
				md = model.get('MergeData');
			$('#'+(md.modalId || 'myModal')).modal('show');
			this.refresh();
		}
	});