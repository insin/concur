var qunit = require('qunit')

qunit.run({ code: {path: '../concur.js', namespace: 'Concur'}
          , tests: ['./concur.js']
          })
