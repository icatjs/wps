(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

window.ReactForiCat = _react2.default;

var HelloWorld = (function (_React$Component) {
	_inherits(HelloWorld, _React$Component);

	function HelloWorld() {
		_classCallCheck(this, HelloWorld);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(HelloWorld).apply(this, arguments));
	}

	_createClass(HelloWorld, [{
		key: 'testfun',
		value: function testfun() {
			this.props.testfun();
		}
	}, {
		key: 'render',
		value: function render() {
			return _react2.default.createElement(
				'p',
				{ onClick: this.testfun.bind(this) },
				'Hello, world!'
			);
		}
	}]);

	return HelloWorld;
})(_react2.default.Component);

;

HelloWorld.defaultProps = {
	testfun: function testfun() {
		console.log('hello vkme...');
	}
};

exports.default = HelloWorld;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
(function (global){
'use strict';

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var _reactDom = (typeof window !== "undefined" ? window['ReactDOM'] : typeof global !== "undefined" ? global['ReactDOM'] : null);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _helloWorld = require('./hello-world');

var _helloWorld2 = _interopRequireDefault(_helloWorld);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.ReactForiCat = _react2.default;

(window['ICAT']? window['ICAT'].react : function(){
              var argus = Array.prototype.slice.call(arguments),
                rcDom = argus[1], el = argus[4], vdom = argus[5]; 
              rcDom.render(vdom, el);
            })('./hello-world/HelloWorld', _reactDom2.default, _helloWorld2.default, null, document.getElementById('wrap'), _react2.default.createElement(_helloWorld2.default, null));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./hello-world":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJoZWxsby13b3JsZC5qc3giLCJpbmRleC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ0VNLFVBQVU7V0FBVixVQUFVOztVQUFWLFVBQVU7d0JBQVYsVUFBVTs7Z0VBQVYsVUFBVTs7O2NBQVYsVUFBVTs7NEJBQ047QUFDUixPQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQ3JCOzs7MkJBQ087QUFDUCxVQUFPOztNQUFHLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQUFBQzs7SUFBa0IsQ0FBQztHQUM5RDs7O1FBTkksVUFBVTtHQUFTLGdCQUFNLFNBQVM7O0FBT3ZDLENBQUM7O0FBRUYsVUFBVSxDQUFDLFlBQVksR0FBRztBQUN2QixRQUFPLEVBQUUsbUJBQVU7QUFDbEIsU0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztFQUM3QjtDQUNILENBQUM7O2tCQUVhLFVBQVU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2J6Qjs7OzsyRkFBZ0MsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBL0MseURBQWMsRUFBbUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbiBcbmNsYXNzIEhlbGxvV29ybGQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG5cdHRlc3RmdW4oKXtcblx0XHR0aGlzLnByb3BzLnRlc3RmdW4oKTtcblx0fVxuXHRyZW5kZXIoKXtcblx0XHRyZXR1cm4gPHAgb25DbGljaz17dGhpcy50ZXN0ZnVuLmJpbmQodGhpcyl9PkhlbGxvLCB3b3JsZCE8L3A+O1xuXHR9XG59O1xuXG5IZWxsb1dvcmxkLmRlZmF1bHRQcm9wcyA9IHtcbiAgXHR0ZXN0ZnVuOiBmdW5jdGlvbigpe1xuICBcdFx0Y29uc29sZS5sb2coJ2hlbGxvIHZrbWUuLi4nKTtcbiAgXHR9ICBcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEhlbGxvV29ybGQ7IiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IEhlbGxvV29ybGQgZnJvbSAnLi9oZWxsby13b3JsZCc7XG5cblJlYWN0RE9NLnJlbmRlcig8SGVsbG9Xb3JsZCAvPiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dyYXAnKSk7Il19
