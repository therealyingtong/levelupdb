const { Model } = require('objection')

// Add model here
class Ontology extends Model {
    static get tableName () {
      return 'ontology'
    }

    static get jsonSchema () {
      return {
        type: 'object',
        required: ['subtype', 'key'],
        properties: {
          key: { type: 'integer' },
          type: { type: 'string' },
          label: { type: 'string' },
          freqSum: { type: 'integer' },
          subtype: { type: 'string' },
          gender: {type: 'string' }
        }
      }
    }

    static get relationMappings () {
      const Person = require('./person')
  
      return {
        ontology: {
          relation: Model.BelongsToOneRelation,
          modelClass: Person.model,
          join: {
            from: 'ontology.key',
            to: 'persons.key'
          }
        }
      }
    }
}

module.exports = {
  Ontology,
  model: Ontology,
}