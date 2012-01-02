QUnit.module('Concur')

QUnit.test('Concur.extend', 12, function() {
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
      return '<input type="' + this.inputType + '" name="' + name + '" value="' + value + '">'
    }
  })

  var TextInput = Input.extend({
    inputType: 'text'
  })

  var w = new TextInput({attrs: {style: 'color: red;'}})
  ok(w instanceof Widget, 'Is instanceof grandparent')
  ok(w instanceof Input, 'Is instanceof parent')
  deepEqual(w.attrs, {style: 'color: red;'}, 'Instance property set by grandparent constructor')
  equal(w.inputType, 'text', 'Parent prototype property is overriden')
  strictEqual(w.isHidden, false, 'Grandparent prototype property is overriden')
  equal(w.render('foo', 'bar'), '<input type="text" name="foo" value="bar">', 'Parent method works')

  var HiddenInput = Input.extend({
    inputType: 'hidden'
  , isHidden: true
  })

  var w = new HiddenInput
  ok(w instanceof Widget, 'Is instanceof grandparent')
  ok(w instanceof Input, 'Is instanceof parent')
  deepEqual(w.attrs, {}, 'Instance property set by grandparent constructor')
  equal(w.inputType, 'hidden', 'Parent prototype property is overriden')
  strictEqual(w.isHidden, true, 'Parent prototype property is overriden')
  equal(w.render('foo', 'bar'), '<input type="hidden" name="foo" value="bar">', 'Parent method works')
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

  var a = new A(), b = new B()
  ok(a instanceof A, 'Is instance of self')
  equal(a.test(), 'a', 'Prototype property is attached')
  ok(b instanceof B, 'Is instance of self')
  ok(b instanceof A, 'Is instance of parent')
  equal(b.test(), 'b', 'Parent prototype property is overridden')
})
