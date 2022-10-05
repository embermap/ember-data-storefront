/* eslint-env node */
'use strict';

module.exports = function (app) {
  const express = require('express');
  let postsRouter = express.Router();

  postsRouter.get('/', function (req, res) {
    res.send({
      data: [
        {
          type: 'posts',
          id: 1,
          attributes: {
            title: 'Hello from Ember CLI HTTP Mocks',
          },
        },
      ],
    });
  });

  postsRouter.get('/1', function (req, res) {
    res.send({
      data: {
        type: 'posts',
        id: 1,
        attributes: {
          title: 'Hello from Ember CLI HTTP Mocks',
        },
      },
    });
  });

  app.use('/posts', postsRouter);
};
