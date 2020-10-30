# level-up workshop: databases
(TechLadies Bootcamp 6)

slides for the workshop can be found at: https://docs.google.com/presentation/d/1-oFNEgb5VvzcvdtD_4gb5v66FQxV0laF5as4NuJ_fEQ/edit?usp=sharing.

our Lord of the Rings datasets were taken from: https://github.com/morethanbooks/projects/tree/master/LotR

## 0. setup
make sure you have NodeJS and PostgreSQL installed. (refer to this document for installation instructions: https://github.com/TechLadies/bootcamp6-info/blob/master/pre_requisite_software.md)

clone this repository and install its dependencies:
```
git clone https://github.com/therealyingtong/levelupdb
cd levelupdb
npm i
```

## 1. import data in psql terminal
we can import `/assets/ontology.csv` using the `psql` shell:

```
$ sudo -i -u postgres
postgres@user:~$ createdb lotr
postgres@user:~$ psql
```

we'll define certain `TYPE`s according to the data in `/assets/ontology.csv`:
```
postgres=# CREATE TYPE type AS ENUM ('pla', 'per', 'thin', 'gro');
postgres=# CREATE TYPE subtype AS ENUM ('pla', 'men', 'elves', 'dwarf', 'hobbit', 'animal', 'ainur', 'ents', 'orcs', 'mixed', 'thing');
postgres=# CREATE TYPE gender AS ENUM ('male', 'female');

postgres=# CREATE TABLE ontology (key varchar(5), type type, label varchar(255), freqSum int, subtype subtype, gender gender);
```

## 2. import data using knex.js
an alternative to raw SQL is to import `/assets/persons.csv` using `knex.js` **migrations**:

### 2a. define a migration

```
npm run db:migrate:make persons
```

you should see a new `/migrations` directory with a `202...{timestamp}_persons.js` file in it. here's where we define our attributes and attribute domains:

```js
exports.up = (knex) => {
  return knex.schema.createTable('persons', (table) => {
    table.increments('id').primary() 
    table.text('name').notNullable()
    table.integer('freq')
    table.text('tag')
    table.integer('repeated')
    table.integer('key').references('key').inTable('ontology').onDelete('CASCADE')
    table.integer('freqSum')
  })
};

exports.down = (knex) => {
  return knex.schema.dropTable('persons')
};
```

### 2b. run a migration
now, we can run the migration and create our `persons` table:
```
npm run db:migrate
```

we should see our new `persons` table in the `lotr` database:
```
$ sudo -i -u  postgres
postgres@user:~$ psql lotr
lotr=# \d persons
                             Table "public.persons"
  Column  |  Type   | Collation | Nullable |               Default               
----------+---------+-----------+----------+-------------------------------------
 id       | integer |           | not null | nextval('persons_id_seq'::regclass)
 name     | text    |           | not null | 
 freq     | integer |           |          | 
 tag      | text    |           |          | 
 repeated | integer |           |          | 
 key      | integer |           |          | 
 freqSum  | integer |           |          | 
Indexes:
    "persons_pkey" PRIMARY KEY, btree (id)
```

### 2c. seed data
let's seed our `persons` database using the `persons.json` dataset:

```
npm run db:seed:make persons
```

you should see a new `/seeds` directory with a `/persons.js` file in it. replace the code with this snippet to import our `/assets/persons.json`:

```js
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
```

now, our `persons` data should be full of initial records:
```
$ sudo -i -u postgres
postgres@user:~$ psql lotr
lotr=# SELECT * FROM persons;
 id |      name       | freq |  tag  | repeated | key | freqSum 
----+-----------------+------+-------+----------+-----+---------
  1 | Elessar         |   37 | arag  |        1 |   0 |    1069
  3 | Aragorn         |  799 | arag  |        1 |   1 |    1069
  2 | Strider         |  233 | arag  |        1 |   0 |    1069
  4 | Arathorn        |   36 | arat  |        0 |   1 |      36
  5 | Arwen           |   51 | arwe  |        0 |   1 |      51
  6 | Balin           |   30 | bali  |        0 |   1 |      30
  7 | Beregond        |   77 | bere  |        0 |   1 |      77
  ...
  ```

## 3. work with data using Objection.js

### 3a. define a model
first, we define a **model** in `Objection.js` that represents a `Person`. add this into `src/models/person.js`:

```js
class Person extends Model {
  static get jsonSchema () {
    // Add model here
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
}

```

we may as well define an `Ontology` as well (in `src/models/ontology.js`):

```js
// Add model here
class Ontology extends Model {
  static get jsonSchema () {
    // Add model here
    return {
      type: 'object',
      required: ['subtype', 'key'],
      properties: {
        key: { type: 'integer' },
        type: { type: 'string' },
        label: { type: 'string' },
        freqSum: { type: 'integer' },
        subType: { type: 'string' },
        gender: {type: 'string' }
      }
    }
  }
}
```

### 3b. define a relation
one of the fun things about `Objection.js` is its intuitive `relations` API. we had included this sneaky line in our `persons` migration:

```js
   table.integer('key').references('key').inTable('ontology').onDelete('CASCADE')
```

this means that the `key` attribute in the `persons` table reference the `key` attribute in the `ontology` table. in particular, there is a one-to-one relation between them. we can define it as such:

in `src/models/person.js`:
```js
class Person extends Model {

  //...

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
```

and in `src/models/ontology.js`:
```js
class Ontology extends Model {

  //...

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
```

### 3c. use a relation
now, we could use this relation to make a `relatedQuery`. for instance, given the `id` of a `Person`, we may want to know their `subType`. let's go into `/src/helpers/persons.js` to see what's going on:

```js
exports.getSubTypeByPersonId = async function (id) {
  try {
    // Note that there is no `await` here. This query does not get executed.
    const personSubQuery = db.Person.query().where('id', id)

    // This is the only executed query in this example.
    const subType = await db.Person.relatedQuery('ontology')
      .for(personSubQuery).select('subType')
    return subType
  } catch (err) {
    return { err }
  }
}

```