;(function(__global__, server) {

/**
 * Namespace and dummy constructor for initial extension.
 */
function Concur() {}

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
 * Creates or uses a child constructor to inherit from the the call
 * context, which is expected to be a constructor.
 */
function extendConstructor(prototypeProps, constructorProps) {
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

  var parentConstructor = this
  var childConstructor = inheritFrom(parentConstructor,
                                     prototypeProps,
                                     constructorProps)
  childConstructor.extend = this.extend
  return childConstructor
}

extend(Concur, {
  extend: extendConstructor
, cp: extend
, inheritPrototype: inheritPrototype
, inheritFrom: inheritFrom
})

if (server) {
  module.exports = Concur
}
else {
  __global__.Concur = Concur
}

})(this, !!(typeof module != 'undefined' && module.exports))
