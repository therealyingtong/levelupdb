const knexBinding = require('./models/index');

const persons = require('./helpers/persons')

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function querySubtypeByPersonId() {
    rl.question("Which Person id are you querying? ", async function(id) {
        console.log("Hm...");
        const subtype = await persons.getSubTypeByPersonId(id);
        return subtype
    });
}

querySubtypeByPersonId().then(function(result){
    console.log(result)
    rl.on("close", function() {
        console.log("\n“It's a dangerous business, Frodo, going out your door. You step onto the road, and if you don't keep your feet, there's no knowing where you might be swept off to.” - Bilbo Baggins");
        process.exit(0);
    });
})

