/**
 * A speculative API for creating Django-style declarative models using
 * Concur for inheritance and __meta__ for pre-processing prototype
 * properties.
 */
function fmt = function(s) {
  var i = 0, args = Array.prototype.slice.call(arguments, 1)
  return s.replace(/%s/g, function() { return args[i++] })
}

// Dummy field and relationship objects
var Field = Concur.extend()
var CharField = Field.extend()
var TextField = Field.extend()
var DateField = Field.extend()
var ImageField = Field.extend()

var Rel = Concur.extend()
var ModelRel = Rel.extend()

/**
 * Meta-info about a model.
 */
function ModelOptions(meta) {
  this.meta = meta
  this.name = meta.name
  this.displayName = meta.displayName || meta.name
  this.displayNamePlural = meta.displayNamePlural || this.displayName + 's'
  this.fields = []
  this.ordering = meta.ordering || []
)

var Model = Concur.extend({
  /**
   * Prepares a ModelOptions for the extended Model and places it in a
   * _meta property on the prototype and constructor.
   */
  __meta__: function(prototypeProps, constructorProps) {
    if (typeof prototypeProps.Meta == 'undefined' ||
        typeof prototypeProps.Meta.name == 'undefined') {
      throw new Error('When extending Model, you must provide a name via a Meta object.')
    }

    var options = new ModelOptions(prototypeProps.Meta)
    delete prototypeProps.Meta

    for (var prop in prototypeProps) {
      if (prototypeProps.hasOwnProperty(prop)) {
        var field = prototypeProps[prop]
        if (field instanceof Field || field instanceof Rel) {
          field.name = prop
          options.fields.push(field)
          delete prototypeProps[prop]
        }
      }
    }

    prototypeProps._meta = constructorProps._meta = options
  }

, constructor: function(props) {
    for (var prop in props)
      if (prop.hasOwnProperty(prop))
        this[prop] = props[prop]
  }

, get: function() {
    // Pretend you're looking at something which introspects this._meta
    // and does some really clever stuff as per the usage in GameRelease's
    // toString()
    var args = Array.prototype.slice.call(arguments)
    return args.pop().apply(this, args)
  }
})

var Game = Model.extend({
  name        : new CharField({max_length: 255})
, series      : new ModelRel(Series, {nullable: true, relatedName: 'games'})
, genre       : new ModelRel(Genre, {nullable: true, relatedName: 'games'})
, publisher   : new ModelRel(Company, {relatedName: 'publishedGames'})
, developer   : new ModelRel(Company, {relatedName: 'developedGames'})
, description : new TextField({blank: true})

, Meta: { name: 'Game'
        , ordering: ['name']
        }

, toString: function(fn) {
    fn(this.name)
  }
})

var GameRelease = Model.extend({
  game        : new ModelRel(Game, {relatedName: 'releases'})
, name        : new CharField({maxLength: 255, blank: true})
, platform    : new ModelRel(Platform, {relatedName: 'gameReleases'})
, region      : new ModelRel(Region, {relatedName: 'gameReleases'})
, publisher   : new ModelRel(Company, {nullable: true, blank: true, relatedName: 'publishedReleases'})
, date        : new DateField()
, cover       : new ImageField({uploadTo: 'covers', blank: true})
, description : new TextField({blank: true})

, Meta: { name: 'GameRelease'
        , verboseName: 'Game Release'
        }

, toString: function(fn) {
    this.get('game', 'region', 'publisher', function(g, r, p) {
      fn(fmt('%s (%s, %s)', g, r, p))
    })
  }
})
