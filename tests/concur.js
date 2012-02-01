QUnit.module('Concur')

QUnit.test('Concur.extend', 16, function() {
  var Widget = Concur.extend({
    constructor: function(attrs) {
      this.attrs = attrs || {}
    }
  , isHidden: false
  })

  var Input = Widget.extend({
    inputType: null
  , render: function(name, value) {
      return '<input type="' + this.inputType + '" name="' + name + '" value="' + value + '">'
    }
  })

  var TextInput = Input.extend({
    inputType: 'text'
  })

  var w = new Widget()
  ok(!(w instanceof Concur), 'Base objects are not instanceof Concur')
  ok(w instanceof Widget, 'Base objects are instanceof their own constructor')

  var w = new TextInput({style: 'color: red;'})
  ok(w instanceof Widget, 'Objects are instanceof their grandparent constructor')
  ok(w instanceof Input, 'Objects are instanceof their parent constructor')
  ok(w instanceof TextInput, 'Objects are instanceof their own constructor')
  deepEqual(w.attrs, {style: 'color: red;'}, 'Ancestor constructors are called if none was provided while extending')
  equal(w.inputType, 'text', 'Same-named ancestor (parent) prototype properties are overridden')
  strictEqual(w.isHidden, false, 'Same-named ancestor (grandparent) prototype properties are overridden')
  equal(w.render('foo', 'bar'), '<input type="text" name="foo" value="bar">',
        'Ancestor (parent) methods are accessible via the prototype chain')

  var HiddenInput = Input.extend({
    inputType: 'hidden'
  , isHidden: true
  })

  var w = new HiddenInput()
  ok(w instanceof Widget, 'Objects are instanceof their grandparent constructor')
  ok(w instanceof Input, 'Objects are instanceof their parent constructor')
  ok(w instanceof HiddenInput, 'Objects are instanceof their own constructor')
  deepEqual(w.attrs, {}, 'Ancestor constructors are called if none was provided while extending')
  equal(w.inputType, 'hidden', 'Same-named ancestor (parent) prototype properties are overridden')
  strictEqual(w.isHidden, true, 'Same-named ancestor (parent) prototype properties are overridden')
  equal(w.render('foo', 'bar'), '<input type="hidden" name="foo" value="bar">',
        'Ancestor (parent) prototype properties are accessible via the prototype chain')
})

// Regression test for sane bahaviour when a constructor is not supplied on
// initial use of Concur.extend.
QUnit.test('Concur.extend (without supplied constructor)', 6, function() {
  var A = Concur.extend({
      test: function() { return 'a' }
    })
    , B = A.extend({
      test: function() { return 'b' }
    })

  var a = new A()
    , b = new B()
  ok(!(a instanceof Concur), 'Base objects are not instanceof Concur')
  ok(a instanceof A, 'Objects are instanceof their own constructor')
  equal(a.test(), 'a', 'Supplied prototype properties are accessible via the prototype chain')
  ok(b instanceof B, 'Objects are instanceof their own constructor')
  ok(b instanceof A, 'Objects are instanceof their parent constructor')
  equal(b.test(), 'b', 'Same-named ancestor (parent) prototype properties are overridden')
})

