var express = require('express');
var router = express.Router();
const db = require('../lib/connect.js')
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const {
  check,
  validationResult
} = require('express-validator');

/* GET users listing. */

router.get('/:id', function (req, res, next) {
  const id = req.params.id
  const role = 1;
  db.query(`SELECT * FROM users WHERE User_id = ${db.escape(id)};`,
  (err, result) => {
    if(err){
      console.log(err)
    }else{ 
      db.query(`SELECT * FROM equipment`,
      (err, result_eq) => {
        if (err) {
          console.log(err)
        }
        return res.render('users/user', { result, result_eq, role });
      })
    }
    })
  }
)

router.get('/useProfiles/:id', function (req, res, next) {
    const id = req.params.id;
    db.query(`SELECT * FROM users WHERE User_id = ${db.escape(id)};`,
    (err, result) => {
      if(err){
        console.log(err)
      }else{
        const role = 1;
        return res.render('users/useProfile',{result,role});
      }
     
      })
})
router.get('/notify_repair/s/:id/:useid', function (req, res, next) {
  const id = req.params.id;
  const useid = req.params.useid;
  const role = 1;
const result = useid;
console.log(result)
      db.query(`SELECT Equipment_id FROM equipment WHERE Equipment_id = ${db.escape(id)};`,
      (err, result_eq) => {
        if (err) {
          console.log(err)
        }
        return  res.render('users/notify_repair', { result, result_eq, role });
      })
    })
 


router.get('/register/s', function (req, res, next) {
  res.render('users/register');
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
      res.render('users/register', {
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
    const role = 1;
    //  console.log(Name,Password,Phone,Address, Email)
    //  console.log(Password)
    //  console.log(Passwordhash)
    db.query('INSERT INTO email_pass (email,password,role) VALUES(?,?,?)',
    [Email, Passwordhash, role], (error, results, fields) => {
      if (error) throw error;
    })
    db.query('INSERT INTO users (User_name,User_password,User_phone,User_email,User_address) VALUES(?,?,?,?,?)', [Name, Passwordhash, Phone, Email, Address], (error, results, fields) => {
      if (error) throw error;

      return res.render('users/register', { error: false, data: results, message: "create success" })

    })
  }
);

router.post('/notify_repairs', function (req, res, next) {
  const Eq_id = req.body.Equipment_id;
  const use_id = req.body.inputUseid;
  const Rdn = req.body.Repair_details_num;
  const date = new Date();
  const result = use_id;
  const role = 1;
  db.query(`INSERT INTO hotify_repaiv (Equipment_id,User_id ,Repair_details_num ,Repair_noticedate) VALUES(?,?,?,?)`,[Eq_id, use_id, Rdn, date], (error, results, fields) => {
    if (error) throw error;
    
    db.query(`SELECT * FROM equipment`,
    (err, result_eq) => {
      if (err) {
        console.log(err)
      }
      return res.render('users/user', { result, result_eq, role });
    })

  })
 
})



module.exports = router;
