const { Model } = require('objection')

// Add model here
class Ontology extends Model {
    static get tableName () {
      return 'ontology'
    }

    static get jsonSchema () {
      // Add model here
    }
}

module.exports = {
  Ontology,
  model: Ontology,
}