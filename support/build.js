var path = require('path')

var buildumb = require('buildumb')

buildumb.build({
  root: path.normalize(path.join(__dirname, '..'))
, modules: {
    'node_modules/isomorph/lib/is.js'     : 'isomorph/lib/is'
  , 'node_modules/isomorph/lib/object.js' : 'isomorph/lib/object'
  , 'lib/concur.js'                       : 'concur'
  }
, exports: {
    'Concur': 'concur'
  }
, output: 'concur.js'
, compress: 'concur.min.js'
, header: buildumb.formatTemplate(path.join(__dirname, 'header.js'),
                                  require('../package.json').version)
})
