const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');
const morgan = require('morgan');
const apiRouter = require('./server/src/routers/apiRouter');

const app = express();
app.use(express.json());
app.use(morgan('tiny'));

app.use('/api', apiRouter);
app.use('/', serveStatic(path.join(__dirname, '/client/dist')))
app.get(/.*/, function(req, res) {
    res.sendFile(path.join(__dirname, '/client/dist/index.html'));
});

const start = () => {
    try {
        // Add connection to DB
        app.listen(process.env.PORT || 8080, () => {
            console.log('Server is running');
        });
    } catch (error) {
        console.log(`Error on server setup: ${error}`)
    }
}

start();