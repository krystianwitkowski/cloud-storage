const express = require('express');
const dotenv = require('dotenv').config();
const helmet = require('helmet');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const compression = require('compression');

const app = express();

app.use(express.static('../dist'));
app.use(bodyParser.json())
app.use(compression());
app.use(helmet());
app.use(fileUpload());

/* Routes */
const files = require('./routes/files.js');
const users = require('./routes/users.js');
const authentication = require('./routes/authentication.js');
const tokens = require('./routes/tokens.js');

/* Middlewares */
const requestLimit = require('./middlewares/requestLimit.js');
const verifyToken = require('./middlewares/verifyToken.js');

app.use('/api/users', users);
app.use('/api/authentication', requestLimit, authentication);
app.use('/api/tokens', tokens);

app.use(verifyToken);
app.use('/api/files', files);

app.listen(process.env.PORT);


