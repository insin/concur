;(function() {
  var modules = {}
  function require(name) {
    return modules[name]
  }
  require.define = function(name, fn) {
    var module = {}
      , exports = {}
    module.exports = exports
    fn(module, exports, require)
    modules[name] = module.exports
  }
%s
  window['concur'] = require('concur')
})()