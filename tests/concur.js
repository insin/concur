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
