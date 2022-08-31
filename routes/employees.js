var express = require('express');
var router = express.Router();
const db = require('../lib/connect.js')
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
/* GET users listing. */
// router.get('/', function (req, res, next) {
//   db.query('SELECT * FROM users');

//   console.log(db)
//   res.render('users', { title: 'User' + id });
// });

// router.get('/', function (req, res, next) {
//   db.query("SELECT * FROM users", (err, result) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.render('employees', { title: 'User' + result[0].User_id + result[0].User_name });
//     }
//   });
// })
router.get('/register', function (req, res, next) {
  res.render('employees/registers', { title: 'Employee_register' });
});
// เพิ่ม Users
router.post('/register',
  [
    check('inputEmName', 'ใส่ ชื่อ').not().isEmpty(),
    check('inputEmPassword', 'ใส่ Password').not().isEmpty(),
    check('inputEmPhone', 'ใส่ Phone number').not().isEmpty(),
    check('inputEmAddress', 'ใส่ ที่อยู่').not().isEmpty(),
    check('inputEmlgbt', 'เลือกเพศ').not().isEmpty(),
    check('inputEmail', 'ใส่ E-mail').not().isEmpty(),
    check('inputEmstatus', 'ใส่ สถานะ').not().isEmpty(),

  ],
  function (req, res, next) {
    const result = validationResult(req);
    var errors = result.errors;

    if (!result.isEmpty()) {
      res.render('employees/registers', {  errors: errors })
      return res.status(400).send({ error: true, message: "Please provide user username and password." });
    }
    const EmName = req.body.inputEmName;
    const EmPassword = req.body.inputEmPassword;
    const EmPhone = req.body.inputEmPhone;
    const EmAddress = req.body.inputEmAddress;
    const Emlgbt = req.body.inputEmlgbt;
    const Email = req.body.inputEmail;
    const Emstatus = req.body.inputEmstatus;
    const date ="1-1-2000"
    const EmPhoto = "XXXXX.png"
    const EmPasswordhash = bcrypt.hashSync(EmPassword, 10);

    console.log(EmName, EmPassword,EmPhone, EmAddress, Emlgbt,Email,Emstatus,date,EmPhoto)
    // console.log(Emdate)


    db.query('INSERT INTO employee (Employee_name,Employee_password,Employee_phone,Employee_address,Employee_date_of_birth,Employee_lgbt,Employee_Photo,Employee_email,Employee_status) VALUES(?,?,?,?,?,?,?,?,?)', 
    [EmName, EmPasswordhash,EmPhone, EmAddress,date ,Emlgbt,EmPhoto,Email,Emstatus], (error, results, fields) => {
      if (error) throw error;

      return res.render('employees/registers', { error: false, data: results, message: "create success" })

    })
  }
);



module.exports = router;
