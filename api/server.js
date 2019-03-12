const express = require('express');

const configMiddleware = require('./middleware');
const authRouter = require('../auth/authRouter');
const postsRouter = require('../posts/postsRouter');
const schoolsRouter = require('../schools/schoolsRouter');
const usersRouter = require('../users/usersRouter');

const server = express();

configMiddleware(server);
server.use('/auth', authRouter);
server.use('/api/posts', postsRouter);
server.use('/api/schools', schoolsRouter);
server.use('/api/users', usersRouter);

server.get('/', (req, res) => res.status(200).send('Working so far'));

module.exports = server;