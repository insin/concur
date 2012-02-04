======================
Concur |travis_status|
======================

.. |travis_status| image:: https://secure.travis-ci.org/insin/concur.png
   :target: http://travis-ci.org/insin/concur

``Object.extend``? **Object!**

``Concur.extend``? **Concur!**

Syntactic sugar for JavaScript inheritance, which can be shared between
browsers and `Node.js`_, taking two of the JavaScript Functions Of The
Ages (``extend()`` and ``inherits()``) and combining their power in a
`Backbone`_-style, infectious inheritance function.

Browsers:

* `concur.js`_ or `concur.min.js`_, which export a ``Concur`` variable.

Node.js::

   npm install concur

.. _`Backbone`: https://github.com/documentcloud/backbone
.. _`concur.js`: https://raw.github.com/insin/concur/master/concur.js
.. _`concur.min.js`: https://raw.github.com/insin/concur/master/concur.min.js
.. _`Node.js`: http://nodejs.org

API
===

``Concur.extend([prototypeProps[, constructorProps]])``
-------------------------------------------------------

Creates a child constructor which inherits from the call context object
(``this``), with the given prototype and constructor properties.

Constructor logic should be provided as a function --
``prototypeProps.constructor()`` -- when required.

If ``Concur`` is the context object for calls to this function (i.e. if you
call ``Concur.extend()``), the resulting child constructor will inherit
from ``Object``.

Child constructors created with this function will have their own reference to
the ``extend()`` function attached, for convenientl creation of further child
constructors.

**Special arguments:**

``prototypeProps.constructor([...])``
   If provided, this function will be used as the child constructor, otherwise a
   new child constructor function will be created for you.

``prototypeProps.__meta__(prototypeProps, constructorProps)``
   If provided, this function will not be used immediately, but will be called
   when further extension is done based on the constructor returned by this call
   to ``extend()``.

   At that point, ``__meta__`` will be called with the property arguments passed
   to ``extend()`` so it can customise them before they're used to set up the
   inheriting constructor's prototype.

``prototypeProps.__mixin__`` and ``constructorProps.__mixin__``
   If provided, this object's properties will be mixed in to the properties
   object it's set on. Multiple mixins can be provided by passing an Array.
   Functions passed as mixins will have their prototype properties mixed in.

Usage
=====

Concur is `sugar`_ for JavaScript inheritance.

It deals with constructor functions, prototypes and prototype chains.
It does not break ``instanceof`` and constructors created with Concur will
not be ``instanceof Concur`` - it does not attempt to transplant paradigms
from other languages into JavaScript, but it *does* try to provide a
convenient means of manipulating prototypes while setting up inheritance.

.. _`sugar`: http://en.wikipedia.org/wiki/Syntactic_sugar

Assuming the standard ``inherits(child, parent)`` function -- which *\*deep
breath\** puts one constructor's prototype in another constructor's prototype
chain, so objects created with the latter will have access to the former's
prototype properties when property access walks the prototype chain -- you
might have an inheritance hierarchy set up something like this::

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
     return DOMBuilder.build([
       'input', {type: this.inputType, name: name, value: value}
     ])
   }

   function TextInput(attrs) {
     Input.call(this, attrs)
   }
   inherits(TextInput, Input)

   TextInput.prototype.inputType = 'text'

You could start sugaring this by having Concur take care of setting up
prototype inheritance and generating default constructors.

The ``Concur.extend()`` function returns a constructor function -- either
one you provide or a default which calls the "parent" constructor in the
context of the object being created, passing along all given arguments --
which you can continue to work with as above. The ``extend()`` function is
attached to the resulting constructor before it is returned, so it can be
further extended from using the same API.

Setting up a prototype by augmenting a constructor's prototype
property-by-property is preferred by some as it doesn't introduce any extra
levels of nesting, and gives each property plenty of room for scanning and
documentation::

   var Widget = Concur.extend({
     constructor: function(attrs) {
       this.attrs = attrs || {}
     }
   })

   Widget.prototype.isHidden = false

   var Input = Widget.extend()

   Input.prototype.inputType = null

   Input.prototype.render = function(name, value) {
     return DOMBuilder.build([
       'input', {type: this.inputType, name: name, value: value}
     ])
   }

   var TextInput = Input.extend()

   TextInput.prototype.inputType = 'text'

To further sugar this, you could pass additional properties to the
``extend()`` function, which will augment the prototype for you.

You might prefer to do this only with data, rather than functions, or you
might prefer the compactness of having the entire prototype definition as
part of one statement (particularly for constructors with small
prototypes) - for demonstration purposes, this example shows the latter::

   var Widget = Concur.extend({
     isHidden: false
   , constructor: function(attrs) {
       this.attrs = attrs || {}
     }
   })

   var Input = Widget.extend({
     inputType: null
   , render: function(name, value) {
       return DOMBuilder.build([
         'input', {type: this.inputType, name: name, value: value}
       ])
     }
   })

   var TextInput = Input.extend({
     inputType: 'text'
   )}

Manipulating Prototypes
-----------------------

The following "special" properties can be used to manipulate prototypes at
inheritance time. The manipulations they enable are performed in the order they
are listed below.

``__meta__(prototypeProps, constructorProps)``
   If a constructor's prototype has a ``__meta__`` property, when ``extend()``
   is used on that constructor, ``__meta__`` will be called with the properties
   which were passed in.

   This enables you to declare constructors which are capable of modifying the
   prototypes of inheriting constructors at inheritance time.

   An example of using ``__meta__`` to implement Django-style declarative models
   can be seen in `examples/models.js`_.

   .. _`examples/models.js`: https://github.com/insin/concur/blob/master/examples/models.js

``__mixin__``
   If a properties object passed to ``extend()`` has a ``__mixin__`` property,
   its properties will be mixed into the properties object.

   If a Function is given as a mixin, its prototype properties will be mixed in.

   Multiple mixins can be specified by passing them as an Array.

MIT License
===========

Copyright (c) 2011, Jonathan Buchanan

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
