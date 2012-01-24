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

QUnit.test('Basic __meta__ usage', 15, function() {
  var has = Function.prototype.call.bind(Object.prototype.hasOwnProperty)

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
        if (Object.prototype.hasOwnProperty.call(prototypeProps, name)) {
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
        if (Object.prototype.hasOwnProperty.call(props, prop))
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