;(function() {

var has = function(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

// Test that __meta__ works as expected a single level of inheritance
QUnit.test('__meta__ (flat)', 15, function() {
  var Field = Concur.extend()
    , CharField = Field.extend()
    , TextField = Field.extend()

  function Options(meta) {
    this.meta = meta
    this.name = meta.name
    this.fields = []
  }

  // __meta__ should be set on a constructor which will be extended from, at
  // which point it will be called to do what it will with the given properties.
  // In this example, we have a Model constructor which, when called, will
  // pull Fields out of the prototype properties and place them in a special
  // _meta variable in both the resulting constructor and its prototype.
  var Model = Concur.extend({
    __meta__: function(prototypeProps, constructorProps) {
      if (typeof prototypeProps.Meta == 'undefined' ||
          typeof prototypeProps.Meta.name == 'undefined') {
        throw new Error('Objects extending Model must provide a name via a Meta object.')
      }

      var options = new Options(prototypeProps.Meta)
      delete prototypeProps.Meta

      for (var name in prototypeProps) {
        if (has(prototypeProps, name)) {
          var field = prototypeProps[name]
          if (field instanceof Field) {
            field.name = name
            options.fields.push(field)
            delete prototypeProps[name]
          }
        }
      }

      prototypeProps._meta = constructorProps._meta = options
    }

  , constructor: function(props) {
      for (var prop in props)
        if (has(props, prop))
          this[prop] = props[prop]
    }
  })

  // Predefined for laer equality checking
  var subMeta = { name: 'Game' }
    , nameField = new CharField({max_length: 255})
    , descField = new TextField({blank: true})

  // When Model.extend is called, Model.prototype.__meta__ should be called
  var Game = Model.extend({
    // These should get pulled into _meta and deleted
    name        : nameField
  , description : descField
    // This should be used as the basis for creating an Options object and deleted
  , Meta: subMeta
    // These should appear on Game.prototype as normal
  , notAField: 'test'
  , alsoNotAField: true
  })

  var g = new Game({name: 'POWDER', description: 'Amaze'})
    , opts = g._meta
  ok(g instanceof Model, 'Objects are instanceof their parent constructor')

  // What ended up on Game.prototype?
  ok(!has(Game.prototype, 'Meta'), '"Meta" property was deleted by __meta__')
  ok(!has(Game.prototype, 'name'), 'Field property was deleted by __meta__')
  ok(!has(Game.prototype, 'description'), 'Field property was deleted by __meta__')
  ok(has(Game.prototype, 'notAField'), 'Non-field property untouched by __meta__')
  ok(has(Game.prototype, 'alsoNotAField'), 'Non-field property untouched by __meta__')

  // Check the placement and contents of the Options object
  ok(Game._meta instanceof Options, 'Constructor properties modified by __meta__')
  ok(Game.prototype._meta instanceof Options, 'Prototype properties modified by __meta__')
  ok(g._meta instanceof Options, 'Prototype properties added by __meta__ accessible from an instance')
  equal(opts.name, 'Game', 'Property extracted from "Meta" Object')
  strictEqual(opts.meta, subMeta, '"Meta" property referenced by Options')
  deepEqual(opts.fields, [nameField, descField], 'Field properties available in fields list')
  equal(nameField.name, 'name', 'Property name set as Field name')
  equal(descField.name, 'description', 'Property name set as Field name')

  raises(function() { Model.extend() }, Error, 'Error thrown from __meta__ due to invalid extension')
})

// Test that you have access to sufficient context that you can write __meta__
// functions in such a way that they work "as expected" when there are multiple
// levels of inheritance in play.
// This will be a less than complete implementation, as we're just checking you
// can reach everything you need to make it work.
QUnit.test('__meta__ (deep)', 12, function() {
  function Options() {
    this.fields = []
  }
  Options.prototype.addFields = function(fields) {
    this.fields = this.fields.concat(fields)
  }

  var Field = Concur.extend()

  var Reality = Concur.extend({
    // __meta__ is called in the context of the prototype being extended, so we
    // should have access to the _meta of a contructor prototype which was
    // created by extending the constructor one level up.
    __meta__: function(prototypeProps, constructorProps) {
      var options = new Options()
      if (typeof this._meta != 'undefined') {
        // We would need to do a deep copy if this was for real, but copying
        // fields references will do for this test.
        options.addFields(this._meta.fields)
      }

      for (var name in prototypeProps) {
        if (has(prototypeProps, name)) {
          var field = prototypeProps[name]
          if (field instanceof Field) {
            field.name = name
            options.fields.push(field)
            delete prototypeProps[name]
          }
        }
      }

      prototypeProps._meta = constructorProps._meta = options
    }
  })

  var f1 = new Field()
    , f2 = new Field()
    , f3 = new Field()
    , f4 = new Field()

  var DreamLevelOne = Reality.extend({
    field1: f1
  })

  var DreamLevelTwo = DreamLevelOne.extend({
    field2: f2
  })

  var DreamLevelThree = DreamLevelTwo.extend({
    field3: f3
  })

  var DreamLevelFour = DreamLevelThree.extend({
    field4: f4
  })

  var d1 = new DreamLevelOne()
    , d2 = new DreamLevelTwo()
    , d3 = new DreamLevelThree()
    , d4 = new DreamLevelFour()

  ok(!has(DreamLevelOne.prototype, 'field1'), 'Field property was deleted by parent __meta__')
  ok(!has(DreamLevelTwo.prototype, 'field2'), 'Field property was deleted by grandparent __meta__')
  ok(!has(DreamLevelThree.prototype, 'field3'), 'Field property was deleted by ancestor __meta__')
  ok(!has(DreamLevelFour.prototype, 'field4'), 'Field property was deleted by ancestor __meta__')

  deepEqual(d1._meta.fields, [f1])
  deepEqual(d2._meta.fields, [f1, f2])
  deepEqual(d3._meta.fields, [f1, f2, f3])
  deepEqual(d4._meta.fields, [f1, f2, f3, f4])
  equal(f1.name, 'field1', 'Property name set as Field name')
  equal(f2.name, 'field2', 'Property name set as Field name')
  equal(f3.name, 'field3', 'Property name set as Field name')
  equal(f4.name, 'field4', 'Property name set as Field name')
})

QUnit.test('__mixin__', 23, function() {
  var Loggable = {
    debug: function() {}
  , info: function() {}
  , error: function() {}
  , warning: function() {}
  }

  var Thing = Concur.extend({
    __mixin__: Loggable
  })

  // Simple mixin
  ok(!has(Thing.prototype, '__mixin__'), '__mixin__ itself is not added to the prototype')
  for (var prop in Loggable) {
    strictEqual(Thing.prototype[prop], Loggable[prop], '__mixin__ properties from Object added to prototype')
  }

  // Functions can be passed as mixins, in which case their prototype properties
  // will be mixed in if there are any. Otherwise, the function's own properties
  // will be mixed in.
  var AnotherThing = Concur.extend({
    __mixin__: Thing
  })
  for (var prop in Loggable) {
    strictEqual(AnotherThing.prototype[prop], Loggable[prop], '__mixin__ properties from Constructor.prototype added to prototype')
  }

  // List of mixins
  var m1 = { a: 1, b: 2, c: 3 }
    , m2 = { d: 4, e: 5, f: 6 }
  var AndAnotherThing = Concur.extend({
    __mixin__: [m1, m2]
  })
  for (var prop in m1) {
    strictEqual(AndAnotherThing.prototype[prop], m1[prop], '__mixin__ from first object in list')
  }
  for (var prop in m2) {
    strictEqual(AndAnotherThing.prototype[prop], m2[prop], '__mixin__ from second object in list')
  }

  // Mixins are processed left to right
  var OneLastThing = Concur.extend({
    __mixin__: [{a: 1, b: 2, c: 3}, {a: 4, c: 6}, {c: 5}]
  })
  equal(OneLastThing.prototype.a, 4, '__mixin__ property overridden by rightmost mixin which has it')
  equal(OneLastThing.prototype.b, 2, '__mixin__ property overridden by rightmost mixin which has it')
  equal(OneLastThing.prototype.c, 5, '__mixin__ property overridden by rightmost mixin which has it')

  // Mixins can also be specified for constructorProperties
  var BeforeIGo = Concur.extend({}, {__mixin__: Loggable})
  ok(!has(BeforeIGo, '__mixin__'), '__mixin__ itself is not added to the constructor')
  for (var prop in Loggable) {
    strictEqual(BeforeIGo[prop], Loggable[prop], '__mixin__ also works for constructorProperties')
  }
})

})()