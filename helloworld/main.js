require.config({
	paths: {
		'icat': './lib/icat/0.0.1/icat',
		'react': './lib/react',
		'reactDOM': './lib/react-dom'
	}
});

define(['react', 'reactDOM', 'icat'], function(React, ReactDOM, iCat){
	window.React = React;
	window.ReactDOM = ReactDOM;

	require(['./dist/bundle'], function(){
		iCat.react['./hello-world/HelloWorld']({
			el: document.getElementById('appwrap'),
			testfun: function(){
				//alert(0);
				console.log('this');
			}
		});
	});
});