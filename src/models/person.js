const { Model } = require('objection')

// Add model here
class Person extends Model {
    static get tableName () {
      return 'persons'
    }

    static get jsonSchema () {
      return {
        type: 'object',
        required: ['name', 'key'],
        properties: {
          name: { type: 'string', maxLength: 255 },
          freq: { type: 'integer' }, 
          tag: { type: 'string', maxLength: 5 },
          repeated: { type: 'integer' },
          key: { type: 'integer' },
          freqSum: { type: 'integer' }
        }
      }
    }

    static get relationMappings () {
      const Ontology = require('./ontology')
  
      return {
        ontology: {
          relation: Model.BelongsToOneRelation,
          modelClass: Ontology.model,
          join: {
            from: 'persons.key',
            to: 'ontology.key'
          }
        }
      }
    }
}

module.exports = {
  Person,
  model: Person,
}