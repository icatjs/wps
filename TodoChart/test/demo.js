(function(iCat){
	var path = iCat.util.getCurPath() + '/..';
	iCat.loader.config({
		alias: {
			'TodoChart': path + '/index.js',
			'highcharts': path + '/plugin/highcharts/js/highcharts.js!'
		}
	});

	iCat.app('Demo', function(){
		return {
			init: function(){
				iCat.util.bindEvent({
					'change.select .J_selectStyle select': 'selectStyle',
					'click.tab .J_tabBox li': 'tabSwitch'
				});
				
				iCat.loader.require('underscore, backbone, TodoChart', 'normal'); //默认实例化区块形态的view
			},

			//---style1
			normal: function(){ 
				this.oWidget = new iCat.widget.TodoChart({
					el: '.J_widgetBox',
					//style: false,
					plugins: ['highcharts'],
					setPlugins: function(){
						$('.J_chartShow').highcharts({
					        chart: {
					            type: 'area',
					            spacingBottom: 30
					        },
					        title: {
					            text: 'Fruit consumption *'
					        }/*,
					        subtitle: {
					            text: '* Jane  banana consumption is unknown',
					            floating: true,
					            align: 'right',
					            verticalAlign: 'bottom',
					            y: 15
					        }*/,
					        legend: {
					            layout: 'vertical',
					            align: 'left',
					            verticalAlign: 'top',
					            x: 150,
					            y: 100,
					            floating: true,
					            borderWidth: 1,
					            backgroundColor: '#FFFFFF'
					        },
					        xAxis: {
					            categories: ['Apples', 'Pears', 'Oranges', 'Bananas', 'Grapes', 'Plums', 'Strawberries', 'Raspberries']
					        },
					        yAxis: {
					            title: {
					                text: 'Y-Axis'
					            },
					            labels: {
					                formatter: function() {
					                    return this.value;
					                }
					            }
					        },
					        tooltip: {
					            formatter: function() {
					                return '<b>'+ this.series.name +'</b><br>'+
					                this.x +': '+ this.y;
					            }
					        },
					        plotOptions: {
					            area: {
					                fillOpacity: 0.5
					            }
					        },
					        credits: {
					            enabled: false
					        },
					        series: [{
					            name: 'John',
					            data: [0, 1, 2, 2, 1, 2, 1, 2]
					        }/*, {
					            name: 'Jane',
					            data: [1, 0, 3, null, 3, 1, 2, 1]
					        }*/]
					    });
					}
				});
			},

			//---style2
			tool: function(){
				var w = this.oWidget.copy({
					el: '.J_toolWidget',
					menu: '[data-widgetBtn="demo-pop"]',
					events: {
						'1@click.me .J_handleBtn': function(e){ console.log(e.currentTarget); }
					},
					displayType: 1
				});
				return w;
			},

			//---style3
			tab: function(){
				var w = this.oWidget.copy({
					el: '.J_tabWidget',
					menu: '[data-widgetBtn="demo-tab"]',
					displayType: 2
				});
				return w;
			},

			selectStyle: function(e){
				var me = $(e.currentTarget), val = me.val(),
					toolView = $('.J_toolWidget').getCurrentView(),
					tabView = $('.J_tabWidget').getCurrentView();

				$('.J_testBox').hide().eq(val).show();

				if(val==1 && !toolView){ //切换到tool形态，如果从未实例化view，执行实例化
					this.tool();
				}

				if(val==2 && !tabView){ //切换到tab形态，如果从未实例化view，执行实例化
					this.tab();
				}
			},

			tabSwitch: function(e){
				var me = $(e.currentTarget),
					index = $('.J_tabBox li').index(me);
				me.addClass('selected').siblings('li').removeClass('selected');
				$('.J_tabBox .item').eq(index).show().siblings('.item').hide();

				if(me.attr('data-widgetBtn')){
					var view = me.getCurrentView();
					if(view) view.model.set('api', {testUrl:'test/data.json'});
				}
			}
		};
	});

	Demo.init();
})(ICAT);