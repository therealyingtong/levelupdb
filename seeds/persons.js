const personsData = require('../assets/persons.json');

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('persons').del()
    .then(() => {
      let personPromises = [];
      personsData.forEach((person) => {
        personPromises.push(createPerson(knex, person));
      })
      return Promise.all(personPromises);
    });
};

const createPerson = (knex, person) => {
  return knex('persons').insert({
    name: person.name,
    freq: person.freq,
    tag: person.tag,
    repeated: person.repeated,
    key: person.key,
    freqSum: person.freqSum
  })
}