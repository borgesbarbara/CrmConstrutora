require('dotenv').config();
const config = require('./config');
const app = require('./app');

const PORT = config.server.port;

app.listen(PORT, () => {}); 