const mongoose = require("mongoose");

if (process.argv.length !== 3 && process.argv.length !== 5) {
  console.log(
    "Should be of format: 'node mongo.js <adminpassword>' or 'node mongo.js <adminpassword> <newName> <newNumber>'"
  );
  process.exit(1);
}

// Connexion

const password = process.argv[2];

const url = `mongodb+srv://fk:${password}@fso.lv6petf.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=fso`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

// Schemas & Models

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

//////////////////

// Logs persons
if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    result.forEach(({ name, number }) => {
      console.log(name, number);
    });
    mongoose.connection.close();
  });
}

// Create a Person and add it to the persons collection
if (process.argv.length === 5) {
  const person = new Person({
    name: String(process.argv[3]),
    number: String(process.argv[4]),
  });

  person.save().then((result) => {
    console.log("person saved!");
    // console.log(result);
    mongoose.connection.close();
  });
}
