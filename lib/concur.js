var is = require('isomorph/lib/is')
  , object = require('isomorph/lib/object')

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

  // Base constructors should only have the properties they're defined with
  if (parentConstructor !== Concur) {
    // Inherit constructor properties
    object.extend(childConstructor, parentConstructor)

    // Inherit the parent's prototype
    object.inherits(childConstructor, parentConstructor)
    childConstructor.__super__ = parentConstructor.prototype
  }

  // Add prototype properties, if given
  if (prototypeProps) {
    object.extend(childConstructor.prototype, prototypeProps)
  }

  // Add constructor properties, if given
  if (constructorProps) {
    object.extend(childConstructor, constructorProps)
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
