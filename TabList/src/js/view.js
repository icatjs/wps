	var View = iCat.util.getView({
		widgetName: '<%=name%>',
		model: Model, //from model.js
		el: '.J_widgetWrap',
		tpl: '<%=template%>', //This is fixed, don't modify!
		style: '<%=css%>', //This is fixed, don't modify!
		events: {
			'click.toggle .J_infoList dt': 'toggleInfo'
		},
		toggleInfo: function(e){
			e.preventDefault();
			var me = $(e.currentTarget),
				panel = me.next('dd');
			if(me.hasClass('open')){
				me.removeClass('open')
				  .find('.fa').removeClass('fa-caret-down').addClass('fa-caret-right');
				panel.hide();
			} else {
				me.addClass('open')
				  .find('.fa').removeClass('fa-caret-right').addClass('fa-caret-down');
				panel.show();
			}
		}
	});