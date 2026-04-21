let express = require('express');
let cors = require('cors');

let app = express();

// CORS d'abord
app.use(cors());

// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let router = require('./routes');
app.use('/', router);

let port = 8000;

app.listen(port, function () {
  console.log('Server running on port ' + port);
});