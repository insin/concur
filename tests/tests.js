var path = require('path')

var qqunit = require('qqunit')

global.Concur = require('../lib/concur')

var tests = [path.join(__dirname, 'concur.js')]

qqunit.Runner.run(tests, function(stats) {
  process.exit(stats.failed)
})
