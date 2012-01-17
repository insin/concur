======================
Concur |travis_status|
======================

.. |travis_status| image:: https://secure.travis-ci.org/insin/concur.png
   :target: http://travis-ci.org/insin/concur

``Object.extend``? **Object!**

``Concur.extend``? **Concur!**

Sugar for JavaScript inheritance, taking two of the JavaScript Functions
Of The Ages (``extend`` and ``inherits``) and combining their power in a
`Backbone`_-style, infectious inheritance function.

Grab `concur.js`_ for browsers or ``npm install concur`` for `Node.js`_

.. _`Backbone`: https://github.com/documentcloud/backbone
.. _`concur.js`: https://raw.github.com/insin/concur/master/concur.js
.. _`Node.js`: http://nodejs.org

API
===

``Concur.extend([prototypeProps[, constructorProps]])``
-------------------------------------------------------

Creates a child constructor which inherits from the call context object
(``this``), with the given prototype and constructor properties.

Constructor logic should be provided as a function in
``prototypeProps.constructor`` when required.

If ``Concur`` is the context object for calls to this method (i.e. if you
call ``Concur.extend()``), the resulting child constructor will inherit
from ``Object``.

Child constructors created with this method will have their own version of
the ``extend`` function attached, to conveniently create further child
constructors. E.g.::

   var Widget = Concur.extend({
     constructor: function(kwargs) {
       kwargs = Concur.cp({attrs: null}, kwargs)
       this.attrs = Concur.cp({}, kwargs.attrs)
     }
   , isHidden: false
   })

   var Input = Widget.extend({
     inputType: null
   , render: function(name, value) {
       return DOMBuilder.build([
         'input', { type: this.inputType , name: name , value: value}
       ])
     }
   })

   var TextInput = Input.extend({
     inputType: 'text'
   })

**Special arguments:**

``prototypeProps.constructor([...])``

   If provided, this should be a function to be used as the child
   constructor, otherwise a new child constructor function will be
   created for you.

``prototypeProps.__meta__(prototypeProps, constructorProps)``

   If provided, this should be a function which takes property arguments
   passed to the resulting child constructor's version of the ``extend``
   method and customises them before they're used to set up inheritance.

   See `example.js`_ for an example of how you could use this to implement
   Django-style declarative Models.

.. _`example.js`: https://github.com/insin/concur/blob/master/example.js



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
