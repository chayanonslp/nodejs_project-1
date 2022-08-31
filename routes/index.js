var express = require('express');
var router = express.Router();
const db = require('../lib/connect')
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
/* GET home page. */
router.get('/', function (req, res, next) {
  // var vr = con.query("SELECT * From user")

  res.render('index', { title: 'Express' });
});
router.get('/login', function (req, res, next) {
  // var vr = con.query("SELECT * From user")

  res.render('logins', { title: 'Express' });
});
router.post('/login',
  [
    check('email', 'ใส่ E-mail').not().isEmpty(),
    check('password', 'ใส่ Password').not().isEmpty(),
  ],
  function (req, res, next) {
    const result = validationResult(req);
    var errors = result.errors;

    if (!result.isEmpty()) {
      res.render('logins', {
        errors: errors
      })
      return res.status(400).send({ error: true, message: "Please provide user username and password." });
    }
    db.query(
      `SELECT * FROM users WHERE User_email = ${db.escape(req.body.email)};`,
      (err, result) => {
        // user does not exists
        if (err) {
          throw err;
          return res.status(400).send({
            msg: err
          });
        }
        if (!result.length) {
          return res.status(401).send({
            msg: 'Email or password is incorrect!_1'
          });
        }
 // check password
 bcrypt.compare(req.body.password,result[0]['password'],
 console.log(result[0],'check',req.body.password),
  (bErr, bResult) => {
    
    // wrong password
    if (bErr) {
      throw bErr;
      return res.status(401).send({
        msg: 'Email or password is incorrect!_2'
      });
    }
    if (bResult) {
      
      const token = jwt.sign({id:result[0].User_id},'the-super-strong-secrect',{ expiresIn: '1h' });
      db.query(
        `UPDATE users SET last_login = now() WHERE User_id = '${result[0].User_id}'`
      );
      return res.status(200).send({
        msg: 'Logged in!',
        token,
        user: result[0]
      });
    }
    return res.status(401).send({
      msg: 'Username or password is incorrect!_3'
    });
  }
);
      }

    )
  })
module.exports = router;
