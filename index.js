var saml2 = require('saml2-js');
var fs = require('fs');
var express = require('express');
var app = express();
app.use(express.urlencoded({
    extended: false
}));

const DESTINATION = 'https://localhost/assert';
// Create service provider
var sp = new saml2.ServiceProvider({
});

// Create identity provider
var idp = new saml2.IdentityProvider({
  certificates: [fs.readFileSync("idpcert.crt").toString()]
});

// ------ Define express endpoints ------

// Assert endpoint for when login completes
app.post("/assert", function(req, res) {
  sp.post_assert(idp, {
    require_session_index: false,
    request_body: req.body,
    allow_unencrypted_assertion: 1
  }, function(err, saml_response) {
    if (err != null) {
      console.log(err)
      return res.send(500, err.message);
    }
    // Auth0 adds "Destination" by default, but not an audience
    if (saml_response.response_header.destination !== DESTINATION) {
      return res.send(400, 
        `ERROR: Assertion ${saml_response.response_header.id} 
        issued to Destination ${saml_response.response_header.destination}. 
        Expected ${DESTINATION}`);
    }

    console.log(JSON.stringify(saml_response, null, 2))
    name_id = saml_response.user.name_id;
    session_index = saml_response.user.session_index;

    res.send(200, `Hello ${name_id}! session_index: ${session_index}.`);
  });
});

// Starting point for logout
app.get("/logout", function(req, res) {
  var options = {
    name_id: name_id,
    session_index: session_index
  };

  sp.create_logout_request_url(idp, options, function(err, logout_url) {
    if (err != null)
      return res.send(500);
    res.redirect(logout_url);
  });
});

app.listen(3001, () => {
    console.log('Listening')
});