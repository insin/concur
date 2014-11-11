0.3.0 / 2014-11-11
==================

* **Breaking:** Renamed ``__mixin__`` to ``__mixins__``
* Removed dependency on insin/isomorph.

0.2.5 / 2014-03-07
==================

* Fixed ``.constructor`` function property on a ``__mixin__`` replacing the
  intended constructor.

0.2.4 / 2014-02-23
==================

* Constructors now have an ``__mro__`` property added to them, which is a list
  of the constructors in their inheritance chain, with themselves at the head

0.2.3 / 2012-06-29
==================

* Updated to isomorph 0.2

0.2.2 / 2012-02-07
==================

* Added documentation about ``__super__`` so it's officially A Thing
* Removed an unintended ``return`` from the default constructor

0.2.1 / 2012-02-04
==================

* Fixed overriding of ``__mixin__`` properties with given prototype properties

0.2.0 / 2012-02-04
==================

* Backwards-incompatible change to ``extend()`` -- parent constructor properties
  are no longer copied over to the child constructor - this was undocumented
  behaviour
* Changed order of special properties -- ``__meta__`` is now called first so it
  has complete control over the prototype and constructor properties which will
  be applied to the new constructor

0.1.4 / 2012-02-01
==================

* Fixed browser build - IE7/8 object.hasOwn incompatibility fixed in isomorph

0.1.3 / 2012-01-26
==================

* Added support for a ``__mixin__`` prototype or constructor property to specify
  an object/objects to be mixed in
* Changed hasOwnProperty checks to use Object.prototype.hasOwnProperty via
  `isomorph`_'s ``object.hasOwn()``

0.1.2 / 2012-01-18
==================

* Changed: base constructors created using ``Concur.extend()`` are no longer
  ``instanceof Concur``
* Changed: extracted build script out into `buildumb`_

0.1.1 / 2012-01-17
==================

* Changed: replaced private utility functions with dependency on `isomorph`_
* Added exporting of isomorph to the browser build script

0.1.0 / 2012-01-17
==================

* Changed: utility functions are no longer exposed
* Changed code structure - now written as a regular Node.js module
* Added a browser build script

0.0.2 / 2012-01-02
==================

* Fixed calling ``extend()`` without providing your own constructor

0.0.1 / 2011-12-15
==================

* Initial release.

.. _`buildumb`: https://github.com/insin/buildumb
.. _`isomorph`: https://github.com/insin/isomorph
