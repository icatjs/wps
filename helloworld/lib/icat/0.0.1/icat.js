/*!
 * Copyright 2011~2015, ICAT JavaScript Library 0.0.1
 * https://github.com/valleykid/icatjs
 *
 * Copyright (c) 2015 valleykid
 * Licensed under the MIT license.
 *
 * @Author valleykiddy@gmail.com
 * @Time 2015-12-22 10:06:44
 */

;(function(factory){
	var root = (typeof self == 'object' && self.self == self && self) ||
			(typeof global == 'object' && global.global == global && global), iCat;

	// Export the ICAT object for `Node.js` or `seajs/requirejs`
	if(typeof exports!=='undefined'){
		iCat = factory(root, true);
		if(typeof module!=='undefined' && module.exports){
			exports = module.exports = iCat;
		} else {
			exports.ICAT = iCat;
		}
	}
	else {
		iCat = root['ICAT'] = factory(root); //keep independent
		if(typeof define==='function'){
			if(define.amd){
				define('icat', [], function(){ return iCat; });
			}
			else if(define.cmd){
				define(function(require, exports, module){
					module.exports = iCat;
				});
			}
		}
	}
})(function(root, nodeEnv, undefined){
	var iCat = root['ICAT'] || {version:'0.0.1'};

	// Kinds of judgments
	foreach(
		['String', 'Boolean', 'Function', 'Array', 'Object', 'Number', 'RegExp', 'IE'],
		function(v){
			iCat['is'+v] = v=='IE'? !-[1,] :
				function(obj){
					if(obj===undefined || obj===null)
						return false;// fixed bug: ie下undefined/null为Object
					return Object.prototype.toString.call(obj).slice(8, -1) === v;
				};
		}
	);

	// core
	extend(iCat, {
		foreach: foreach,
		deepClone: deepClone,
		mixin: extend,
		mix: mix,
		extend: function(){
			var o = this, evts,
				argus = Array.prototype.slice.call(arguments);
			
			if(!nodeEnv){ //for events
				foreach(argus, function(item, k){
					if(item.events){
						evts = evts || {};
						extend(evts, item.events);
						delete item.events;
					}
				});
				evts && iCat.util.bindEvent(evts, null, o);
			}

			argus.unshift(o);
			extend.apply(o, argus);
			return o;
		},

		/**
		 * ICAT's utils/tools
		 * @param  {String/Function}   name 方法名/执行函数
		 * @param  {Function}          fn   方法体
		 */
		util: function(name, fn){
			if(iCat.isString(name)) iCat.util[name] = fn || function(){};
			else if(iCat.isFunction(name)) mix(iCat.util, name());
			else if(iCat.isObject(name)) mix(iCat.util, name);
			else if(iCat.isArray(name)){
				foreach(name, function(o){
					if(o.utilName && o.callback){
						iCat.util[o.utilName] = o.callback;
					}
				});
			}
		},

		widget: function(name, fn){
			if(iCat.isString(name))
				iCat.widget[name] = iCat.isFunction(fn)? fn() : fn;
			else if(iCat.isObject(name)){
				foreach(name, function(o, k){
					if(o) iCat.widget[k] = iCat.isFunction(o)? o() : o;
				});
			}
			else if(iCat.isArray(name)){
				foreach(name, function(o){
					var fn = o.create;
					if(o.widgetName && fn){
						iCat.util[o.widgetName] = iCat.isFunction(fn)? fn() : fn;
					}
				});
			}
		},
		
		react: function(name, rcDOM, widget, argus, node){
			iCat.react[name] = function(opts){
				var _react = root['ReactForiCat'] || root['React'];
				if(!_react) return;
				
				if(opts.argus){
					argus = argus || {};
					iCat.mixin(argus, opts.argus);
					delete opts.argus;
				}
				
				iCat.mix(widget.defaultProps, opts, 'el');
				rcDOM.render(_react.createElement(widget, argus), opts.el || node);
			}
		},

		/**
		 * 等待某对象生效后执行操作
		 * @param  {Function} cb	   [description]
		 * @param  {[type]}   delay	超时临界值
		 * @param  {[type]}   step	 每隔多少ms执行一次
		 */
		wait: function(cb, delay, step){
			delay = delay || 100;
			step = step || 10;
			var Cache = iCat.wait;
			var steps = 0, fn,
				key = 'icat_timer' + Math.floor(Math.random()*1000000+1);

			if(cb(false)!==false) return; //do first
			Cache[key] = setInterval(function(){
				if(cb(steps>=delay)===false && steps<delay){
					steps += step;
				} else {
					clearInterval(Cache[key]);
					delete Cache[key];
				}
			}, step);
		},

		//加密
		encrypt: function(source, key){
			var arr = [];
			var len = source.length, keyLen = key.length;
			for(var i=0; i<len; i++){
				var k = source.charCodeAt(i)^key.charCodeAt(i%keyLen);
				arr.push(k);
			}
			return arr.join('^');
		},

		//解密
		decode: function(s, key){
			if(!iCat.isString(s)|| !/^\d+(\^\d+)+$/.test(s) ) return '';

			var arr = s.split('^'), len = arr.length;
			var keyLen = key.length, ret = [];
			for(var i=0; i<len; i++){
				var k = (+arr[i])^key.charCodeAt(i%keyLen);
				ret.push(String.fromCharCode(k));
			}
			return ret.join('');
		},

		trim: function(s, isAll){
			return isAll?
				s.replace(/\s/g, '') : s.replace(/^\s+|\s+$/g, '');
		},

		removeExcess: function(s){
			s = s.replace('??', '@');
			return s.replace(/(\?|#).*$/, '').replace('@', '??');
		}
	});

	// common utils
	iCat.util({
		zenCoding: zenCoding,

		getLayouts: function(o){
			var s = o.framework, ss = [],
				num = o.gridclass.charAt(1),
				mains = [], subs = [], extras = [];
				ss.push('.grid.'+o.gridclass+'>');

			if(num=='-'){
				_.each(o.$main, function(b){ mains.push('[data-wgtype="'+b+'"]'); });
				ss.push(mains.join('+'));
			}
			else {
				ss.push('(.col-main>.main-wrap');
				_.each(o.$main, function(b){ mains.push('[data-wgtype="'+b+'"]'); });
				ss.push(mains.length? '>'+mains.join('+') : '');

				ss.push(') + '+(num==3? '(':'')+'.col-sub');
				_.each(o.$sub, function(b){ subs.push('[data-wgtype="'+b+'"]'); });
				ss.push(subs.length? '>'+subs.join('+') : '');

				if(num==3){
					ss.push(') + .col-extra');
					_.each(o.$extra, function(b){ extras.push('[data-wgtype="'+b+'"]'); });
					ss.push(extras.length? '>'+extras.join('+') : '');
				}
			}
			return zenCoding(s.replace('{grid}', ss.join('')));
		}
	});

	/** node or commonJS **/
	if(nodeEnv){
		//iCat.extend({});
	}

	/** browser **/
	else {
		var doc = root.document;

		// jQuery/Zepto is coming in
		iCat.$ = root.jQuery || root.Zepto || root.ender || root.$;
		iCat.XMD = root.seajs || root.require;
		iCat.shim = {};

		if(!iCat.icatjs){
			iCat.icatjs = getCurrentJS() || {};
		}

		if(!root._BaseTime_){
			root._BaseTime_ = getStartTime() || (new Date).getTime();
		}

		// Kinds of modes
		foreach(
			{
				'DebugMode': /[\?&#]debug/i,
				'DemoMode': /file\:\/{3}|localhost/i,
				'IPMode': /\/\d+(\.\d+){3}(\:\d+)?\//
			},
			function(v, k){ iCat[k] = v.test(location.href); }
		);

		iCat.extend({
			APPGROUP: {}, //应用集合
			TPLCACHE: {}, //模板缓存

			CONFIG: {
				alias: {}, vars: {}, combo: false,
				extensions: ['.js', '.json', '.css'],
				map: '~.min', //['.source', ''], ['', '-min'], ['-debug', '']
				DebugMode: iCat.DebugMode || iCat.DemoMode || iCat.IPMode
			},

			hasItem: hasItem,
			unique: unique,

			// 数组去除指定项
			removeItem: function(arr, item){
				if(!iCat.hasItem(arr, item) && iCat.isNumber(item)){
					arr.splice(item, 1);
				}
				else {
					var index = getIndex(arr, item);
					if(index!==-1) arr.splice(index, 1);
				}
				return arr;
			},

			isjQueryObject: function(obj){
				if(!iCat.$) return false;
				return obj instanceof iCat.$;
			},

			isEmptyObject: function(obj){
				for(var name in obj){ return false; }
				return true;
			},

			// create a app for some project
			app: function(name, sx){
				var isStr = iCat.isString(name),
					o = isStr? root[name] || {} : name;

				isStr && (iCat.APPGROUP[name] = root[name] = o);
				mix(o, iCat, ['extend', 'namespace', 'router']);
				extend(o, iCat.isFunction(sx) ? sx() : sx);

				return o;
			},

			// iCat或app下的namespace，相当于扩展出的对象
			namespace: function(){
				var a = arguments, l = a.length,
					o = null, i, j, p;

				for(i=0; i<l; ++i){
					p = ('' + a[i]).split('.');
					o = this;
					for(j = (root[p[0]]===o)? 1:0; j<p.length; ++j){
						o = o[p[j]] = o[p[j]] || {};
					}
				}
				return o;
			},

			// 参考：https://github.com/ded/domready
			// http://www.cnblogs.com/zhangziqiu/archive/2011/06/27/DOMReady.html
			ready: function(ready){
				var fns = [], DDE = doc.documentElement,
					hack = DDE.doScroll, handler,
					loaded = (hack? /^loaded|^c/ : /^loaded|c/).test(doc.readyState),
					flush = function(f){
						loaded = 1;
						while(f=fns.shift()) f();
					};

				if(doc.addEventListener){
					doc.addEventListener('DOMContentLoaded', handler = function(){
						doc.removeEventListener('DOMContentLoaded', handler, false);
						flush();
					}, false);
				}

				if(hack){
					doc.attachEvent('onreadystatechange', handler = function(){
						if(/^c/.test(doc.readyState)){
							doc.detachEvent('onreadystatechange', handler);
							flush();
						}
					});
				}

				return (ready = hack?
					function(fn){
						self!=top?
							loaded? fn() : fns.push(fn) :
							function(){
								try{
									hack('left');
								} catch(e) {
									return setTimeout(function(){ ready(fn); }, 50);
								}
								fn();
							}()
					} :
					function(fn){ loaded? fn() : fns.push(fn); }
				);
			}(),

			// 打印消息(ie6下弹出消息框)
			log: function(msg){
				if(!iCat.CONFIG.DebugMode) return;
				var log = (console || {}).log,
					argus = Array.prototype.slice.call(arguments);
				if(iCat.isIE){
					root.console && console.log? log.apply(console, argus) : alert(msg);
				} else {
					try{ __$abc_ICAT(); }
					catch(e){
						var fileline = e.stack.match(/\([^\)]+\)/g);
							fileline = fileline? fileline[2] : '';
							fileline = fileline || '';
						if(iCat.isString(argus[0]) && ~argus[0].indexOf('@file')){
							fileline = fileline.replace(/[^\/]+\//g, '').replace(/[\(\)\/\"\']/g, '');
							argus[0] = argus[0].replace('@file', '%c'+fileline);
							argus.push('color:#ddd;text-decoration:underline;');
						} else {
							fileline = fileline.replace(/^\(|\)$/g, '');
							argus.unshift(fileline+'\n');
						}
						log.apply(console, argus);
					}
				}
			}
		});

		iCat.util({
			// https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
			// https://msdn.microsoft.com/library/ff975163(v=vs.85).aspx
			// https://msdn.microsoft.com/zh-cn/library/aa358796(v=vs.85).aspx
			// http://blog.csdn.net/renfufei/article/details/39085235
			insertRule: function(selector, cssText, sheet, position){
				if(!sheet){
					var el = doc.getElementById('blankSheet');
					if(!el){
						el = doc.createElement('style');
						el.id = 'blankSheet';
						(doc.head || doc.documentElement).appendChild(el);
					}
					if(el.sheet){
						sheet = el.sheet;
					} else {
						var sheets = doc.styleSheets, last = sheets.length - 1;
						sheet = sheets[last];
					}
				}

				position = position || (sheet.cssRules || sheet.rules).length;
				if('insertRule' in sheet){
					sheet.insertRule(selector+'{'+cssText+'}', position);
				}
				else if('addRule' in sheet){
					sheet.addRule(selector, cssText, position);
				}
			},

			insertCss: function(cssText){
				var el = doc.getElementById('blankSheet'),
					oldRules = '';
				if(el){
					var oldRules = el.innerHTML;
					el.parentNode.removeChild(el);
				}

				var p = doc.createElement('p'),
					parent = doc.head || doc.documentElement;
				p.innerHTML = 'x<style id="blankSheet">' + (oldRules+cssText) + '</style>';
				return parent.appendChild(p.lastChild);
			},

			getTemplate: function(t, data, app){
				if(!t) return;

				var fn, tpl, el,
					widgetName = iCat.isString(app)? app : '';
				if(/\<[^\>]+\>/.test(t)){
					tpl = t.replace(/\r\t\n/g, '');
					t = undefined;
				} else {
					iCat.templates = iCat.templates || {};
					el = doc.getElementById(t.replace('.tpl', ''));
					t = ~t.indexOf('.tpl')? t : t + '.tpl';
					fn = iCat.TPLCACHE[t];
					if(fn){
						return data? fn(data) : fn;
					}
					else if(app && iCat.isObject(app)){
						tpl = app.templates? app.templates[t] : app[t];
					}
					else if(iCat.templates[t]){
						tpl = iCat.templates[t];
					}
					else if(el){
						tpl = (el.innerHTML || '').replace(/[\r\t\n]/g, '');
					}
					else {
						iCat.foreach(iCat.APPGROUP, function(item){
							if(item.templates && item.templates[t]){
								tpl = item.templates[t];
								return false;
							}
						});
					}
				}
				
				if(!tpl){
					tpl = '<div class="no-tpl"><span class="text-muted">'+t+'模板有误，请检查</span></div>';
					fn = _.template(tpl, {variable: 'o'});
					t = undefined;
				} else {
					var dfs = tpl.match(/<define[^>]*>(.(?!define))*<\/define>/g), //<define([\s\S]*define)>
						micro = {};
					if(dfs){
						foreach(dfs, function(df){
							tpl = tpl.replace(df, '');
							var name = df.match(/<define\s+name\=\"(\w+)\">/),
								fnBody = df.replace(/<\/?define[^>]*>/g, ''), k = name[1];
							if(k){
								micro[k] = _.template(fnBody, {variable:'o'});
								iCat.TPLCACHE[(widgetName? widgetName+'_' : '')+k] = micro[k];
							}
						});
						fn = function(d){
							d = d || {}; d.micro = {};
							for(var k in micro){
								(function(name){
									d.micro[name] = function(){ return micro[name](d); };
								})(k);
							};
							return _.template(tpl, {variable:'o'})(d);
						};
					} else {
						fn = _.template(tpl, {variable:'o'});
					}
					if(t) iCat.TPLCACHE[t] = fn;
				}
				
				return data? fn(data) : fn;
			},

			getMicroTemplate: function(t, data){
				var fn = iCat.TPLCACHE[t] || function(){};
				return data? fn(data) : fn;
			},

			storage: function(){
				var argus = arguments,
					isCookie = !window.localStorage,
					len = argus.length, key, val;
				if (len == 1) {
					key = argus[0];
					return isCookie ? _cookie(key) : localStorage.getItem(key);
				} else {
					key = argus[0];
					val = iCat.isObject(argus[1]) || iCat.isArray(argus[1])? JSON.stringify(argus[1]) : argus[1];
					if (isCookie) {
						_cookie(key, val);
					} else {
						localStorage.removeItem(key);
						localStorage.setItem(key, val);
					}
				}
			},

			bindEvent: function(evts, p, app){
				if(!evts || !iCat.isObject(evts)) return;
				if(!iCat.$){
					var $ = root.jQuery || root.Zepto || root.ender || root.$;
					if($) iCat.$ = $;
				}
				if(!iCat.$) return; //确定没有jQuery

				iCat.foreach(evts, function(fn, key){
					var arr = key.replace(/^(\S+)\s+/, '$1@').split('@'),
						type = arr[0]+'.icatEventDelegate', el = arr[1];
					iCat.$(p || doc).on(type, el, function(e){
						var o = iCat.util.getCallback(fn, app);
						o && o.callback.apply(o.context, [e, iCat.ROUTERPARAM]);
					});
				});
			},

			unbindEvent: function(types, p){
				if(!types) return;
				if(!iCat.$){
					var $ = root.jQuery || root.Zepto || root.ender || root.$;
					if($) iCat.$ = $;
				}
				if(!iCat.$) return;

				types = iCat.isArray(types)? types.join(',') : types;
				types = iCat.trim(types, true).split(',');
				iCat.foreach(types, function(t){
					t = t+'.icatEventDelegate';
					iCat.$(p || doc).off(t);
				});
			},

			getCallbacks: function(arr){
				var ret, that = this;
				if(iCat.isArray(arr)){
					ret = [];
					foreach(arr, function(a){
						var realFun = that.getCallback(a.fname, a.from);
						if(a.fid){
							realFun.originalRule = a.originalRule;
							realFun.fid = a.fid;
						}
						ret.push(realFun);
					});
				} else {
					ret = that.getCallback(arr.fname, arr.from);
				}
				return ret;
			},

			//获取callback
			getCallback: function(fn, app){
				if(!fn) return {callback:function(){}, context:app || root};
				if(iCat.isFunction(fn)) return {callback:fn, context:app || root};
				if(iCat.isString(fn)){
					var _fn, cx;
						fn = iCat.trim(fn);
					if(~fn.indexOf('.')){
						var arr = fn.split('.'), len = arr.length - 1;
						foreach(arr, function(name, i){
							_fn = i==0? root[name] : _fn[name];
							if(i==len-1) cx = _fn;
							if(!_fn) return false;
						});
					} else {
						if(app)
							return {callback:app[fn], context:app};
						else {
							var isFind = false;
							foreach(iCat.APPGROUP, function(app){
								if(app[fn]){
									_fn = app[fn]; cx = app;
									isFind = true;
								}
							});
						}
						if(!isFind && root[fn]) return {callback:root[fn], context:root};
					}
					return {callback:_fn, context:cx};
				}
				else if(iCat.isObject(fn)) {
					return fn;
				}
			},

			getCurrentJS: getCurrentJS,

			getCurPath: function(){
				var curJS = getCurrentJS();
				return (curJS? curJS.src : '').replace(/\/[^\/]+$/, '');
			},

			template: function(tmpl, data){
				var fnEmpty = function(){return '';},
					fBody, fn;
				if(!tmpl) return fnEmpty;

				tmpl = tmpl.replace(/[\r\t\n]/g, '');
				fBody = "var __p_fun = [], _self = jsonData; with(jsonData){" +
							"__p_fun.push('" + //fixe bug:当json不包含某字段时，整个函数执行异常
								tmpl.replace(/\<%\=(.*?)%\>/g, "',(typeof $1!='undefined'? $1:''),'")
									.replace(/\<%(.*?)%\>/g, "');$1__p_fun.push('") + 
								"');" +
						"};return __p_fun.join('');";
				
				fn = new Function('jsonData', fBody);
				return data? fn(data) : fn;
			},

			getLifecycle: function(stage, duration){
				//stage = stage.replace(/\-([^\-]+)$/, '-%c$1');
				//iCat.log(stage+': %c'+duration+'ms @file', 'color:green', 'color:blue');
				if(iCat.TIMING===undefined){
					iCat.TIMING = {baseUrl: location.href};
				}
				iCat.TIMING[stage] = duration + (~stage.indexOf('-')? 0 : 'ms');
				if(/\-\w+End$/.test(stage)){
					var jsKey = stage.replace('End', '');
					iCat.TIMING[jsKey] = (duration - (iCat.TIMING[jsKey+'Begin'] || 0)) + 'ms';
					//delete iCat.TIMING[jsKey+'Begin'];
				}/* else {
					iCat.TIMING[stage] = duration;
				}*/
			}
		});

		// getCurrentView/delCurrentView blends in jQuery
		if(iCat.$){
			extend(iCat.$.fn, {
				getCurrentView: function(){
					var view;
					this.each(function(i, el){
						if(el.viewId){
							view = el.viewId;
							return false;
						}
					});
					return iCat.util.getView[view] || null;
				},

				delCurrentView: function(){
					this.each(function(i, el){
						if(el.viewId) delete el.viewId;
					});
				}
			});
		}

		// page load time
		iCat.ready(function(){ pageload('pageReady'); });
		if(root.addEventListener){
			root.addEventListener('load', function(){
				pageload();
				console.log({timing: iCat.TIMING});
			}, false);
		}
		else if(root.attachEvent){
			root.attachEvent('onload', function(){
				pageload();
				console.log({timing: iCat.TIMING});
			});
		}

		function pageload(key){
			var startTime = getStartTime() || 0,
				endTime = (new Date).getTime();
			iCat.util.getLifecycle(key || 'pageLoad', endTime - _BaseTime_); //location.href+'-'+(key || 'pageLoad')
		}

		//参考: https://gist.github.com/cphoover/6228063
		// https://gist.github.com/JamesMGreene/fb4a71e060da6e26511d
		// https://developer.mozilla.org/zh-CN/docs/Web/API/document.currentScript
		function getCurrentJS(){
			if(doc.currentScript) return doc.currentScript;

			var scripts = doc.getElementsByTagName('script'),
				len = scripts.length;
			if(len===0) return;
			if(len===1) return scripts[0];

			if('readyState' in scripts[0]){
				for(var i=scripts.length; i--;){
					if(scripts[i].readyState==='interactive'){
						return scripts[i];
					}
				}
			}

			if(doc.readyState==='loading'){
				return scripts[len-1];
			}

			var fileSrc;
			try{
				throw Error('get currentJS');
			} catch(e) {
				if(e.fileName)//firefox
					fileSrc = e.fileName;
				else if(e.stack)//chrome
					fileSrc = e.stack.split(/\s+/).pop().replace(/(^\w+@)|((\:\d+)+$)/g, ''); //fix bug: iPad has 'code@xxx'
					//fileSrc = e.stack.match(/\([^\)]+\:\d+\)/)[0].replace(/^\(|(\:\d+)+\)$/g, '');
				else if(e.sourceURL)//safari
					fileSrc = e.sourceURL;
			}
			if(fileSrc){
				for(var j=0; j<len; j++){
					if(scripts[j].src===fileSrc) return scripts[j];
				}
			}
			return fileSrc || scripts[len-1];
		}

		function getStartTime(){
			var performance, startTime = false;
			performance = root.performance || root.msPerformance || root.webkitPerformance || root.mozPerformance;

			if(performance && performance.timing && performance.timing.navigationStart){
				startTime = performance.timing.navigationStart;
			} else if(root.chrome && root.chrome.csi && root.chrome.csi().startE){
				startTime = root.chrome.csi().startE;
			} else if(root.gtbExternal && root.gtbExternal.startE()){
				startTime = root.gtbExternal.startE();
			}

			if(navigator.userAgent.match(/Firefox\/[78]\./)){
				startTime = performance.timing.unloadEventStart || performance.timing.fetchStart || undefined;
			}

			return startTime;
		}

		function _cookie(){
			if (!arguments.length) return;

			if (arguments.length == 1) {
				var dCookie = doc.cookie;
				if (dCookie.length <= 0) return;

				var cname = arguments[0],
				cStart = dCookie.indexOf(cname + '=');
				if (cStart != -1) {
				cStart = cStart + cname.length + 1;
				cEnd = dCookie.indexOf(';', cStart);
				if (cEnd == -1) cEnd = dCookie.length;
					return unescape(dCookie.substring(cStart, cEnd));
				}
			} else {
				var cname = arguments[0], val = arguments[1], seconds = arguments[2] || 60,
				exdate = new Date(), expires = '';
				exdate.setTime(exdate.getTime() + (seconds * 1000));
				expires = '; expires=' + exdate.toGMTString();
				doc.cookie = cname + '=' + escape(val) + expires + '; path=/';
			}
		}
	}

	return iCat;

	// common
	/**
	 * Handles objects with the built-in 'foreach', arrays, and raw objects.
	 * @param {Array/Object} o	  被遍历的对象/数组
	 * @param {Function}	 cb	 回调方法，返回false则跳出遍历
	 * @param {Array}		args   传递给回调方法的参数
	 * @param {Boolean}	  setObj 设定o是或不是对象
	 */
	function foreach(o, cb, args, setObj){
		var name, i = 0, length = o.length,
			isObj = setObj || length===undefined;
		
		if(args){
			if(isObj){
				for(name in o){
					if(cb.apply(o[name], args)===false){
						break;
					}
				}
			} else {
				for(;i<length;){
					if(cb.apply(o[i++], args)===false){
						break;
					}
				}
			}
		} else {
			if(isObj){
				for(name in o){
					if(cb.call(o[name], o[name], name)===false){
						break;
					}
				}
			} else {
				for(;i<length;i++){
					if(cb.call(o[i], o[i], i)===false){
						break;
					}
				}
			}
		}
	}

	/**
	 * Copies all the properties of s to r.
	 * @param {Object}	   r  接收方
	 * @param {Object}	   s  发出方
	 * @param {Array/String} l  Array时表示白名单，String时表示黑名单
	 * @return {Object}
	 */
	function mix(r, s, l){
		if(!s || !r) return r;
		var i, p, len, white = true;

		if(l && iCat.isString(l)){
			l = l.replace(/\s+/g, '').split(',');
			white = false;
		}

		if(l && (len=l.length)){
			var o = {};
			if(white){
				foreach(l, function(p){ if(s[p]) o[p] = s[p]; });
			} else {
				foreach(s, function(v, p){ if(!hasItem(l, p)) o[p] = v; });
			}
			extend(r, o);
		} else {
			extend(r, s);
		}
		return r;
	}
	
	// same as underscore, but supports deep-meger
	function extend(obj){
		var argus = Array.prototype.slice.call(arguments, 1);
		foreach(argus, function(source){
			if(source){
				for(var p in source){
					if(iCat.isObject(obj[p]) && iCat.isObject(source[p])){
						obj[p] = extend(obj[p], source[p]);
					}
					else if(iCat.isArray(obj[p])){
						obj[p] = unique( obj[p].concat(source[p]) );
					}
					else {
						obj[p] = source[p];
					}
				}
			}
		});
		return obj;
	}

	function deepClone(obj){
		if(!obj) return;
		var o;
		if(obj.constructor==Object){
			o = new obj.constructor();
		} else {
			o = new obj.constructor(obj.valueOf());
		}
		for(var k in obj){
			if(o[k]!=obj[k]){
				if(iCat.isObject(obj[k])){
					o[k] = deepClone(obj[k]);
				}
				else if(iCat.isArray(obj[k])){
					o[k] = obj[k].concat();
				} else {
					o[k] = obj[k];
				}
			}
		}
		//o.toString = obj.toString;
		//o.valueOf = obj.valueOf;
		return o;
	}

	// 数组去重
	function unique(arr){
		var hash = {}, r = [];
		foreach(arr, function(v){
			var k = root['JSON'] && iCat.isObject(v)? root['JSON'].stringify(v) : v;
			if(!hash[k]){
				r.push(v); hash[k] = true;
			}
		});
		return r;
	}

	// 数组(对象/字符串)是否包含某值
	function hasItem(o, p){
		if(iCat.isArray(o)) return getIndex(o, p)>-1;
		if(iCat.isObject(o)) return p in o;
		if(iCat.isString(o)) return o.indexOf(p)>-1;
		return false;
	}

	// 数组索引
	function getIndex(arr, item){
		if('indexOf' in arr) return arr.indexOf(item);
		var ret = -1;
		foreach(arr, function(v, i){ if(v===item){ret = i; return false;} });
		return ret;
	}

	// zen-coding
	function zenCoding(s){
		var Zen = iCat.util.zenCoding, _s;
			Zen.frags = {}; Zen.fragIndex = 0;
		_s = _bracket(s, Zen);
		_s = _getStack(_s, Zen);

		iCat.foreach(Zen.frags, function(r, k){
			if(!/\{\d+\}/.test(k)) return;
			Zen.frags[k.replace(/\{|\}/g, '')] = _getFrag(r);
		});

		return frag(_s).join('').replace(/(\&nbsp;)|(\{\s+\})/g, '');
	}

	function frag(s){
		var arr = s.split('+'), ret = [];
		iCat.foreach(arr, function(v, i){
			if(/\{\d+\}/.test(v)){
				//iCat.util.zenCoding.frags.vkstr = v;
				if(~v.indexOf('*')){
					v = v.split('*');
					var ss = _getPH(v[0]), sss = '';
					for(var m=0; m<v[1]; m++){ sss+=ss; }
					ret[i] = sss;
				} else {
					ret[i] = _getPH(v);
				}
			} else {
				ret[i] =_getFrag(v);
			}
		});

		return ret;
	}

	function _attrs(str){
		if(!str) return '';

		var arr, sid, clas = [], o = {}, s = [];
			arr = str.match(/(\#[\w\-\d]+)|(\.[\w\-\d]+)|(\[[^\]]+\])/g);
		if(arr){
			iCat.foreach(arr, function(me){
				if(me.charAt(0)==='['){
					s.push(me.replace(/\[|\]/g, ''));
				} else if(me.charAt(0)==='.' && o[me]===undefined){
					clas.push(me.slice(1));
					o[me] = true;
				} else {
					sid = sid || me.slice(1); // The first effective
				}
			});
		}

		if(sid) s.push('id="'+sid+'"');
		if(clas.length) s.push('class="'+clas.join(' ')+'"');
		return s.join(' ');
	}

	function _tag(str, ph){
		if(!str) return '';
		if(/\<[^\>]+\>/.test(str)) return str;
		if(/[\+\*\>\{]/.test(str)) return _getFrag(str);

		var tag = str.match(/^[^\W]+/), s,
			attrs = _attrs(str);
			attrs = attrs? ' '+attrs : '';
			ph = ph || '&nbsp;';
		if(!tag) tag = 'div';
		s = '<'+tag+attrs+(/img|input|br|hr/i.test(tag)? ' />' : '>'+ph+'</'+tag+'>');
		return s;
	}

	function _sibling(str){
		if(!str) return '';
		var arr = str.split('+'), s = '';
		iCat.foreach(arr, function(v){
			s += _tag(v);
		});
		return s;
	}

	function _repeat(str){
		if(!str) return '';
		var arr = str.split('*'), s = '';
		for(var i=0; i<(arr[1] || 0); i++){
			s += _tag(arr[0]);
		}
		return s;
	}

	function _stack(str){
		if(!str) return '';
		var arr = str.split('>');
		var s = '&nbsp;';
		iCat.foreach(arr, function(v){
			s = s.replace(/\&nbsp;/g, _tag(v));
		});
		return s;
	}

	function _bracket(str, Zen){
		if(!str) return '';
		if(!/\([^\(\)]+\)/.test(str)) return str;

		var arr = str.match(/\([^\(\)]+\)/g);
		iCat.foreach(arr, function(f){
			var key = '{'+Zen.fragIndex+'}';
			if(Zen.frags[f]===undefined){
				//Zen.frags[f] = key;
				Zen.frags[key] = f.replace(/\(|\)/g, '')//frag();
			}
			str = str.split(f).join(key);
			Zen.fragIndex++;
		});

		if(/\([^\(\)]+\)/.test(str)) return _bracket(str, Zen);
		return str;
	}

	function _getStack(str, Zen){
		if(!str) return '';
		if(str.indexOf('>')<0) return str//frag(str);

		var reg = /[^\>\+]+\>[^\>]+$/,
			last = str.match(reg);
		if(last){
			var key = '{'+Zen.fragIndex+'}', f = last[0];
			if(Zen.frags[f]===undefined){
				//Zen.frags[f] = key;
				Zen.frags[key] = f//frag();
			}
			str = str.replace(reg, key);
			Zen.fragIndex++;
		}

		if(~str.indexOf('>')) return _getStack(str, Zen);
		return str;
	}

	function _getFrag(str){
		if(~str.indexOf('>')) return _stack(str);
		if(~str.indexOf('+')) return _sibling(str);
		if(~str.indexOf('*')) return _repeat(str);
		if(str.indexOf('{')<0) return _tag(str);
		//return /\{\d+\}/.test(str)? iCat.util.zenCoding[str] || _sibling(str) : _tag(str);
		return str;
	}

	function _getPH(str){
		var arr = str.split(/\{|\}/g),
			Zen = iCat.util.zenCoding, ret = [];
		
		iCat.foreach(arr, function(v, i){
			if(!v){
				ret[i] = '';
			} else if(!isNaN(v)){
				var ph = Zen.frags[v];
				ret[i] = ph? _getPH(ph) : '{'+v+'}';
			} else {
				ret[i] = v;
			}
		});
		return ret.join('');
	}
});

;(function(iCat, root, doc, undefined)
{
	iCat.RULECODE = iCat.RULECODE || { _index_:0 }; //规则映射
	iCat.RULEFUNS = iCat.RULEFUNS || {}; //规则回调函数
	iCat.RULELIST = iCat.RULELIST || {}; //规则列表
	iCat.ROUTERPARAM = iCat.ROUTERPARAM || {paths:{}, searchs:{}, hashs:{}}; //路由参数值

	iCat.router = function(exp, fn){
		var app = this, len = arguments.length,
			defaultRoutes = app.routes;
		if(!app._bindDefaultRoutes_ && defaultRoutes){
			optInsert(defaultRoutes, app);
			app._bindDefaultRoutes_ = true;
		}

		switch(len){
			case 0:
				trigger();
				break;
			case 1:
				iCat.isObject(exp)?
					optInsert(exp, app) : iCat.isFunction(exp)?
						optInsert('*', exp) : optDelete(exp);
				break;
			default: //多个
				iCat.isObject(exp)?
					optInsert(exp, app) : optInsert(exp, fn, app);
		}
		return app;
	};

	// extend
	iCat.router.update = optUpdate;
	iCat.router.remove = optDelete;

	// for unit-test
	if(~(doc.baseURI || location.href).indexOf('router_test')){
		iCat.router_test = {};
		iCat.mix(iCat.router_test, {
			trigger: trigger,
			optInsert: optInsert,
			optDelete: optDelete,
			optUpdate: optUpdate,
			getRule: _getRule,
			getOneRule: _getOneRule
		});
	}

	// functions
	function trigger(){
		iCat.foreach(iCat.RULEFUNS, function(fns, k){
			if(~k.indexOf('※')) return; //路径回调函数
			var path = location.pathname.replace(/^\/\w\:/, ''),
				hash = location.hash.slice(1), params,
				vars = iCat.CONFIG.vars;
				fns = iCat.util.getCallbacks(fns);

			var router = iCat.RULELIST[k],
				led = fns[0], ledExec = led? led.callback : undefined;
			if(router.HashMode){
				if(router.rule.test(hash)){
					params = _getParams(router, path, hash);
					ledExec && ledExec.apply(led.context, [params]);
				}
			}
			else if(router.hashRule){
				if(router.rule.test(path) && router.hashRule.test(hash)){
					params = _getParams(router, path, hash);
					ledExec && ledExec.apply(led.context, [params]);
				}
			}
			else {
				if(router.rule.test(path)){
					if(router.originalRule=='*'){
						params = iCat.ROUTERPARAM;
						if(fns.length>1){
							var _fns = fns.concat();
							iCat.foreach(_fns.slice(1), function(next){
								var prev = fns[next.fid-1];
								prev.exec = function(){
									prev.callback.apply(prev.context, [params, function(){
										next.exec.apply(next.context);
									}]);
								};
								next.exec = function(){
									next.callback.apply(next.context, [params, function(){}]);
								};
							});
						}
						led = fns[0];
						ledExec = led? (led.exec || led.callback) : undefined;
						ledExec && ledExec.apply(led.context, [params]);
					} else {
						params = _getParams(router, path, hash);
						params.vars = vars;
						ledExec && ledExec.apply(led.context, [params]);
					}
				}
			}
		});
	}

	function optInsert(rs, callback, app){
		if(rs===undefined) return;
		if(iCat.isString(rs) || iCat.isArray(rs)){
			_insert(rs, callback, app);
		}
		else if(iCat.isObject(rs)){
			if(iCat.isObject(callback)) app = callback;
			iCat.foreach(rs, function(cb, key){
				_insert(key, cb, app);
			});
		}
		else if(iCat.isRegExp(rs)){
			var k = rs.toString().replace(/^\/(\^)?|(\$)?\/$/g, ''),
				o = {rule: rs, keys: [], stringRule: k};
			_insert(o, callback, app);
		}
	}

	function optDelete(rs){
		var rules = _getRule(rs);
		iCat.foreach(rules, function(o){
			var funs = iCat.RULEFUNS[o.stringRule],
				newFuns = [];
			if(funs && funs.length){
				iCat.foreach(funs, function(f, i){
					if(f.originalRule==o.originalRule){
						/*iCat.removeItem(funs, i); ---way1
						return false;*/
					} else {
						newFuns.push(f); //---way2
					}
				});
				iCat.RULEFUNS[o.stringRule] = newFuns;
			}
		});
	}

	function optUpdate(rs, callback, app){
		var rules = _getRule(rs);
		iCat.foreach(rules, function(o){
			if(o.originalRule=='*') return; //all类型不支持更新
			var funs = iCat.RULEFUNS[o.stringRule];
			if(funs && funs.length){
				iCat.foreach(funs, function(f, i){
					if(f.originalRule==o.originalRule){
						//iCat.mix(f, iCat.util.getCallback(callback, app));
						//return false;
						/*var newfn = iCat.util.getCallback(callback, app);
						f.callback = newfn.callback;
						f.context = newfn.context;*/
						f.fname = callback;
						f.from = app;
					}
				});
			}
		});
	}

	function optSelect(argument){/*body...*/}

	function _insert(rs, callback, app){
		var RuleCode = iCat.RULECODE, RuleFuns = iCat.RULEFUNS,
			RuleList = iCat.RULELIST, rules = _getRule(rs);
		iCat.foreach(rules, function(o){
			if(RuleList[o.stringRule]){
				var cb = {fname:callback, from:app},//iCat.util.getCallback(callback, app)
					funs = RuleFuns[o.stringRule];
				cb.fid = funs.length;
				cb.originalRule = o.originalRule;
				RuleFuns[o.stringRule].push(cb);

				//console.log(o.keys, o.hashKeys, prevKeys, prevHashKeys);
				var prev = RuleList[o.stringRule], prevKeys = prev.keys,
					prevHashKeys = prev.hashKeys, k1 = [], k2 = [];
				iCat.foreach(prevKeys, function(k, i){
					var _k = o.keys[i];
					if(_k && _k!==k){
						k1.push((k+'|'+_k).replace(/\:/g, ''));
					} else {
						k1.push(k);
					}
				});
				if(prevHashKeys){
					iCat.foreach(prevHashKeys, function(k, j){
						var _k = o.hashKeys[j];
						if(_k && _k!==k){
							k1.push((k+'|'+_k).replace(/\:/g, ''));
						} else {
							k1.push(k);
						}
					});
				}
				//console.log(k1, k2);
				prev.keys = k1;
				prev.hashKeys = k2;
			} else {
				var id = RuleCode._index_,
					cb = {fname:callback, from:app};//iCat.util.getCallback(callback, app)
					RuleFuns[o.stringRule] || (RuleFuns[o.stringRule] = []);
				RuleCode[o.stringRule] = id;
				RuleCode[id] = o.stringRule;
				RuleCode._index_ = id + 1;

				cb.fid = 0;
				cb.originalRule = o.originalRule;
				RuleFuns[o.stringRule].push(cb);
				RuleList[o.stringRule] = o;
			}
		});
	}

	function _getRule(rs){
		if(iCat.isObject(rs)) return [rs];
		var ret = [], o = {};
			rs = iCat.isArray(rs)? rs.join(',') : iCat.isString(rs)? rs : '';
			rs = iCat.trim(rs, true);
		iCat.foreach(rs.split(','), function(r){
			if(/^all$/i.test(r)) r = '*';
			if(!o[r]){
				ret.push(_getOneRule(r));
				o[r] = true;
			}
		});
		return ret;
	}

	function _getOneRule(r){
		var one = r.charAt(0), exp, expx, _r,
			ret = {originalRule:r};
		if(one==='#'){
			_r = r.slice(1);
			exp = _getStrReg(_r);
			if('onhashchange' in root){
				root.onhashchange = function(){ trigger(); };
			} else {
				// 模拟onhashchange(未实现)
			}
			ret['rule'] = new RegExp('^'+exp[0]+'$');
			ret['stringRule'] = exp[0];
			ret['HashMode'] = true;
			ret['keys'] = exp[1] || [];
		}
		else {
			if(~r.indexOf('#')){
				r = r.split('#');
				exp = _getStrReg(r[0]);
				expx = _getStrReg(r[1]);
				ret['hashRule'] = new RegExp('^'+expx[0]+'$');
				ret['hashKeys'] = expx[1] || [];
			} else{
				exp = _getStrReg(r);
			}
			
			ret['stringRule'] = exp[0] + (expx? expx[0] : '');
			ret['rule'] = new RegExp('^'+exp[0]+'$');
			ret['keys'] = exp[1] || [];
		}
		return ret;
	}

	function _getStrReg(exp){
		if(exp=='') return ['\\/'];
		if(exp=='*') return ['.*'];
		var keys = exp.match(/\:\w+/g),
			_exp = exp.replace(/\*{2}/g, '[/\\w-]+').replace(/\*/g, '[^/]+').replace(/\?/g, '[^/]')
					  .replace(/([\.\-\/])/g, '\\$1')
					  .replace(/\:\w*(num|id|index)/gi, '(\\d+)').replace(/\:\w+/g, '([\\w\\-]+)');
		return keys? [_exp, keys] : [_exp];
	}

	function _getParams(router, strPath, strHash){
		var reg = router.rule, search = location.search.slice(1),
			getData = function(regExp, keys, hasHash){
				var arr = hasHash? strHash.match(regExp) : strPath.match(regExp);
					arr = arr || [];
					arr.shift();
				if(keys){
					var o = iCat.ROUTERPARAM[hasHash? 'hashs':'paths'];
					iCat.foreach(keys, function(key, i){
						if(~key.indexOf('|')){
							key = key.split('|');
							iCat.foreach(key, function(k){ o[k] = arr[i]; });
						} else {
							o[key.slice(1)] = arr[i];
						}
					});
				} else {
					o = arr;
				}
			};

		if(search){
			iCat.foreach(search.split('&'), function(item){
				item = item.replace(/^([\w\-]+)\=/, '$1{@}').split('{@}');
				iCat.ROUTERPARAM.searchs[item[0]] = item[1];
			});
		}

		if(router.HashMode){
			getData(reg, router.keys, true);
		} else if(router.hashRule){
			getData(reg, router.keys);
			getData(router.hashRule, router.hashKeys, true);
		} else {
			getData(reg, router.keys);
		}

		return iCat.ROUTERPARAM;
	}
})(ICAT, this, document);

;(function(iCat, root, doc, undefined)
{
	iCat.RULECODE = iCat.RULECODE || { _index_:0 }; //规则映射
	iCat.RULEFUNS = iCat.RULEFUNS || {}; //规则回调函数
	iCat.RULELIST = iCat.RULELIST || {}; //规则列表

	/**
	 * iCat.loader.config({
	 * 	 'alias':{}, 'vars': {}, 'map':[],
	 * 	 'base': '...', //默认ICAT路径(去版本)，可配置
	 * 	 'timestamp': 't=20145612346' //默认取ICAT的时间戳，可配置
	 * })
	 */
	iCat.namespace('loader').config = (function(loader){
		var _cfg = iCat.CONFIG, curJS = iCat.icatjs, mf, libf, icathash,
			regRule = /([\w\-]+\/\.\.\/)|\s+/g, // like this: xxx/abc-static/../xyz-static/lib/icat.js
			icatPath = iCat.isString(curJS)? curJS : curJS.getAttribute('src'),
			cfgInfo = sliceURL( icatPath.replace(regRule, ''), true ),
			debugExp = /[\W]?(debug\=\w+)/i;
		
		iCat.mixin(_cfg, cfgInfo);
		_cfg.baseUrl = cfgInfo.domain + cfgInfo.path;
		icathash = cfgInfo.hash? iCat.trim(cfgInfo.hash, true) : '';

		//改写debug初始化设置
		if(icathash && icathash.match(debugExp)){
			var debugReg = icathash.match(debugExp)[1];
				debugReg = debugReg.slice(debugReg.indexOf('=')+1);
			if(debugReg){
				if(debugReg==='true'){
					_cfg.DebugMode = true;
				} else if(debugReg==='false'){
					_cfg.DebugMode = false;
				} else {
					debugReg = debugReg.replace(/([\.\-\/])/g, '\\$1');
					_cfg.DebugMode = (new RegExp(debugReg, 'i')).test(location.href);
				}
				_cfg.hash = _cfg.hash.replace(debugExp, '');
			}

		}

		if(!iCat.isString(curJS)){
			mf = (curJS.getAttribute('data-main') || '').replace(regRule, '');
			libf = (curJS.getAttribute('data-deps') || '').replace(regRule, '');
			if(mf || libf){
				var _mf = iCat.removeExcess(mf);
				_cfg.__depsfile = libf? [libf, mf].join(',') : mf;
				if(/^\w+$/.test(_mf)){
					var inf = sliceURL(doc.baseURI || location.href);
					_cfg.vars['appRef'] = '/' + inf.path;
				} else {
					_cfg.vars['appRef'] = _mf.replace(/\/(assets\/js\/)?[^\/]+$/g, '');
				}
			}
		}

		// get app-path
		if(!_cfg.vars['appRef']){
			iCat.ready(function(){
				var scripts = doc.getElementsByTagName('script');
				for(var i=0, len=scripts.length; i<len; i++){
					var mf = scripts[i].getAttribute('data-main'),
						src = scripts[i].src;
					if(mf){
						_cfg.vars['appRef'] = mf.replace(/\/(assets\/js\/)?[^\/]+$/, '');
						break;
					}
					else if(/\/main[^\/]+$/.test(src)){
						_cfg.vars['appRef'] = src.replace(/\/(assets\/js\/)?[^\/]+$/, '');
						break;
					}
				}
			});
		}

		return function(cfg){
			if(cfg.map) cfg.map = cfg.map.join('~');
			iCat.mixin(iCat.CONFIG, cfg, sliceURL(cfg.base, true));
			iCat.CONFIG.baseUrl = iCat.CONFIG.domain + iCat.CONFIG.path;
		};
	})(iCat.loader);

	iCat.foreach(['inc', 'include', 'require', 'use'], function(fname){
		iCat.loader[fname] = function(){
			var argus = arguments, opt = argus[0],
				fn = fname==='inc'? blockLoad : nonblockLoad;
			if(!iCat.isObject(opt)){
				opt = { files:argus[0], callback:argus[1] };
			}
			loadfile(opt, fn, fname);
		};
	});

	// for webapp-test
	// step1: npm -g install weinre
	// step2: $ weinre --boundHost [IP_address]  --httpPort [port]
	// e.g: ?weinre=90+aaa / ?weinre=http://127.0.0.1:8080+aaa
	iCat.loader.weinreStart = function(server, target){
		var baseURI = doc.baseURI || location.href, weinrejs,
			argus = baseURI.match(/[\?&]weinre\=([^&]+)/),
			info = sliceURL(baseURI),
			domain = isNaN(info.domain)? info.domain : iCat.CONFIG['domain'];
		if(server){
			target = target || 'anonymous';
		}
		else if(argus){
			if(argus[1]==='false') return;
			var arr = argus[1].split('+');
			if(/^\w+\:\/{1,}/.test(arr[0])){
				server = arr[0];
			} else {
				server = domain.replace(/(\:\d+)?\/$/, ':'+(arr[0] && /^\d+$/.test(arr[0])? arr[0] : '8080'));
			}
			target = arr[1] || 'anonymous';
		}
		else {
			server = domain.replace(/(\:\d+)?\/$/, ':8080');
			target = 'anonymous';
		}
		weinrejs = server + '/target/target-script-min.js#' + target + '!';
		loadfile({files:weinrejs}, nonblockLoad);
	};

	iCat.loader.insert = optInsert;
	iCat.util.getAliasFile = _getAliasFile;
	var ltIE9 = /MSIE\s?[6-8]/.test(navigator.userAgent);

	//如果是ip模式，自动调用weinre
	//ie6-8报错：Oops. It seems the page runs in compatibility mode. Please fix it and try again.
	if(!ltIE9 && iCat.IPMode){
		iCat.loader.weinreStart();
	}

	// for unit-test
	if(~(doc.baseURI || location.href).indexOf('loader_test')){
		iCat.loader_test = {};
		iCat.mix(iCat.loader_test, {
			loadfile: loadfile,
			trigger: trigger,
			optInsert: optInsert,
			optDelete: optDelete,
			optUpdate: optUpdate,
			insert: _insert,
			getRule: _getRule,
			getOneRule: _getOneRule,
			changeFileName: _changeFileName,
			sliceURL: sliceURL,
			varsToValue: _varsToValue
		});
	}

	// default libaray
	iCat.loader.config({
		alias: {
			'corecss': '../icatcss/core.min.css',
			'require': '../../require',
			'zepto': '../zepto/1.1.6/zepto',

			'jquery': '../jquery-@version:1.10.2',
			'underscore': '../underscore',
			'backbone': '../backbone/backbone',
			'mvclib': '../mvclib', 'mock': '../mock',

			'storageBackbone': '../backbone/backbone, ../backbone/blocalstorage',
			'bootstrap': '../bootstrap/@VERSION:3.3.1/css/bootstrap.css, ../bootstrap/@VERSION:3.3.1/js/bootstrap',
			
			'angular': '../angular/angular, ../angular/angular-router',
			'n3': '../n3/n3.css, ../n3/n3',
			'widgets': '{appRef}/assets/js/views/widget',
			'common': '{appRef}/assets/js/common'
		}
	});

	/*function setRequire(){
		require.config({
			baseUrl: iCat.CONFIG['baseUrl'], //保持与ICAT一致的参照
			config:{
				'text': {
					useXhr: function(url, protocol, hostname, port){return true;}
				}
			},
			paths: {
				'icat': iCat.version+'/icat', 'jquery': '../jquery-1.10.2',
				'underscore': '../underscore', 'backbone': '../backbone/backbone',
				'backbone.localStorage': '../backbone/blocalstorage',
				'text': '../../plugin/text'
			},
			shim: {
				'jquery': {exports: '$'},
				'underscore': {exports: '_'},
				'backbone': {
					deps: ['jquery', 'underscore'],
					exports: 'Backbone'
				}
			}
		});
	}

	// set require
	if(root.define && define.amd){
		setRequire();
	}*/

	if(ltIE9 && !iCat.CONFIG.noHtml5Shim){
		// html5shiv
		// reference: http://www.cnblogs.com/Capricornus/archive/2013/03/26/2982122.html
		loadfile({files:'../html5'}, nonblockLoad, 'include');
	}

	var _f_s = iCat.CONFIG.__depsfile;
	if(_f_s){
		loadfile({files:_f_s}, nonblockLoad, 'require');
	}

	/**
	 * **********************************
	 *         main function            *
	 * **********************************
	 */
	function loadfile(opt, loadfunc, fname){
		var fid, fn, files = [];

		fid = _insert(opt.files, opt.callback); //bind observer | delayBind

		iCat.foreach(fid.ids, function(id){
			var cfg = iCat.CONFIG, RuleList = iCat.RULELIST, f,
				RuleCode = iCat.RULECODE,
				strArgus = (cfg.timestamp? '?'+cfg.timestamp:'') /*+ (cfg.hash? '#'+cfg.hash:'')*/;
				id = '' + id;
			if(~id.indexOf('+')){
				var arr = [], isCSS = false;
				iCat.foreach(id.split('+'), function(_id){
					var key =RuleCode[_id], o = RuleList[key];
					arr.push(o.rule);
					isCSS = o.ext==='css';
				});
				f = cfg.domain + '??' + arr.join(',');
				files.push({
					id:id, isCSS:isCSS, file:f,
					logKey: arr.join(','),
					url: f + strArgus
				});
			} else {
				var key = RuleCode[id], o = RuleList[key];
					f = (o.weburl? '' : cfg.domain) + o.rule;
				files.push({
					id:id, isCSS:o.ext==='css', logKey:o.rule,
					file: f, url: f+(o.weburl? '':strArgus)
				});
			}
		});

		if(fid.hasIds.length && !fid.ids.length){
			iCat.wait(function(isEnd){
				if(isEnd) return console.warn('某个文件未加载成功，请检查');
				if(!_isReady(fid.hasIds)) return false;
				trigger(fid.hasIds, true);
			}, 5000);
			return; //case1:文件组里全是已加载的文件
		}

		if(!fid.hasIds.length && fname==='use'){
			fname = 'require'; //case2:文件组里没有已加载的文件 却用了use
		}

		if(fid.hasIds.length && fname==='require'){
			fname = 'use'; //case3:文件组里有已加载的文件 却用了require
		}

		if(fname==='use'){
			iCat.wait(function(isEnd){
				if(isEnd) return console.warn('依赖的文件未加载成功，请检查');
				if(!_isReady(fid.hasIds)) return false;

				var fn = function(){
					if(!files.length) return;
					var ff = files.shift();
					loadfunc(ff, files.length? fn : null);
				};

				if(files.length){
					var f = files.shift();
					loadfunc(f, fn);
				}
			}, 5000);
		}
		else if(fname==='require'){
			fn = function(){
				if(!files.length) return;
				var ff = files.shift();
				loadfunc(ff, files.length? fn : null);
			};

			if(files.length){
				var f = files.shift();
				loadfunc(f, fn);
			}
		}
		else {
			iCat.foreach(files, function(f){ loadfunc(f); });
		}
	}
	
	/* 阻塞式加载文件 */
	function blockLoad(opt){
		if(!opt || !iCat.isObject(opt)) return;
		var	tag = opt.isCSS? 'link' : 'script',
			attr = opt.isCSS? ' type="text/css" rel="stylesheet"' : ' type="text/javascript"',
			path = (opt.isCSS? 'href' : 'src') + '="' + opt.url + '"';
		doc.write('<' + tag + attr + path + (opt.isCSS? '/>':'></'+tag+'>'));

		var RuleCode = iCat.RULECODE, RuleList = iCat.RULELIST;
		if(~opt.id.indexOf('+')){ //broadcast
			var arr = opt.id.split('+');
			iCat.foreach(arr, function(id){
				var key = RuleCode[id], rule = RuleList[key];
				rule.ready = true;
			});
			trigger(arr);
		} else {
			var key = RuleCode[opt.id], rule = RuleList[key];
			rule.ready = true;
			trigger(opt.id);
		}
	}

	/* 非阻塞加载文件 */
	function nonblockLoad(opt, fn){
		if(!opt || !iCat.isObject(opt)) return;
		iCat.util.getLifecycle(
			opt.logKey+'-loadBegin', (new Date).getTime()-_BaseTime_
		);
		opt.isCSS?
			_cssLoad(opt, fn) : _scriptLoad(opt, fn);
	}

	/* css文件加载 */
	function _cssLoad(opt, fn){
		var node = doc.createElement('link'),
			pNode = doc.head || doc.getElementsByTagName('head')[0],
			RuleList = iCat.RULELIST, RuleCode = iCat.RULECODE;

		node.setAttribute('type', 'text/css');
		node.setAttribute('rel', 'stylesheet');
		node.setAttribute('href', opt.url);

		//if(fn) setTimeout(function(){fn();}, 15);
		iCat.util.getLifecycle(
			opt.logKey+'-loadEnd', (new Date).getTime()-_BaseTime_
		);
		pNode.appendChild(node);
		fn && fn();
		if(~opt.id.indexOf('+')){
			var arr = opt.id.split('+');
			iCat.foreach(arr, function(id){
				var key = RuleCode[id], rule = RuleList[key];
				rule.ready = true;
			});
			trigger(arr);
		} else {
			var key = RuleCode[opt.id], rule = RuleList[key];
			rule.ready = true;
			trigger(opt.id);
		}
	}

	/* js文件加载 */
	function _scriptLoad(opt, fn){
		var node = doc.createElement('script'),
			pNode = doc.head || doc.getElementsByTagName('head')[0],
			RuleList = iCat.RULELIST, RuleCode = iCat.RULECODE;

		node.setAttribute('type', 'text/javascript');
		node.setAttribute('src', opt.url);
		node.setAttribute('async', true);

		_tellxmd(iCat.CONFIG.ignoreXMD || 'backbone.js, mvclib.js', opt.url);

		if('onload' in node){
			node.addEventListener('load', fnReady = function(){
				iCat.util.getLifecycle(
					opt.logKey+'-loadEnd', (new Date).getTime()-_BaseTime_
				);
				node.removeEventListener('load', fnReady, false);
				fn && fn();
				if(~opt.id.indexOf('+')){
					var arr = opt.id.split('+');
					iCat.foreach(arr, function(id){
						var key = RuleCode[id], rule = RuleList[key];
						rule.ready = true;
					});
					trigger(arr);
				} else {
					var key = RuleCode[opt.id], rule = RuleList[key];
					rule.ready = true;
					trigger(opt.id);
				}
			}, false);
		}
		else if(node.readyState){
			// 参考：https://msdn.microsoft.com/library/ms534361.aspx
			// http://www.cnblogs.com/_franky/archive/2010/06/20/1761370.html
			node.attachEvent('onreadystatechange', fnReady = function(){ //console.log(node.readyState, opt.id);
				if(/loaded|complete/i.test(node.readyState)){ //loaded--ie8下无脚本资源也会触发 暂无解
					iCat.util.getLifecycle(
						opt.logKey+'-loadEnd', (new Date).getTime()-_BaseTime_
					);
					node.detachEvent('onreadystatechange', fnReady);
					fn && fn();
					if(~opt.id.indexOf('+')){
						var arr = opt.id.split('+');
						iCat.foreach(arr, function(id){
							var key = RuleCode[id], rule = RuleList[key];
							rule.ready = true;
						});
						trigger(arr);
					} else {
						var key = RuleCode[opt.id], rule = RuleList[key];
						rule.ready = true;
						trigger(opt.id);
					}
				}
			});
		}
		//setTimeout(function(){ pNode.appendChild(node); }, 100);
		pNode.appendChild(node);
	}

	// ------------------
	// -   functions    -
	// ------------------
	function trigger(ids, onTheWay){
		if(!iCat.$){
			var $ = root.jQuery || root.Zepto || root.ender || root.$;
				iCat.$ = $;
			if(iCat.$){
				iCat.mixin(iCat.$.fn, {
					getCurrentView: function(){
						var view;
						this.each(function(i, el){
							if(el.viewId){
								view = el.viewId;
								return false;
							}
						});
						return iCat.util.getView[view] || null;
					},

					delCurrentView: function(){
						this.each(function(i, el){
							if(el.viewId) delete el.viewId;
						});
					}
				});
			}
		}
		if(!iCat.XMD){
			var xmd = root.seajs || root.require;
			if(xmd) iCat.XMD = xmd;
			if(root.define && define.amd) setRequire();
		}
		if(root.Backbone && root.Backbone._viewRender_===undefined){ //foolproof widget
			iCat.util.viewRender();
			root.Backbone._viewRender_ = true;
		}

		if(iCat.isArray(ids)){
			if(onTheWay){
				iCat.foreach(iCat.RULEFUNS, function(cbs, k){
					if(~k.indexOf('※') && /\|$/.test(k)){
						k = k.replace(/^※|\|$/g, '');
						var arr = k.split('+'), o, first;
						if(arr.length!==ids.length) return;
						arr.sort(); ids.sort();
						if(arr.join('+')!==ids.join('+')) return;
						
						first = cbs.shift();
						if(first){
							o = iCat.util.getCallbacks(first);
							o && o.callback.apply(o.context);
						}
					}
				});
			} else {
				/*iCat.foreach(ids, function(id){
					trigger(id);
				});*/
				trigger(ids[0]); //combo一次性加载好的文件，只需要触发一次
			}
		} else {
			iCat.foreach(iCat.RULEFUNS, function(cbs, k){
				if(~k.indexOf('※')){
					k = k.slice(1);
					var arr = k.split(/[\+\|\~]/), o, first;
						iCat.removeItem(arr, '');
					if(!iCat.hasItem(arr, ids)) return; //fix bug: 0->10
					if(arr.length==1){
						first = cbs.shift();
						if(first){
							o = iCat.util.getCallbacks(first);
							o && o.callback.apply(o.context);
						}
					} else {
						if(_isReady(arr)){
							first = cbs.shift();
							if(first){
								o = iCat.util.getCallbacks(first);
								o && o.callback.apply(o.context);
							}
						}
					}
				}
			});
		}
	}

	function _tellxmd(jsname, url){
		if(!root.define || !jsname) return;
		if(define._amd===undefined) define._amd = define.amd;
		jsname = iCat.trim(jsname, true);

		var arr = jsname.split(','), s = [], reg;
		iCat.foreach(arr, function(v){ s.push(v.replace('.', '\\\.([^\\\.]+\\\.)?')); });
		reg = new RegExp('('+s.join('|')+')', 'i');
		
		if(reg.test(url)){
			define.amd = false;
			// tell requirejs
		} else {
			define.amd = define._amd;
		}
	}

	function _isReady(arr){
		var _arr = arr.concat(), RuleCode = iCat.RULECODE,
			RuleList = iCat.RULELIST;
		iCat.foreach(arr, function(id){
			var key = RuleCode[id],
				rule = RuleList[key];
			if(rule.ready) iCat.removeItem(_arr, id);
			return !!rule.ready; //及时跳出循环
		});
		return !_arr.length; //true = ready
	}

	function optInsert(rs){
		var _getValue = function(s){
			s = iCat.trim(s, true);
			if(!s) return;

			if(~s.indexOf('??')){
				var arr = s.split('??'), ret = [],
					domain = arr[0] || '',
					files = (arr[1] || '').replace(/\?[^\?]+$/g, '');
				if(domain.slice(0,2)==='//') domain = 'http:'+domain;
				iCat.foreach(files.split(','), function(f){
					ret.push(domain+f);
				});
				return ret.join(',');
			}
			return s;
		};

		if(!rs){
			iCat.foreach(
				doc.getElementsByTagName('script'),
				function(s){
					var src = _getValue(s.src || '');
					if(src) _insert(src, undefined, null, true);
				}
			);
			iCat.foreach(
				doc.getElementsByTagName('link'),
				function(l){
					var href = _getValue(l.href || '');
					if(href) _insert(href, undefined, null, true);
				}
			);
		} else {
			_insert(rs);
		}
	}
	function optDelete(argument){/*body...*/}
	function optUpdate(argument){/*body...*/}

	function _insert(rs, callback, app, isReady){
		var RuleCode = iCat.RULECODE, RuleFuns = iCat.RULEFUNS,
			RuleList = iCat.RULELIST, rules = _getRule(rs), cfg = iCat.CONFIG,
			css = [], cssIds = [], js = [], jsIds = [], hasIds = [], key,
			cb = {fname:callback, from:app}, ids = []; //iCat.util.getCallback(callback, app)
		
		//step1: bind-rule & 获取css文件 & 剔除已有
		iCat.foreach(rules, function(o){
			if(!RuleList[o.stringRule]){
				var id = RuleCode._index_;
				RuleCode[o.stringRule] = id;
				RuleCode[id] = o.stringRule;
				RuleCode._index_ = id + 1;

				RuleList[o.stringRule] = o;
				if(isReady) return o.ready = true;
				if(o.ext==='css'){
					css.push(o);
					if(!cfg.combo || cfg.DebugMode) cssIds.push(id);
				} else {
					js.push(o);
					if(!cfg.combo || cfg.DebugMode) jsIds.push(id);
				}
			} else {
				var id = RuleCode[o.stringRule];
				hasIds.push(id);
			}
		});
		if(isReady) return; //过滤掉页面已有的静态文件

		//step2: for combo
		if(cfg.combo && !cfg.DebugMode){
			jsIds = _getComboIds(js);
			cssIds = _getComboIds(css);
		}

		key = '※' + (hasIds.length? hasIds.join('+')+'|' : '') +
				(cssIds.length? cssIds.join('~')+'~' : '') + jsIds.join('~');
		if(RuleFuns[key]){
			RuleFuns[key].push(cb);
		} else {
			RuleFuns[key] = [cb];
		}

		ids = ids.concat(cssIds, jsIds);
		return {hasIds:hasIds, ids:ids};
	}

	function _getComboIds(os){
		var line = '', arr = [], RuleCode = iCat.RULECODE;
		iCat.foreach(os, function(o){
			var id = RuleCode[o.stringRule];
			line += (o.weburl? '@'+id+'@' : id+'+');
		});
		iCat.foreach(line.split('@'), function(group){
			if(group) arr.push(group.replace(/^\+|\+$/g, ''));
		});
		return arr;
	}

	function _getRule(rs){
		var ret = [], o = {};
			rs = iCat.isArray(rs)? rs.join(',') : iCat.isString(rs)? rs : '';
			rs = iCat.trim(rs, true);
		iCat.foreach(rs.split(','), function(r){
			if(!r) return;
			r = _varsToValue(r);
			if(~r.indexOf('>') || /^\-?[\w\.]+(@(\d+\.){2}\d+)?$/.test(r)){
				var ignoreCSS = r.charAt(0)==='-', arr;
					r = ignoreCSS? r.slice(1) : r;
					arr = _getAliasFile(r, ignoreCSS);
				iCat.foreach(arr, function(rr){
					ret.push(_getOneRule(rr));
				});
			} else {
				ret.push(_getOneRule(r));
			}
		});
		return ret;
	}

	function _getOneRule(r){
		var info = sliceURL(r), ret = {originalRule:r}, rname, fname, rule,
			fileName = _changeFileName(info.fileName), cfg = iCat.CONFIG,
			cfgPath = cfg.path, folders, cfgLevels, path,
			domain = info.domain;

		if(info.delv) cfgPath = cfgPath.replace(/\/[\d\.]+\//g, '/');
		folders = cfgPath.slice(0, cfgPath.length-1).split('/');
		cfgLevels = folders.length;
		
		if(!isNaN(domain)){
			if(domain>=cfgLevels){
				path = info.path;
			} else if(domain==0){
				path = cfgPath + info.path;
			} else {
				//for(var i=cfgLevels; i>cfgLevels-domain; i--){ iCat.removeItem(folders, i-1); }
				for(var i=0; i<domain; i++){ folders.pop(); };
				path = folders.join('/') + '/' + info.path;
			}

			if(info.keep){
				rname = fileName.fileRealName + (info.search||'') + (info.hash||'');
				fname = fileName.fileRealName + (info.search? '?'+info.search : '') + (info.hash? '#'+info.hash : '');

				domain = cfg.domain;
				rule = cfg.domain + path + fname;
				info.weburl = true;
			} else if(info.weburl){
				domain = cfg.domain;
				rname = fileName.fileNameProduction;
				fname = cfg.DebugMode? fileName.fileNameDevelopment : rname;
				rule = cfg.domain + path + fname;
			} else {
				rname = fileName.fileNameProduction;
				fname = cfg.DebugMode? fileName.fileNameDevelopment : rname;
				rule = path + fname;
			}
		}
		else if(info.weburl){
			if(info.keep){
				rname = fileName.fileRealName + (info.search||'') + (info.hash||'');
				fname = fileName.fileRealName + (info.search? '?'+info.search : '') + (info.hash? '#'+info.hash : '');
			} else {
				rname = fileName.fileNameProduction;
				var search = info.search || cfg.timestamp,
					hash = info.hash || cfg.hash,
					name = cfg.DebugMode? fileName.fileNameDevelopment : rname;
				fname = name + (search? '?'+search : '')/* + (hash? '#'+hash : '')*/;
			}
			
			path = info.path;
			domain = info.domain || cfg.domain;
			rule = domain + path + fname;
		}
		
		ret['stringRule'] = (domain + path + rname).replace(/[^\w]/g, '');
		ret['rule'] = rule;
		ret['ext'] = fileName.fileExtension;
		ret['weburl'] = !!info.weburl;
		return ret;
	}
	
	//获取别名包含的文件
	function _getAliasFile(alia, ignoreCSS){
		alia = iCat.trim(alia, true);

		var cfg = iCat.CONFIG, alias = cfg.alias,
			ext = '('+cfg.extensions.join('|').replace(/\./g, '\\.')+')$',
			reg = new RegExp(ext), arr = alia.split('@'),
			version = arr[1]; alia = arr[0];
		var fs, len, ret, aFiles = alias[alia],
			lastLevel = alia;
		
		if(iCat.isString(aFiles)){
			aFiles = _varsToValue(aFiles);
			if(/@(\d+\.){2}\d+$/.test(aFiles)){
				return _getAliasFile(aFiles, ignoreCSS);
			}
		}

		if(~alia.indexOf('>')){
			fs = alia.split('>');
			lastLevel = fs[fs.length-1];
			aFiles = (function(fsRoot){
				while(fs.length){
					var level = fs.shift();
					if(fsRoot[level]) fsRoot = fsRoot[level];
					else {
						fsRoot = null;
						break;
					}
				}
				return fsRoot;
			})(alias);
		}

		if(aFiles){
			ret = [];
			if(~alia.indexOf('>')) aFiles = cfg.DebugMode? aFiles : lastLevel;
			aFiles = (iCat.isArray(aFiles)? aFiles.join(',') : aFiles).split(',');
			iCat.foreach(aFiles, function(f){
				f = iCat.trim(f, true);
				f = f.replace(/@version\:((\d+\.){2}\d+)/gi, '@$1');
				f = version? f.replace(/@(version|\:?(\d+\.){2}\d+)/gi, version) : f.replace(/@(version\/?)?/gi, '');
				ret.push(f);
			});
		} else {
			ret = ~alia.indexOf('>')? [] : [alia];
		}

		if(ignoreCSS){
			iCat.foreach(ret, function(f){
				if(/\.css/.test(f)) iCat.removeItem(ret, f);
			});
		}

		return ret;
	}

	function _changeFileName(fileName){
		if(!fileName) return;
			fileName = fileName.toLowerCase();
		
		var cfg = iCat.CONFIG, map, m1, m2,
			reg = new RegExp('('+cfg.extensions.join('|').replace(/\./g, '\\.')+')$'),
			ret = {}, ext, devFilename, proFilename;
			ret['fileRealName'] = fileName;
		
		if(!reg.test(fileName)){ //省略扩展名
			fileName = fileName + '.js';
			ret['fileExtension'] = 'js';
		} else {
			ext = fileName.match(reg);
			if(ext) ret['fileExtension'] = ext[1].slice(1);
		}

		if(ret.fileExtension==='json'){
			ret['fileNameDevelopment'] = ret['fileNameProduction'] = fileName;
			return ret;
		}

		if(cfg.map){
			map = cfg.map.split('~');
			m1 = map[0]; m2 = map[1];
			if(m1==''){
				ret['fileNameDevelopment'] = ~fileName.indexOf(m2)?
						fileName.replace(m2, '') : fileName;
				ret['fileNameProduction'] = ~fileName.indexOf(m2)?
						fileName : fileName.replace(/(\.\w+)$/, m2+'$1');
			} else {
				ret['fileNameDevelopment'] = ~fileName.indexOf(m1)?
					fileName : m2 && ~fileName.indexOf(m2)?
						fileName.replace(m2, m1) : fileName.replace(/(\.\w+)$/, m1+'$1');
				ret['fileNameProduction'] = ~fileName.indexOf(m1)?
					fileName.replace(m1, m2) : m2 && ~fileName.indexOf(m2)?
						fileName : fileName.replace(/(\.\w+)$/, m2+'$1');
			}
		}
		return ret;
	}

	/**
	 * [_sliceUrl description]
	 * @param  {[type]} url = 
	 * [
	 *	 "http://www.taobao.com/kelude/issue/main.js",
	 *	 "https://localhost/kelude/common/path",
	 *	 "file:///D:/aliwork/web/index.css",
	 *	 "file:///D:/aliwork/icat/examples/gallery/index.html",
	 *	 "./kelude/project/setting/page",
	 *	 "../kelude/page",
	 *	 "{2}/abc/main",
	 *	 "{path}/abc/main"
	 * ]
	 * @return {[type]}	 info = 
	 * {
	 *    keep: true/false
	 *    hash: '', search: '', fileName: '',
	 *    
	 *    delv: true/false,
	 *    domain: '', path: '',
	 *
	 *    weburl: true/false,
	 *    protocol: ''
	 * }
	 */
	function sliceURL(url, isConfig){
		if(!url) return;

		var cfgDomain = iCat.CONFIG.domain,
			cfgShortDomain = cfgDomain? cfgDomain.replace(/^\w+\:/, '') : 'icat domain',
			cfgPath = iCat.CONFIG.path,
			info = {}, rest, lastSlash;

		url = iCat.trim(url);
		if(/!$/.test(url)){
			info.keep = true;
			url = url.slice(0, url.length-1);
		}

		if(~url.indexOf('#')){
			rest = url.split('#');
			url = rest[0];
			info.hash = rest[1]; //----hash
		}

		if(~url.indexOf('?')){
			rest = url.split('?');
			url = rest[0];
			info.search = rest[1]; //----search
		}

		lastSlash = url.lastIndexOf('/');
		info.fileName = url.slice(lastSlash+1); //----fileName
		url = url.slice(0, lastSlash+1);
		if(/\{\w+\}/.test(info.fileName)){
			info.fileName = _varsToValue(info.fileName);
		}

		if(/\{\w+\}/.test(url) || ~url.indexOf('□')){
			url = _varsToValue(url);
			//if(/^\d+(\^)?\//.test(url)){
			if(~url.indexOf('□')){
				url = url.slice(1);
				if(~url.indexOf('^')){
					rest = url.split('^/');
					info.delv = true; //去除路径中的版本号
				} else {
					rest = url.replace(/^(\d+)/, '$1@').split('@/');
				}
				info.domain = +rest[0];
				info.path = rest[1];
				return info;
			}
		}
		
		if(/^((\w+\:\/{2,})|\/\/)/.test(url)){//网址
			var slices;
			if(url.charAt(0)==='/'){
				slices = url.split(/(\/\/[^\/]+\/)/);
			} else {
				slices = url.split(/(\:\/{2,}[^\/]+\/)/);
			}
			if(slices.length===3){
				info.protocol = slices[0] || ''; //----protocol
				info.domain = slices[0] + slices[1]; //----domain
				info.path = slices[2];
			} else { //ie
				if(url.charAt(0)==='/'){
					slices = url.replace(/(\/\/[^\/]+\/)/, '$1@').split('@');
				} else {
					slices = url.replace(/(\:\/{2,}[^\/]+\/)/, '$1@').split('@');
				}
				info.domain = slices[0];
				info.path = slices[1];
			}
			if(info.domain===cfgDomain || info.domain===cfgShortDomain){
				//info.path = info.path.replace(cfgPath, ''); --不能这么简单粗暴
				info.path = info.path.replace(/[\w\-]+\/\.\.\//g, '');
				var fd1 = cfgPath.split('/'), fd2 = info.path.split('/'),
					dnum = 0;
				iCat.foreach(fd1, function(fd, i){
					if(fd==fd2[i] && dnum===0) fd2[i] = '@';
					else{
						//fd2.unshift('..');
						dnum++;
					}
				});
				info.domain = dnum-1;//多了icat/
				info.path = fd2.join('/').replace(/@(\/)?/g, '');
			} else {
				info.weburl = true;
			}
		}
		else if(~url.indexOf('\\')){//ie绝对路径
			//D:\aliwork\icat\test\core_test.html => file:///D:/aliwork/icat/test/core_test.html
		}
		else if(url.indexOf('.')===0) {//相对路径
			if(~url.indexOf('^')){
				info.delv = true;
				url = url.replace('^', '');
			}
			var two = url.charAt(1);
			if(two=='/'){
				info.domain = isConfig? './' : 0;
				info.path = url.slice(2);
			}
			else if(two=='.') {
				var r = /\.{2}\//g,
					l = (url.match(r)||[]).length;
				info.domain = l;
				info.path = url.replace(r, '');
				if(isConfig) info.domain = url.replace(info.path, '');
			}
		}
		else {//相对页面
			var inf = sliceURL(doc.baseURI || location.href);
			info.domain = inf.domain;
			info.refRoot = url.charAt(0)==='/';
			info.path = info.refRoot? url.slice(1) : inf.path + url;
			info.weburl = true;
		}

		if(isConfig){
			info.domain = info.domain || '';
			info.timestamp = info.search || ''; delete info.search;
			info.path = (info.path || '').replace(/\d+(\.\d+){2}(\/)?$/, ''); //iCat.version+'/'
		}

		return info;
	}

	function _varsToValue(str){
		var vars = iCat.CONFIG.vars,
			arr = str.match(/\{[^\}]+\}/g);
		if(!arr) return str;
		iCat.foreach(arr, function(k, i){
			var key = k.replace(/\{|\}/g, ''),
				value = vars[key], reg;
			if(/\{\w+\}/.test(value)){
				value = _varsToValue(value);
			}
			if(/^\d+$/.test(key)){
				str = i===0?
					str.replace(k, '□'+key) : str.replace(k+'/', '');
			} else {
				reg = new RegExp(k+(value? '':'/'), 'g');
				str = str.replace(reg, value || '');
			}
		});
		return str;
	}
})(ICAT, this, document);

;(function(iCat, root, doc, undefined)
{
	// main
	var secretKey = iCat.CONFIG.secretKey || 'vkme:valleykiddy@gmail.com';
	iCat.util({
		getController: function(cfg){
			cfg = cfg || iCat.util.getController.CTRLCONFIG || {};
			if(Backbone.Controller!==void 0) return Backbone.Controller.extend(cfg);

			//定义Backbone.Controller
			var Events = Backbone.Events,
				extend = Backbone.Collection.extend, rconfig,
			Ctrl = Backbone.Controller = function(options){
				this.initialize.apply(this, arguments);
				iCat.util.getController.__current_ctrl = this;
			};

			if(cfg.rconfig){
				rconfig = cfg.rconfig;
				delete cfg.rconfig;
			}

			_.extend(Ctrl.prototype, Events, iCat.mixin({
				initialize: function(page, userConfig, projectConfig, list){
					var that = this, Router, ws;
						that.views = [];
						userConfig = userConfig? userConfig :
							(projectConfig || iCat.util.getView.VIEWCONFIG || {});
					
					/**
					 * PageSetting: {
					 * 		home: {
					 * 			layout: 'c2s5',
					 * 			widgets: ['webtop', 'sidebar', 'list'], //['m:webtop', 's:sidebar', 'e:list']
					 * 		},
					 * 		project: ['webtop', 'tools', 'filter'],
					 * 		detail: 'webtop, tools, content'
					 * }
					 */
					that.ctrlList = list;
					ws = userConfig.PageSetting? userConfig.PageSetting[page] : '';
					ws = iCat.isObject(ws)? ws.widgets : (ws || '');
					ws = iCat.isArray(ws)? ws.join(',') : ws;
					that.widgets = ws.replace(/\s/g, '').split(',');

					that.viewConfig = {};
					iCat.mix(that.viewConfig, projectConfig, 'PageSetting');
					iCat.mixin(that.viewConfig, userConfig);
					that.loadWidget();

					if(rconfig){
						Router = Backbone.Router.extend(rconfig);
						that.backboneRouter = new Router(that);
						Backbone.history.start();
					}
				},

				loadWidget: function(){
					var that = this, clist, isWhite;
					if(that.ctrlList){
						if(iCat.isString(that.ctrlList)){
							clist = that.ctrlList.replace(/\s/g, '').split(',');
							isWhite = false;
						} else {
							clist = that.ctrlList;
							isWhite = true;
						}
					}
					that._widgets(that.widgets, null, clist, isWhite);
				},

				importWidget: function(ws, argus){
					if(!ws) return;
					var that = this;
						ws = iCat.isArray(ws)? ws.join(',') : ws;
						ws = ws.replace(/\s/g, '').split(',');
					that._widgets(ws, argus); 
				},

				_widgets: function(ws, argus, clist, isWhite){
					var that = this, cfgs = that.viewConfig;
					iCat.foreach(ws, function(name){
						if(isWhite && !iCat.hasItem(clist, name)) return;
						if(!isWhite && iCat.hasItem(clist, name)) return;

						var config = cfgs[name] || {};
							config.el = config.el || '[data-wgtype="'+name+'"]';

						var oldView = $(config.el).getCurrentView(),
							viewName = config.wgclass || name,
							View = iCat.widget[viewName];
						if(View && (oldView instanceof View)){ //已实例化
							oldView.commParams = iCat.deepClone(iCat.ROUTERPARAM) || {};
							iCat.mixin(oldView.commParams, iCat.deepClone(argus));
							iCat.mix(oldView.commParams, iCat.deepClone(config.mconfig), ['params', 'MergeData']);
							oldView.commParams.params = oldView.commParams.params || {};
							oldView.refresh();
							return;
						}

						if(View){
							new View(config, that);
						} else {
							_findView(viewName, function(View){
								new View(config, that);
							});
						}
					});
				},

				getViewByName: getViewByName,

				addView: function(id){
					var cid = iCat.isObject(id)? id.cid : id;
					this.views.push(cid);
				},

				delView: function(id){
					var cid = iCat.isObject(id)? id.cid : id;
					iCat.removeItem(this.views, cid);
				},

				pipe: function(data){
					if(!data || !iCat.isObject(data)) return;
					var that = this;
					iCat.foreach(this.views, function(id){
						if(id===data.sender) return;
						var model = iCat.util.getView[id].model;
						protocolTrigger(data, model);
					});
				}
			}, cfg));

			Ctrl.extend = extend;
			return Backbone.Controller.extend(cfg);
		},
		getModel: function(cfg){
			return Backbone.Model.extend(
				iCat.mixin({
					defaults: {
						MergeData:{}
					},
					initialize: function(attrs, options, exts){
						var that = this, ps = {};
						iCat.util.getModel._protocols = iCat.util.getModel._protocols || {}; //消息类型

						if(exts.protocols){
							that.protocols = that.protocols || {};
							iCat.mixin(that.protocols, exts.protocols);
							delete exts.protocols;
						}
						that.addProtocols(that.protocols);
						
						iCat.foreach(exts, function(v, k){
							if(k.charAt(0)==='@'){
								ps[k.slice(1)] = v;
								delete exts[k];
							}
						});
						iCat.foreach(that, function(v, k){
							if(k.charAt(0)==='@'){
								ps[k.slice(1)] = v;
								delete that[k];
							}
						});

						iCat.mix(that, exts);
						that.addProtocols(ps);
						iCat.util.getModel[that.cid] = that; //indexing
					},

					getData: function(url, data, callback){
						if(iCat.isFunction(data)){
							callback = data;
							data = {};
						}
						data = iCat.deepClone(data) || {};
						fetchData(url, data, callback);
					},

					postData: function(url, data, callback){
						if(iCat.isFunction(data)){
							callback = data;
							data = {};
						}
						data = iCat.deepClone(data) || {};
						iCat.mixin(data, {type:'post'});
						fetchData(url, data, callback);
					},

					jsonpData: function(url, data, callback){
						if(iCat.isFunction(data)){
							callback = data;
							data = {};
						}
						data = iCat.deepClone(data) || {};
						iCat.mixin(data, {dataType:'jsonp'});
						fetchData(url, data, callback);
					},

					fetchData: function(url, data, callback){
						if(/^((\w+\:\/{2,})|\/\/)/.test(url)){
							this.jsonpData(url, data, callback);
						} else {
							this.getData(url, data, callback);
						}
					},

					chunkData: getChunkData,

					_msgHandle: function(data){
						var ps = iCat.util.getModel._protocols;
						if(ps[this.cid+'@'+data.sign]) return;
						this.getMessage(data);
					},

					getMessage: function(data){ //listen
						/*
						data.sender
						switch(data.sign){
							case 'one': ...break;
							case 'two': ...break;
						}*/
					},

					sendMessage: function(sign, msg, target){ //say
						var view = this.getMyView() || {},
							body = {
								sign: sign || 'anonym',
								sender: view.vname || view.cid,
								message: msg
							};
						if(target){
							target = iCat.isString(target)? getViewByName(target) : target;
							target && protocolTrigger(body, target.model);
						}
						else if(this.controller){
							this.controller.pipe(body);
						}
						else if(view.__freeport){
							iCat.foreach(iCat.util.getView, function(curView, k){
								if(curView.vname===body.sender || curView.cid==body.sender) return;
								var model = curView.model;
								protocolTrigger(body, model);
							}, undefined, true);
						}
					},

					addProtocols: function(o){
						if(!iCat.isObject(o)) return;
						var that = this;
						iCat.foreach(o, function(p, k){
							var ps = iCat.util.getModel._protocols,
								key = that.cid+'@'+k;
							if(iCat.isObject(p)){
								ps[key] = p;
							}
							else if(iCat.isFunction(p)){
								ps[key] = {
									callback: p, on: true,
									description: 'icat widget'
								};
							}
							else if(ps[key]) {
								ps[key].on = !!p;
							}
						});
					},

					protocolOn: function(name){
						var that = this,
							ps = iCat.util.getModel._protocols;
						if(!name || !ps[name]) return;
						ps[name].on = true;
					},

					protocolOff: function(name){
						var that = this,
							ps = iCat.util.getModel._protocols;
						if(!name || !ps[name]) return;
						ps[name].on = false;
					}
				}, cfg)
			);
		},
		getView: function(cfg){
			cfg = cfg || {};
			cfg = iCat.deepClone(cfg);

			if(cfg.official){
				iCat.mixin(cfg, {
					delegate: function(eventName, selector, listener){
						$(doc).on(eventName + '.delegateEvents' + this.cid, selector, listener);
						return this;
					},

					undelegateEvents: function(){
						$(doc).off('.delegateEvents' + this.cid);
						return this;
					}
				});
				delete cfg.official;
			}

			var pickNames = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];
			var classProp = _.pick(cfg, pickNames),
				wgtype = cfg.wgtype,
				viewClass, viewConfig, parent;

			var defaultConfig =
			{
				initialize: function(options, ctrl, model){
					var that = this;
					if(!that.el) that.el = options.el;
					iCat.mix(that, options, pickNames.join(','));
					ctrl = ctrl || iCat.util.getController.__current_ctrl;

					//model
					var mcfg = that.mconfig || {}, exts = {};
					iCat.foreach(mcfg, function(v, k){
						if(iCat.isFunction(v)
							|| k.charAt(0)==='@'
								|| k==='protocols'
						){
							exts[k] = v; delete mcfg[k];
						}
					});
					model = model || that.model || iCat.util.getModel();
					if(iCat.isFunction(model)){
						iCat.mix(exts, {
							viewId: that.cid, controller: ctrl,
							getMyView: function(){ return iCat.util.getView[this.viewId]; }
						});
						that.model = new model(null, null, exts);
					} else {
						iCat.mix(model, exts);
						model.controller = ctrl;
					}

					//params
					that.commParams = iCat.deepClone(iCat.ROUTERPARAM) || {};
					iCat.mix(that.commParams, iCat.deepClone(mcfg), ['params', 'MergeData']);
					that.commParams.params = that.commParams.params || {};
					that.model.commParams = that.commParams;

					//others
					that.__config = options;
					that.template = that.getTemplate(that.tpl);
					that.hasPlugin = that.plugins && that.plugins.length;

					iCat.util.getView[that.cid] = that; //indexing
					if(ctrl) ctrl.addView(that.cid);
					if(!that.template) return;

					that.init();
					that.controller = ctrl;
					that.vname = that.vname || that.cid;

					//renderBegin time
					iCat.util.getLifecycle(
						that.vname + '-renderBegin',
						(new Date).getTime() - _BaseTime_
					);

					//style
					if(that.style && iCat.util.insertCss[that.widgetName]===undefined){
						var css = iCat.decode(that.style, 'vkme:valleykiddy@gmail.com');
						iCat.util.insertCss(css);
						iCat.util.insertCss[that.widgetName] = true; //don't insert repeatedly
					}

					//first render
					that.displayType = that.displayType || 0;
					if(that.displayType==1 || that.displayType==2){
						that.model.set(mcfg);
						that.listenTo(that.model, 'change', that.render);
						that._render(true);
					} else {
						that.listenTo(that.model, 'change', that.render);
						that.model.set(iCat.isEmptyObject(mcfg)? {"widgetSlogan":"trigger me..."} : mcfg);
					}
				},

				init: function(){},
				beforeRender: function(data){return data;},
				afterRender: function(){},
				setPlugins: function(){},

				//render
				render: function(){
					this._render();
				},
				renderWithData: function(data){
					this._render(false, data);
				},
				dataRender: function(data){
					this._render(false, data);
				},
				_render: function(isTool, data){
					var that = this, model = that.model,
						dcname = model.get('dcname'),
						md = model.get('MergeData');
					
					if(that.preventFirstRender){
						//view-dom bind
						that.$el.each(function(){this.viewId = that.cid;});
						$(that.menu).each(function(){this.viewId = that.cid;});
						return that.preventFirstRender = false;
					}
					
					if(isTool && that.menu){
						that.$menu = $(that.menu);
						if(!that.$menu.length) return; // menu is required
						that._handleRender();
						
						var menuSelector = iCat.isString(that.menu)? that.menu : that.$menu.selector;
						iCat.foreach(that.events, function(fn, k){
							if(!/^\d@/.test(k)) return;
							k = k.split('@');
							if(that.displayType==k[0]){
								var key = k[1], method = iCat.isString(fn)? that[fn] : fn,
									match = key.match(/^(\S+)\s*(.*)$/),
									eKey = match[1]+'.'+that.widgetName; //'.'+that.cid -> repeated bind
								if(!method) return;
								$(doc).off(eKey)
									.on(eKey, menuSelector+' '+match[2], _.bind(method, that));
							}
						});

						if(!that.$el.length && that.el) that.setElement(that.el); //reset
					}

					if(data){
						var _data = that.beforeRender(data);
						if(_data){
							_data = iCat.mixin({}, md, _data);
							that._bodyRender(_data);
							that._afterRender(_data);
						}
					}
					else {
						if(dcname){
							model.chunkData(dcname, function(ret){
								that.originalData = iCat.deepClone(ret);
								var _ret = that.beforeRender(ret);
								var isSuccess = _ret.success!==undefined? _ret.success : true;
								if(_ret && isSuccess){
									_ret = iCat.mixin({}, md, _ret);
									that._bodyRender(_ret);
									that._afterRender(_ret);
								}
								else if(model.asyncfunc){
									model.asyncfunc(function(ret){
										that.originalData = iCat.deepClone(ret);
										var _ret = that.beforeRender(ret);
										if(_ret){
											_ret = iCat.mixin({}, md, _ret);
											that._bodyRender(_ret);
											that._afterRender(_ret);
										}
									});
								}
								model.unset('dcname', {silent:true});
							});
						} else if(model.asyncfunc){
							model.asyncfunc(function(ret){
								that.originalData = iCat.deepClone(ret);
								var _ret = that.beforeRender(ret);
								if(_ret){
									_ret = iCat.mixin({}, md, _ret);
									that._bodyRender(_ret);
									that._afterRender(_ret);
								}
							});
						} else {
							that._bodyRender(md);
							that._afterRender(md);
						}
					}
				},
				_handleRender: function(){
					var that = this, model = that.model,
						md = model.get('MergeData');
					that.$menu.each(function(){
						this.viewId = that.cid; //view-dom bind
						var me = $(this), html,
							p = me.closest('[data-MergeData], [data-InitData]');
						var dmd = getDomData(p.attr('data-MergeData')),
							did = getDomData(p.attr('data-InitData')),
							dd = iCat.mixin({}, md, dmd, did);
						dd.__toolRender__ = true;
						dd.displayType = that.displayType;
						html = that.template(dd);

						me.html(!that.style? html.replace(/<\/?widget[^>]+>/g, '') : html);
						p.removeAttr('data-InitData');
					});
				},
				_bodyRender: function(data){
					var that = this, model = that.model,
						way = iCat.trim(that.insertWay || '') || 'html';
					that.$el.each(function(){
						this.viewId = that.cid; //view-dom bind
						var me = $(this), html,
							p = me.closest('[data-MergeData], [data-InitData]'),
							lazyWrap = me.find('[lazy-load-wrap]');
						var	dmd = getDomData(p.attr('data-MergeData')),
							did = getDomData(p.attr('data-InitData')),
							dd = iCat.mixin({}, data, dmd, did);
							dd.displayType = that.displayType;
						if(lazyWrap[0] && lazyWrap.attr('data-from')===that.widgetName){
							var k = lazyWrap.attr('lazy-load-wrap');
							html = that.getMicroTemplate(k, dd);
							lazyWrap[way](html || '');
						} else {
							html = that.template(dd);
							me[way](!that.style? html.replace(/<\/?widget[^>]+>/g, '') : html);
						}
						p.removeAttr('data-InitData');
					});
				},
				_afterRender: function(data){
					var that = this;

					if(that.hasPlugin){
						iCat.loader.require(that.plugins, function(){
							that.setPlugins(data);
						});
					}
					iCat.util.getLifecycle(
						that.vname + '-renderEnd',
						(new Date).getTime() - _BaseTime_
					);

					if(that.extentions){
						var viewConfig, argus;
						if(that.controller){
							viewConfig = that.controller.viewConfig || {};
						} else {
							viewConfig = that.subConfig || {};
						}
						
						iCat.foreach(that.extentions, function(extName){
							var cfg = iCat.deepClone(viewConfig[extName]) || {};
								cfg.el = that.$(cfg.el || '[data-wgtype="'+extName+'"]');
								cfg.parentViewId = that.cid;
							
							var oldView = cfg.el.getCurrentView(),
								viewName = cfg.wgclass || extName,
								View = iCat.widget[viewName];
							if(View && (oldView instanceof View)){ //已实例化
								oldView.commParams = iCat.deepClone(iCat.ROUTERPARAM) || {};
								iCat.mix(oldView.commParams, iCat.deepClone(cfg.mconfig), ['params', 'MergeData']);
								oldView.commParams.params = oldView.commParams.params || {};
								oldView.refresh();
								return;
							}

							if(View){
								new View(cfg, that.controller);
							} else {
								_findView(viewName, function(View){
									new View(cfg, that.controller);
								});
							}
						});
					}

					that.afterRender(data);
					iCat.util.viewRender(that.$el);
				},

				//other api
				copy: function(myconfig){
					return new this.constructor(
						myconfig//iCat.mixin(iCat.deepClone(this.__config) || {}, myconfig)
					);
				},

				refresh: function(){
					this.model.set('timestamp', (new Date).getTime());
				},

				destroy: function(){
					var that = this;
					if(that.$menu) that.$menu.each(function(){delete that.viewId;}).empty();
					that.$el.each(function(){delete that.viewId;}).empty();
					that.stopListening();
					that.controller && that.controller.delView(that.cid);
					delete iCat.util.getView[that.cid];
					return that;
				},

				getTemplate: function(t, data){
					return iCat.util.getTemplate(t, data, this.widgetName);
				},

				getMicroTemplate: function(t, data){
					var prefix = this.widgetName? this.widgetName+'_' : '';
					return iCat.util.getMicroTemplate(prefix+t, data);
				}
			};

			viewConfig = iCat.deepClone(defaultConfig);
			iCat.mix(viewConfig, cfg, pickNames.join(','));
			parent = Backbone.View.extend(viewConfig);
			viewClass = inherit(parent, classProp);

			if(wgtype) viewClass.wgtype = wgtype;
			return viewClass;
		}
	});

	iCat.util({
		getChunkData: getChunkData,
		getViewByName: getViewByName,
		viewRender: function(wrap){
			//if(iCat.util.viewRender.__hasExec) return; //exec once
			wrap = wrap || $('body');
			wrap.find('[icat-widget]').each(function(i, el){
				if(el.viewId) return;
				var me = $(el), viewName = me.attr('icat-widget'),
					View = iCat.widget[viewName];
				if(!View){
					var path = me.attr('icat-widget-path');
					if(path){
						iCat.loader.require(path, function(){
							if(iCat.widget[viewName]) _viewinit(el, viewName);
						});
					} else {
						_findView(viewName, function(){
							_viewinit(el, viewName);
						});
					}
				} else {
					_viewinit(el, viewName);
				}
			});
			//iCat.util.viewRender.__hasExec = true;
		}
	});

	//foolproof widget
	if(root.Backbone && root.Backbone._viewRender_===undefined){
		iCat.util.viewRender();
		root.Backbone._viewRender_ = true;
	}

	// for unit-test
	if(~(doc.baseURI || location.href).indexOf('mvc_test')){
		iCat.mvc_test = {};
		iCat.mix(iCat.mvc_test, {
			getChunkData: getChunkData,
			getDomData: getDomData,
			fetchData: fetchData
		});
	}

	/** functions **/
	function inherit(parent, picks){
		var icatview = function(){
			var argus = Array.prototype.slice.call(arguments),
				opts = argus[0] || {}, that = this,
				pView = opts.parentViewId?
					getViewByName(opts.parentViewId) : null;
				opts = iCat.mixin({}, iCat.deepClone(picks), opts);
			if(pView && opts.events){ //prevents rebind
				iCat.foreach(pView.events, function(evt, k){
					if(opts.events[k]) delete opts.events[k];
				});
			}
			argus[0] = opts;
			iCat.foreach(opts, function(v, k){
				if(iCat.isFunction(v)) that[k] = v;
			});
			return parent.apply(that, argus);
		};

		var Surrogate = function(){ this.constructor = icatview; };
		Surrogate.prototype = parent.prototype;
		icatview.prototype = new Surrogate;
		icatview.__super__ = parent.prototype;

		return icatview;
	}

	// get data
	function getChunkData(dcname, callback){
		if(!dcname) return;

		root.PAGEDATA = root.PAGEDATA || {};
		var data = root.PAGEDATA[dcname],
			reg = /(\{[^\}]+\})|(\[[^\]]+\])/;
		if(data){
			if(iCat.isString(data)){
				if(/^[\d\^]+$/.test(data)) data = iCat.decode(data, secretKey);
				if(reg.test(data)) data = JSON.parse(data);
			}
			callback && callback(data);
		} else {
			iCat.wait(function(end){
				var d = root.PAGEDATA[dcname];
				if(end) d = {success:false, message:'获取数据超时'};
				if(!d) return false;

				if(iCat.isString(d)){
					if(/^[\d\^]+$/.test(d)) d = iCat.decode(d);
					if(reg.test(d)) d = JSON.parse(d, secretKey);
				}
				callback && callback(d);
			}, 1000);
		}
	}

	function getDomData(s){
		if(!s || s.indexOf('=>')<0) return {};
		s = iCat.trim(s);
		var arr = s.split(/,\s*/), ret = {};
		iCat.foreach(arr, function(item){
			item = item.split('=>');
			var v = item[1] || '';
			ret[item[0]] = ~v.indexOf('=')? _getDomSubData(v) : _toType(v);
		});
		return ret;
	}
	function _getDomSubData(s){
		var o = {}, arr = s.split('&');
		iCat.foreach(arr, function(item){
			item = item.replace(/^([\w\-]+)\=/, '$1{@}').split('{@}');
			o[item[0]] = _toType(item[1]);
		});
		return o;
	}
	function _toType(v){
		if(v==='') return undefined;
		if(/^(true|false)$/i.test(v)) return v!=='false';
		if(!isNaN(v)) return +v;
		return v;
	}

	function fetchData(url, cfg, fn){
		if(!url || !iCat.$) return;
		var storageData, _url = iCat.removeExcess(url),
			argus = iCat.mix({}, cfg, 'isStorage, type, dataType');
			fn = fn || function(){};
		
		if(cfg.isStorage){
			storageData = iCat.util.storage(_url);
			if(storageData){ //先使用缓存
				fn(JSON.parse(storageData));
			}
		}

		iCat.$.ajax({
			url: url, data: argus,
			type: cfg.type || 'get',
			dataType: cfg.dataType,
			success: function(ret){
				if(iCat.isString(ret) && ~ret.indexOf('<!DOCTYPE html>')){
					fn({
						success:false, dataError:true, message:"返回数据有误",
						errorHtml: '<div class="data-error">'+ url +'返回数据有误</div>'
					});
					return;
				};

				ret = iCat.isString(ret)? JSON.parse(ret) : ret;
				if(cfg.isStorage){
					if(!_matchJSON(storageData, ret)){
						iCat.util.storage(_url, ret);
						fn(ret);
					}
				}
				else {
					fn(ret);
				}
			},
			error: function(){
				fn({success:false, dataError:true, message:"返回数据有误"});
			}
		});
	}
	function _matchJSON(d1, d2){
		if(!d1 || !d2) return false;
		var s1 = JSON.stringify(d1).replace(/\\|\'|\"|\s/g, '');
		var s2 = JSON.stringify(d2).replace(/\\|\'|\"|\s/g, '');
		return s1===s2;
	}

	// get view & message
	function getViewByName(name){
		var view = iCat.util.getView[name];
		if(view) return view;

		iCat.foreach(iCat.util.getView, function(o, k){
			if(o.vname===name){
				view = o; return false;
			}
		}, undefined, true);
		return view;
	}

	function protocolTrigger(data, model){
		var ps = iCat.util.getModel._protocols,
			signs = ~data.sign.indexOf(',')?
				iCat.trim(data.sign, true).split(',') : [data.sign],
			emit, findIt = false;
		iCat.foreach(ps, function(p, k){
			var cid = k.match(/^([^@]+)/);
				cid = cid? cid[1] : '';
			k = k.replace(cid, '');
			if(iCat.hasItem(signs, k.slice(1)) && model.cid==cid){
				var onStatus = model[k]===undefined? p.on : model[k];
				if(onStatus) emit = iCat.isFunction(p.callback)? p.callback : model[p.callback];
				return !(findIt = true);
			}
		});
		if(findIt){
			emit && emit.call(model, data.message);
		} else {
			model._msgHandle(data);
		}
	}

	function _viewinit(el, viewName){
		var me = $(el),
			View = iCat.widget[viewName];

		//el.__widgetName_backup = viewName;
		me.removeAttr('icat-widget');

		var domcfg = getDomData(me.attr('icat-widget-config')),
			mcfg = getDomData(me.attr('icat-widget-mconfig'));
			domcfg.displayType = domcfg.displayType || 0;
			domcfg.__freeport = true;
		if(domcfg.displayType!=0){
			domcfg.menu = el;
		} else {
			domcfg.el = el;
		}
		domcfg.mconfig = mcfg;
		new View(domcfg, iCat.util.getController.__current_ctrl);
	}

	function _findView(viewName, callback){
		var View, findIt = false;
		iCat.foreach(iCat.widget, function(w){
			if(w.wgtype && w.wgtype==viewName){
				callback(w);
				return !(findIt = true);
			}
		}, undefined, true);

		if(!findIt){
			iCat.wait(function(isEnd){
				if(!iCat.widget[viewName] && !isEnd) return false;
				if(isEnd){
					iCat.loader.require(viewName, function(){
						View = iCat.widget[viewName];
						if(View) callback(View);
					});
				} else {
					callback(iCat.widget[viewName]);
				}
			}, 1000);
		}
	}
})(ICAT, this, document);