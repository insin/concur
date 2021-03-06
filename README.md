# Concur [![build status](https://secure.travis-ci.org/insin/concur.png)](http://travis-ci.org/insin/concur)

Syntactic sugar for JavaScript inheritance, which takes two of the JavaScript
Functions Of The Ages (`extend()` and `inherits()`), combines their power in
a [Backbone](https://github.com/documentcloud/backbone)-style infectious
inheritance function and allows for inheritance-time metaprogramming and mixins
for those who need them.

Runs in browsers and [Node.js](http://nodejs.org).

## Install

Browser bundles export a global `Concur` variable.

* [concur.js](https://raw.github.com/insin/concur/master/concur.js)
* [concur.min.js](https://raw.github.com/insin/concur/master/concur.min.js)

Node.js:

```
npm install Concur
```
```javascript
var Concur = require('Concur')
```

## Usage

Concur is [sugar](http://en.wikipedia.org/wiki/Syntactic_sugar) for JavaScript
inheritance.

It deals with constructor functions, prototypes and prototype chains.
It does not break ``instanceof`` and constructors created with Concur will
not be ``instanceof Concur`` - it does not attempt to transplant paradigms
from other languages into JavaScript, but it *does* try to provide a
convenient means of manipulating prototypes while setting up inheritance.

Assuming the standard `inherits(child, parent)` function - which (\*deep
breath\*) puts one constructor's prototype in another constructor's prototype
chain, so objects created with the latter will have access to the former's
prototype properties when property access walks the prototype chain - you
might have an inheritance hierarchy set up something like this:

```javascript
function inherits(child, parent) {
  function F() {}
  F.prototype = parent.prototype
  child.prototype = new F()
  child.prototype.constructor = child
}

function Widget(attrs) {
  this.attrs = attrs || {}
}

Widget.prototype.isHidden = false

function Input(attrs) {
  Widget.call(this, attrs)
}
inherits(Input, Widget)

Input.prototype.inputType = null

Input.prototype.render = function(name, value) {
  return React.createElement('input', {
    type: this.inputType
  , name: name
  , value: value
  })
}

function TextInput(attrs) {
  Input.call(this, attrs)
}
inherits(TextInput, Input)

TextInput.prototype.inputType = 'text'
```

You could start sugaring this by having Concur take care of setting up
prototype inheritance and generating default constructors.

The `Concur.extend()` function returns a constructor function - either
one you provide or a default which calls the "parent" constructor in the
context of the object being created, passing along all given arguments -
which you can continue to work with as above. The `extend()` function is
attached to the resulting constructor before it is returned, so it can be
further extended from using the same API.

Setting up a prototype by augmenting a constructor's prototype
property-by-property is preferred by some as it doesn't introduce any extra
levels of nesting, and gives each property plenty of room for scanning and
documentation:

```javascript
var Widget = Concur.extend({
  constructor: function(attrs) {
    this.attrs = attrs || {}
  }
})

Widget.prototype.isHidden = false

var Input = Widget.extend()

Input.prototype.inputType = null

Input.prototype.render = function(name, value) {
  return React.createElement('input', {
    type: this.inputType
  , name: name
  , value: value
  })
}

var TextInput = Input.extend()

TextInput.prototype.inputType = 'text'
```

To further sugar this, you could pass additional properties to the
`extend()` function, which will augment the prototype for you.

You might prefer to do this only with data, rather than functions, or you
might prefer the compactness of having the entire prototype definition as
part of one statement (particularly for constructors with small
prototypes) - for demonstration purposes, this example shows the latter:

```javascript
var Widget = Concur.extend({
  isHidden: false,

  constructor: function(attrs) {
    this.attrs = attrs || {}
  }
})

var Input = Widget.extend({
  inputType: null,

  render: function(name, value) {
    return React.createElement('input', {
      type: this.inputType
    , name: name
    , value: value
    })
  }
})

var TextInput = Input.extend({
  inputType: 'text'
)}
```

### Manipulating Prototypes

The following "special" properties, or "dunder-properties" owing to the double
underscores, can be used to manipulate prototypes at inheritance time. The
manipulations they enable are performed in the order they are listed below.

#### `__meta__(prototypeProps, constructorProps)`

If a constructor's prototype properties include a dunder-meta property,
then when `extend()` is used on that constructor, dunder-meta will be
called with all property-defining objects which were passed in.

This enables you to declare constructors which can modify the prototypes of
constructors inheriting from them, at inheritance time.

Contrived example:

```javascript
function NutAllergyProtectionMeta(prototypeProps) {
   var nutIndex = prototypeProps.ingredients.indexOf('nuts')
   if (nutIndex != -1) {
      prototypeProps.ingredients.splice(nutIndex, 1)
   }
}

var Bar = Concur.extend({
  __meta__: NutAllergyProtectionMeta,

  eat: function() {
    if (this.ingredients.indexOf('nuts') != -1) {
      console.log('You eat nuts. You die.')
    }
    else {
      console.log('You feel a bit dunder-meta.')
    }
  }
})

var NougatBar = Bar.extend({
   ingredients: ['sugar', 'egg whites', 'nuts']
})
```
```
>>> var snack = new NougatBar()
>>> snack.eat()
You feel a bit dunder-meta.
```

Actual examples:

* Implementing basic Django-style declarative models:
  [`examples/models.js`](https://github.com/insin/concur/blob/master/examples/models.js).
* Implementing inheritance of fields from ancestor constructors and mixing in
  fields from other constructors at the same time:
  [newforms' `DeclarativeFieldsMeta.js`](https://github.com/insin/newforms/blob/react/src/forms/DeclarativeFieldsMeta.js)

#### `__mixins__`

If any properties object passed to `extend()` includes a dunder-mixins
Array, each of its contents will be mixed into that properties object in the
given order.

## API

### `Concur.extend([prototypeProps[, constructorProps]])`

Creates a child constructor which inherits from the call context object
(`this`), adding the given prototype and constructor properties and
adding `extend()` as a property of the new constructor for further
extension:

* Calling `Concur.extend()` creates a "base" constructor, which inherits
  from `Object` just like any other Function.

* Calling `extend()` in the context of any other constructor creates a
  new constructor which inherits from it.

When required, constructor logic should be provided as a function -
`prototypeProps.constructor()` - otherwise, a default constructor which
calls the parent constructor with all given arguments will be created for you.

Child constructors will have a `__super__` property added to them referencing
the prototype they extend, as a convenience for accessing it when required.

Child constructors will also have an `__mro__` property added to them, which
is a list of the constructors in their inheritance chain, with the new child
constructor itself at the head of the list.

#### Special arguments

##### `prototypeProps.constructor([...])`

If provided, this function will be used as the child constructor, otherwise a
new child constructor function will be created for you.

##### `prototypeProps.__meta__(prototypeProps, constructorProps)`

If provided, this function will not be used immediately, but will be called
when further extension is done based on the constructor returned by this call
to `extend()`.

At that point, `__meta__` will be called with the property arguments passed
to `extend()` so it can customise them before they're used to set up the
inheriting constructor's prototype.

##### `prototypeProps.__mixins__` and `constructorProps.__mixins__`

If provided, the contents of this Array will be mixed in to the properties
object it's set on, in the given order.

## MIT Licensed