(function(root, iCat){
	iCat = root.ICAT || {};
	var Model = iCat.util.getModel({
		asyncfunc: function(fn){
			var that = this,
				api = that.get('api') || {},
				argus = that.get('ajaxargus');
			if(api.testUrl){
				that.getData(api.testUrl, argus, function(data){
					fn && fn(data);
				});
			} else {
				fn && fn(that.get('MergeData'));
			}
		},

		getColor: function(text){
			var colors = ['red', 'blue', 'green', 'yellow', 'gray', 'brown'],
				index = Math.floor(Math.random()*6),
				color = colors[index];
			if(this.sendMessage){
				this.sendMessage('testMsg', {
					text: text, color: color
				});
			}
			return color;
		},

		protocols: {
			getReply: function(msg){
				console.log(msg);
				//this.set('changeData', msg);
			}
		}
		// This(↑) is an example only, please change the source code to yours...
		// your code...
	});
	var View = iCat.util.getView({
		widgetName: 'BaseWidget',
		model: Model, //from model.js
		el: '.J_widgetWrap',
		tpl: '<widget class=\"BaseWidget-wrap\"><!--Define the macro--> <define name=\"list\"> <%_.each(o.results, function(item){%> <span class=\"item\"><%-item.name%></span> <%})%> </define> <!--backbone template--> <%if(o.displayType==1){%> <%if(o.__toolRender__){%> <span class=\"J_handleBtn\"><!-- data-toggle=\"modal\" data-target=\"#myModal\"--> <i title=\"<%-o.btnText%>\" class=\"fa <%-o.cla? o.cla : \'fa-bookmark\'%>\"></i> <!--<b title=\"<%-o.btnText%>\">click me...</b>--> </span> <%}else{%> <div class=\"modal fade\" id=\"<%-o.modalId || \'myModal\'%>\" role=\"dialog\"> <div class=\"modal-dialog\" role=\"document\"> <div class=\"modal-content\"> <div class=\"modal-header\"> <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"> <span aria-hidden=\"true\">&times;</span> </button> <h4 class=\"modal-title\" id=\"myModalLabel\">Modal title</h4> </div> <div class=\"modal-body\"> <div class=\"panel\" lazy-load-wrap=\"list\" data-from=\"BaseWidget\"><%-o.micro.list()%></div> </div> </div> </div> </div> <%}%> <%}else if(o.displayType==2){%> <%if(o.__toolRender__){%> <span class=\"J_handleBtn\"> <b title=\"<%-o.btnText%>\">click me...</b> </span> <%}else{%> <div class=\"panel\"><%-o.micro.list()%></div> <%}%> <%}else{%> <div class=\"panel\"> <h3><%-o.md_title || \'变色魔方\'%>： <b class=\"text-muted\"><%-o.md_desc? o.md_desc : \'多次点击模块 会改变颜色\'%></b></h3> <%-o.micro.list()%> </div> <%}%></widget>', //This is fixed, don't modify!
		style: '1^2^9^2^95^2^79^46^13^22^28^60^0^0^3^28^52^74^26^19^8^28^14^77^31^12^24^14^1^30^88^23^2^7^11^23^22^30^7^0^94^12^50^11^69^67^1^24^90^19^85^66^89^29^6^4^73^5^4^24^31^75^10^2^7^5^5^9^48^73^14^14^4^67^89^6^13^66^2^14^30^17^20^6^15^11^78^76^89^5^6^73^22^28^48^2^12^21^73^15^75^13^27^8^4^75^31^12^93^30^21^87^3^19^28^25^15^8^11^14^122^15^4^5^13^9^64^30^24^4^18^12^8^17^20^52^0^31^9^50^16^15^14^1^16^84^55^21^12^17^73^66^94^2^1^8^26^75^5^86^65^27^0^30^11^12^23^70^11^11^16^13^47^10^87^80^89^28^86^30^24^4^18^12^8^17^20^52^0^31^9^50^16^15^14^1^16^84^55^21^12^17^73^66^94^2^1^8^26^75^5^86^26^88^21^9^20^17^84^6^28^16^1^29^59^4^2^13^6^30^20^64^86^84^79^80^11^10^84^2^76^31^5^31^28^81^88^86^20^1^123^1^2^15^29^65^89^6^6^10^30^31^87^11^85^4^12^13^0^24^14^2^13^3^1^13^110^37^12^18^12^59^71^7^8^8^2^70^26^23^91^6^65^66^28^4^23^14^5^68^74^16^52^2^0^26^13^5^93^19^3^12^15^81^4^11^86^31^15^9^65^7^21^4^10^15^68^88^41^10^29^14^27^24^79^13^27^86^27^2^3^72^77^31^5^24^4^95^75^91^25^28^95^9^33^3^9^8^7^11^20^83^79^92^70^27^21^94^86^31^15^9^65^13^28^2^14^12^16^67^115^87^29^25^82^1^79^17^8^4^24^81^88^21^66^77^21^9^20^17^84^10^5^13^3^23^122^4^8^15^29^9^92^88^12^24^4^24^2^23^0^6^14^5^2^17^28^25^82^6^11^1^109^20^5^0^13^3^89^89^95^77^69^27^21^69^11^67^17^20^76^70^64^82^80^25^19^16^36^0^8^21^71^46^79^16^10^58^31^15^10^0^78^91^22^30^13^21^89^69^35^59^12^24^46^3^1^4^43^24^64^67^13^22^16^4^3^17^23^1^4^5^11^13^13^81^7^11^22^20^33^11^16^65', //This is fixed, don't modify!
		events: {
			'click.cc .item': 'changeColor',
			'1@click.showWidget .J_handleBtn': 'widgetShow'
		},
		changeColor: function(e){
			e.preventDefault();
			var me = $(e.currentTarget),
				color = this.model? this.model.getColor(me.html()) : 'gray';
			me.css('background', color);
		},

		widgetShow: function(){
			var md = this.model? this.model.get('MergeData') : {};
			$('#'+(md.modalId || 'myModal')).modal('show');
		}
		// This(↑) is an example only, please modify the source code to yours...
		// your code...
	});
	// Export the widget object for `Node.js` or `seajs/requirejs`
	if(typeof exports!=='undefined'){
		if(typeof module!=='undefined' && module.exports){
			exports = module.exports = View;
		}
		exports['BaseWidget'] = View;
	}
	else {
		iCat.widget('BaseWidget', function(){ return View; });
	}

	if(typeof define==='function'){
		if(define.amd){
			define('BaseWidget', [], function(){ return iCat.widget['BaseWidget']; });
		}
		else if(define.cmd) {
			define(function(require, exports, module){ module.exports = iCat.widget['BaseWidget']; });
		}
	}
})(this);