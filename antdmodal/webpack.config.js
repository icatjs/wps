module.exports = function(webpackConfig) {
  webpackConfig.module.loaders.forEach(function(loader) {
    if (loader.loader === 'babel') {
      // https://github.com/ant-design/babel-plugin-antd
      loader.query.plugins.push('antd');
      // https://github.com/valleykid/babel-plugin-react-originjs
      loader.query.plugins.push('react-originjs');
    }
    return loader;
  });

  return webpackConfig;
};