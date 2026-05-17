// generate-hash.js
const bcrypt = require("bcryptjs");
bcrypt.hash("iniadmin", 12).then((hash) => console.log(hash));
