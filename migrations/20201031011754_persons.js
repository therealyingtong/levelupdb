exports.up = (knex) => {
  return knex.schema.createTable('persons', (table) => {
    table.increments('id').primary() 
    table.text('name').notNullable()
    table.integer('freq')
    table.text('tag')
    table.integer('repeated')
    table.integer('key')
    table.integer('freqSum')
  })
};

exports.down = (knex) => {
  return knex.schema.dropTable('persons')
};