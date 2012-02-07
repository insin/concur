var is = require('isomorph/lib/is')
  , object = require('isomorph/lib/object')

/**
 * Mixes in properties from one object to another. If the source object is a
 * Function, its prototype is mixed in instead.
 */
function mixin(dest, src) {
  if (is.Function(src)) {
    object.extend(dest, src.prototype)
  }
  else {
    object.extend(dest, src)
  }
}

/**
 * Applies mixins specified as a __mixin__ property on the given properties
 * object, returning an object containing the mixed in properties.
 */
function applyMixins(properties) {
  var mixins = properties.__mixin__
  if (!is.Array(mixins)) {
    mixins = [mixins]
  }
  var mixedProperties = {}
  for (var i = 0, l = mixins.length; i < l; i++) {
    mixin(mixedProperties, mixins[i])
  }
  delete properties.__mixin__
  return object.extend(mixedProperties, properties)
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
  if (prototypeProps && object.hasOwn(prototypeProps, 'constructor')) {
    childConstructor = prototypeProps.constructor
  }
  else {
    childConstructor = function() {
      parentConstructor.apply(this, arguments)
    }
  }

  // Base constructors should only have the properties they're defined with
  if (parentConstructor !== Concur) {
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
  // If the constructor being inherited from has a __meta__ function somewhere
  // in its prototype chain, call it to customise prototype and constructor
  // properties before they're used to set up the new constructor's prototype.
  if (typeof this.prototype.__meta__ != 'undefined') {
    // Property objects must always exist so properties can be added to
    // and removed from them.
    prototypeProps = prototypeProps || {}
    constructorProps = constructorProps || {}
    this.prototype.__meta__(prototypeProps, constructorProps)
  }

  // If any mixins are specified, mix them into the property objects
  if (prototypeProps && object.hasOwn(prototypeProps, '__mixin__')) {
    prototypeProps = applyMixins(prototypeProps)
  }
  if (constructorProps && object.hasOwn(constructorProps, '__mixin__')) {
    constructorProps = applyMixins(constructorProps)
  }

  // Set up and return the new child constructor
  var childConstructor = inheritFrom(this,
                                     prototypeProps,
                                     constructorProps)
  childConstructor.extend = this.extend
  return childConstructor
}
