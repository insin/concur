'use strict';

var is = require('isomorph/is')
var object = require('isomorph/object')

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
function inheritFrom(parentConstructor, childConstructor, prototypeProps, constructorProps) {
  // Create a child constructor if one wasn't given
  if (childConstructor == null) {
    childConstructor = function() {
      parentConstructor.apply(this, arguments)
    }
  }

  // Make sure the new prototype has the correct constructor set up
  prototypeProps.constructor = childConstructor

  // Base constructors should only have the properties they're defined with
  if (parentConstructor !== Concur) {
    // Inherit the parent's prototype
    object.inherits(childConstructor, parentConstructor)
    childConstructor.__super__ = parentConstructor.prototype
  }

  // Add prototype properties - this is why we took a copy of the child
  // constructor reference in extend() - if a .constructor had been passed as a
  // __mixin__ and overitten prototypeProps.constructor, these properties would
  // be getting set on the mixed-in constructor's prototype.
  object.extend(childConstructor.prototype, prototypeProps)

  // Add constructor properties
  object.extend(childConstructor, constructorProps)

  return childConstructor
}

/**
 * Namespace and dummy constructor for initial extension.
 */
var Concur = module.exports = function() {}

/**
 * Details of a coonstructor's inheritance chain - Concur just facilitates sugar
 * so we don't include it in the initial chain. Arguably, Object.prototype could
 * go here, but it's just not that interesting.
 */
Concur.__mro__ = []

/**
 * Creates or uses a child constructor to inherit from the the call
 * context, which is expected to be a constructor.
 */
Concur.extend = function(prototypeProps, constructorProps) {
  // Ensure we have prop objects to work with
  prototypeProps = prototypeProps || {}
  constructorProps = constructorProps || {}

  // If the constructor being inherited from has a __meta__ function somewhere
  // in its prototype chain, call it to customise prototype and constructor
  // properties before they're used to set up the new constructor's prototype.
  if (typeof this.prototype.__meta__ != 'undefined') {
    this.prototype.__meta__(prototypeProps, constructorProps)
  }

  // Any child constructor passed in should take precedence - grab a reference
  // to it befoer we apply any mixins.
  var childConstructor = object.get(prototypeProps, 'constructor', null)

  // If any mixins are specified, mix them into the property objects
  if (object.hasOwn(prototypeProps, '__mixin__')) {
    prototypeProps = applyMixins(prototypeProps)
  }
  if (object.hasOwn(constructorProps, '__mixin__')) {
    constructorProps = applyMixins(constructorProps)
  }

  // Set up the new child constructor and its prototype
  childConstructor = inheritFrom(this,
                                 childConstructor,
                                 prototypeProps,
                                 constructorProps)

  // Pass on the extend function for extension in turn
  childConstructor.extend = this.extend

  // Expose the inheritance chain for programmatic access
  childConstructor.__mro__ = [childConstructor].concat(this.__mro__)

  return childConstructor
}
