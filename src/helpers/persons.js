const db = require('../models/person')

exports.getSubTypeByPersonId = async function (id) {
    try {
      // Note that there is no `await` here. This query does not get executed.
      const personSubQuery = db.Person.query().where('id', id).select()
  
      // // This is the only executed query in this example.
      const subtype = await db.Person.relatedQuery('ontology')
        .for(personSubQuery).select('subtype')
      return subtype
    } catch (err) {
      return { err }
    }
}