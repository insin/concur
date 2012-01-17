var qunit = require('qunit')
  , path = require('path')

qunit.run({ code: {path: path.join(__dirname, '../lib/concur.js'), namespace: 'Concur'}
          , tests: [path.join(__dirname, 'concur.js')]
          })
