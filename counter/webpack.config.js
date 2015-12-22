
var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: [
        './src/main.jsx'
    ],
    output: {
        filename: 'counter.js',
        path: path.join(__dirname, 'build'),
        publicPath: '/build/'
    },
    plugins: [
        new webpack.NoErrorsPlugin()
    ],
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                loaders: ['babel-loader?presets[]=react&presets[]=es2015&plugins[]=react-originjs'],
                include: path.join(__dirname, 'src')
            }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
};
