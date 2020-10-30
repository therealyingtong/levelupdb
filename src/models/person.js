const { Model } = require('objection')

class Person extends Model {
    static get tableName () {
      return 'persons'
    }

    static get jsonSchema () {
      // Add model here
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