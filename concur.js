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
require.define('isomorph/lib/is', function(module, exports, require) {
var toString = Object.prototype.toString

// Type checks

function isArray(o) {
  return toString.call(o) == '[object Array]'
}

function isBoolean(o) {
  return toString.call(o) == '[object Boolean]'
}

function isDate(o) {
  return toString.call(o) == '[object Date]'
}

function isError(o) {
  return toString.call(o) == '[object Error]'
}

function isFunction(o) {
  return toString.call(o) == '[object Function]'
}

function isNumber(o) {
  return toString.call(o) == '[object Number]'
}

function isObject(o) {
  return toString.call(o) == '[object Object]'
}

function isRegExp(o) {
  return toString.call(o) == '[object RegExp]'
}

function isString(o) {
  return toString.call(o) == '[object String]'
}

// Content checks

function isEmpty(o) {
  for (var prop in o) {
    return false
  }
  return true
}

module.exports = {
  Array: isArray
, Boolean: isBoolean
, Date: isDate
, Empty: isEmpty
, Error: isError
, Function: isFunction
, NaN: isNaN
, Number: isNumber
, Object: isObject
, RegExp: isRegExp
, String: isString
}
})

require.define('concur', function(module, exports, require) {
var is = require('isomorph/lib/is')

/**
 * Copies properties from one object to another.
 */
function extend(dest, src) {
  if (src) {
    for (var prop in src) {
      if (src.hasOwnProperty(prop)) {
        dest[prop] = src[prop]
      }
    }
  }
  return dest
}

/**
 * Makes a constructor inherit another constructor's prototype without
 * having to actually use the constructor; also adds a __super__ property
 * for access to the inherited-from constructor's prototype.
 */
function inheritPrototype(childConstructor, parentConstructor) {
  var F = function() {}
  F.prototype = parentConstructor.prototype
  childConstructor.prototype = new F()
  childConstructor.prototype.constructor = childConstructor
  childConstructor.__super__ = parentConstructor.prototype
  return childConstructor
}

/**
 * Inherits another constructor's prototype and sets its prototype and
 * constructor properties in one fell swoop.
 *
 * If a child constructor is not provided via prototypeProps.constructor,
 * a new constructor will be created.
 */
function inheritFrom(parentConstructor, prototypeProps, constructorProps) {
  // Get or create a child constructor
  var childConstructor
  if (prototypeProps && prototypeProps.hasOwnProperty('constructor')) {
    childConstructor = prototypeProps.constructor
  }
  else {
    childConstructor = function() {
      return parentConstructor.apply(this, arguments)
    }
  }

  // Inherit constructor properties
  extend(childConstructor, parentConstructor)

  // Inherit the parent's prototype
  inheritPrototype(childConstructor, parentConstructor)

  // Add prototype properties, if given
  if (prototypeProps) {
    extend(childConstructor.prototype, prototypeProps)
  }

  // Add constructor properties, if given
  if (constructorProps) {
    extend(childConstructor, constructorProps)
  }

  return childConstructor
}

/**
 * Namespace and dummy constructor for initial extension.
 */
var Concur = module.exports = function() {}

/**
 * Creates or uses a child constructor to inherit from the the call
 * context, which is expected to be a constructor.
 */
Concur.extend = function(prototypeProps, constructorProps) {
  // If the constructor being inherited from has a __meta__ function, call
  // it to customise prototype and constructor properties before they are
  // used for inheritance.
  if (typeof this.prototype != 'undefined' &&
      typeof this.prototype.__meta__ != 'undefined') {
    // Property objects must always exist so properties can be added to
    // and removed from them.
    prototypeProps = prototypeProps || {}
    constructorProps = constructorProps || {}
    this.prototype.__meta__(prototypeProps, constructorProps)
  }

  // Set up and return the new child constructor
  var parentConstructor = this
  var childConstructor = inheritFrom(parentConstructor,
                                     prototypeProps,
                                     constructorProps)
  childConstructor.extend = this.extend
  return childConstructor
}
})

  window['Concur'] = require('concur')
})()