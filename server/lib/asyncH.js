'use strict';

/*
 * Express 4 does not catch rejected promises thrown inside async route
 * handlers — a DB error would leave the client hanging forever.
 * This wrapper forwards any rejection to the Express error handler.
 */
module.exports = function asyncH(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};