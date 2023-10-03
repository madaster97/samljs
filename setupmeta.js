const { argv } = require('node:process');

fetch("https://dev-92ai3moi.us.auth0.com/samlp/metadata/04hMi4W38MmkoyQnw9uR6xG9TP7lAjGU")
.then(val => {
    console.log(val)
})