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
      throw new Error('Objects extending Model must provide a name via a Meta object.')
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
    Concur.cp(this, props)
  }

, get: function() {
    // Pretend you're looking at something which introspects this._meta
    // and does some really clever stuff.
    var args = Array.prototype.slice.call(arguments)
    return args.pop().apply(this, args)
  }
})

var Game = Model.extend({
  name        : CharField({max_length: 255})
, series      : ModelRel(Series, {nullable: true, relatedName: 'games'})
, genre       : ModelRel(Genre, {nullable: true, relatedName: 'games'})
, publisher   : ModelRel(Company, {relatedName: 'publishedGames'})
, developer   : ModelRel(Company, {relatedName: 'developedGames'})
, description : TextField({blank: true})

, Meta: { name: 'Game'
        , ordering: ['name']
        }

, toString: function(fn) {
    fn(this.name)
  }
})

var GameRelease = Model.extend({
  game        : ModelRel(Game, {relatedName: 'releases'})
, name        : CharField({maxLength: 255, blank: true})
, platform    : ModelRel(Platform, {relatedName: 'gameReleases'})
, region      : ModelRel(Region, {relatedName: 'gameReleases'})
, publisher   : ModelRel(Company, {nullable: true, blank: true, relatedName: 'publishedReleases'})
, date        : DateField()
, cover       : ImageField({uploadTo: 'covers', blank: true})
, description : TextField({blank: true})

, Meta: { name: 'GameRelease'
        , verboseName: 'Game Release'
        }

, toString: function(fn) {
    this.get('game', 'region', 'publisher', function(g, r, p) {
      fn(fmt('%s (%s, %s)', g, r, p))
    })
  }
})
