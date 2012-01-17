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
QUnit.test('Concur.extend (without supplied constructor)', 5, function() {
  var A = Concur.extend({
      test: function() { return 'a' }
    })
    , B = A.extend({
      test: function() { return 'b' }
    })

  var a = new A()
    , b = new B()
  ok(a instanceof A, 'Objects are instanceof their own constructor')
  equal(a.test(), 'a', 'Supplied prototype properties are accessible via the prototype chain')
  ok(b instanceof B, 'Objects are instanceof their own constructor')
  ok(b instanceof A, 'Objects are instanceof their parent constructor')
  equal(b.test(), 'b', 'Same-named ancestor (parent) prototype properties are overridden')
})
