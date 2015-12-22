import React from 'react';
 
class HelloWorld extends React.Component{
	testfun(){
		this.props.testfun();
	}
	render(){
		return <p onClick={this.testfun.bind(this)}>Hello, world!</p>;
	}
};

HelloWorld.defaultProps = {
  	testfun: function(){
  		console.log('hello vkme...');
  	}  
};

export default HelloWorld;