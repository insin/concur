var path = require('path')

var buildumb = require('buildumb')

buildumb.build({
  root: path.normalize(path.join(__dirname, '..'))
, modules: {
    'node_modules/isomorph/is.js'     : 'isomorph/is'
  , 'node_modules/isomorph/object.js' : 'isomorph/object'
  , 'lib/concur.js'                   : 'concur'
  }
, exports: {
    'Concur': 'concur'
  }
, output: 'concur.js'
, compress: 'concur.min.js'
, header: buildumb.formatTemplate(path.join(__dirname, 'header.js'),
                                  require('../package.json').version)
})
