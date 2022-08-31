var express = require('express');
var router = express.Router();
const db = require('../lib/connect.js')
const bcrypt = require('bcrypt');
const {
  check,
  validationResult
} = require('express-validator');

/* GET users listing. */
// router.get('/', function (req, res, next) {
//   db.query('SELECT * FROM users');

//   console.log(db)
//   res.render('users', { title: 'User' + id });
// });

router.get('/', function (req, res, next) {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.render('users', { title: 'User' + result[0].User_id + result[0].User_name });
    }
  });
})
router.get('/register', function (req, res, next) {
  res.render('users/registers', { title: 'User_register' });
});
// เพิ่ม Users
router.post('/register',
  [
    check('inputName', 'ใส่ ชื่อ').not().isEmpty(),
    check('inputPassword', 'ใส่ Password').not().isEmpty(),
    check('inputPhone', 'ใส่ Phone Number').not().isEmpty(),
    check('inputEmail', 'ใส่ E-mail').not().isEmpty(),
    check('inputAddress', 'ใส่ ที่อยู่').not().isEmpty(),

  ],
  function (req, res, next) {
    const result = validationResult(req);
    var errors = result.errors;

    if (!result.isEmpty()) {
      res.render('users/registers', {
        errors: errors
      })
      return res.status(400).send({ error: true, message: "Please provide user username and password." });
    }

    const Name = req.body.inputName;
    const Password = req.body.inputPassword;
    const Phone = req.body.inputPhone;
    const Email = req.body.inputEmail;
    const Address = req.body.inputAddress;
    const Passwordhash = bcrypt.hashSync(Password, 10);

    //  console.log(Name,Password,Phone,Address, Email)
    //  console.log(Password)
    //  console.log(Passwordhash)

    db.query('INSERT INTO users (User_name,User_password,User_phone,User_email,User_address) VALUES(?,?,?,?,?)', [Name, Passwordhash, Phone, Email, Address], (error, results, fields) => {
      if (error) throw error;

      return res.render('users/registers', { error: false, data: results, message: "create success" })

    })
  }
);




module.exports = router;
