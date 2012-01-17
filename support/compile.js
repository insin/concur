var fs = require('fs')
  , path = require('path')
  , util = require('util')

var request = require('request')

var root = path.normalize(path.join(__dirname, '..'))

// Config
var config = {
  modules: {
    'isomorph/lib/is': 'node_modules/isomorph/lib/is.js'
  , 'isomorph/lib/object': 'node_modules/isomorph/lib/object.js'
  , 'concur': 'lib/concur.js'
  }
, output: 'concur.js'
}

// Input
var modules = []
for (var name in config.modules) {
  var modulePath = path.join(root, config.modules[name])
  console.log('compile: %s (from %s)', name, modulePath)
  modules.push(
    util.format("require.define('%s', function(module, exports, require) {\n", name) +
    fs.readFileSync(modulePath) +
    '})\n'
  )
}

// Output
var template = fs.readFileSync(path.join(__dirname, 'template.js')).toString()
  , code = util.format(template, modules.join('\n'))
  , outputPath = path.join(root, config.output)
  , headerTemplate = fs.readFileSync(path.join(__dirname, 'header.js')).toString()
  , header = util.format(headerTemplate, require('../package.json').version)
console.log('create: %s', outputPath)
fs.writeFileSync(outputPath, header + code)

// Compress
var compressedOutputPath = outputPath.replace('.js', '.min.js')

function printErrorInfo(error) {
  console.error('  L%s,%s [%s] %s',
                error.lineno, error.charno, error.type, error.error)
}

function processClosureCompilerResponse(err, response, body) {
  if (err) throw err
  var result = JSON.parse(body)
  console.log('statusCode: %s', response.statusCode)
  if (result.hasOwnProperty('errors')) {
    console.error('errors:')
    result.errors.forEach(printErrorInfo)
  }
  if (result.hasOwnProperty('warnings')) {
    console.error('warnings:')
    result.warning.forEach(printErrorInfo)
  }
  console.log('statistics:')
  console.log('  original size: %s (%s gzipped)',
              result.statistics.originalSize, result.statistics.originalGzipSize)
  console.log('  compressed size: %s (%s gzipped)',
              result.statistics.compressedSize, result.statistics.compressedGzipSize)
  if (!result.hasOwnProperty('errors')) {
    console.log('compressed: %s', compressedOutputPath)
    fs.writeFileSync(compressedOutputPath, header + result.compiledCode)
  }
}

console.log('compressing %s...', outputPath)
request.post({
    url: 'http://closure-compiler.appspot.com/compile'
  , form: {
      js_code: code
    , compilation_level: 'SIMPLE_OPTIMIZATIONS'
    , output_format: 'json'
    , output_info: ['compiled_code', 'errors', 'warnings', 'statistics']
    }
  }
, processClosureCompilerResponse)
