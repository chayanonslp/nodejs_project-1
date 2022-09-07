var express = require('express');
var router = express.Router();
const db = require('../lib/connect.js')
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { ResultWithContext } = require('express-validator/src/chain/context-runner-impl.js');
var multer = require('multer');
//******upload รูปภาพ ***********/

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/image');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + ".jpg");
  }
});

var upload = multer({
  storage: storage
});

// ****** จบการ upload รูปภาพ ***********/
/* GET users listing. */
router.get('/:id', function (req, res, next) {
  const id = req.params.id;
  db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(id)};`,
    (err, result) => {
      if (err) {
        console.log(err)
      } else {
        const role = 2;
        return res.render('employees/employeepage', { result, role });
      }

    })

}
);

router.get('/emProfiles/:id', function (req, res, next) {
  const id = req.params.id;
  db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(id)};`,
    (err, result) => {
      if (err) {
        console.log(err)
      } else {
        const role = 2;
        return res.render('employees/emProfile', { result, role });
      }

    })
}
);
router.get('/register/s', function (req, res, next) {
  res.render('employees/register');
});
// เพิ่ม Users
router.post('/register', upload.single("inputEmPhoto"),

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
    var image = req.file.filename
    console.log(image)
    const result = validationResult(req);
    var errors = result.errors;

    if (!result.isEmpty()) {
      res.render('employees/register', { errors: errors })
      return res.status(400).send({ error: true, message: "Please provide user username and password." });
    }
    const EmName = req.body.inputEmName;
    const EmPassword = req.body.inputEmPassword;
    const EmPhone = req.body.inputEmPhone;
    const EmAddress = req.body.inputEmAddress;
    const Emlgbt = req.body.inputEmlgbt;
    const Email = req.body.inputEmail;
    const Emstatus = req.body.inputEmstatus;
    const date = "1-1-2000"
    const EmPhoto = req.file.filename
    const EmPasswordhash = bcrypt.hashSync(EmPassword, 10);
    const role = 2;
    
    db.query('INSERT INTO email_pass (email,password,role) VALUES(?,?,?)',
      [Email, EmPasswordhash, role], (error, results, fields) => {
        if (error) throw error;

      })
    db.query('INSERT INTO employee (Employee_name,Employee_password,Employee_phone,Employee_address,Employee_date_of_birth,Employee_lgbt,Employee_Photo,Employee_email,Employee_status) VALUES(?,?,?,?,?,?,?,?,?)',
      [EmName, EmPasswordhash, EmPhone, EmAddress, date, Emlgbt, EmPhoto, Email, Emstatus], (error, results, fields) => {
        if (error) throw error;

        return res.render('employees/register', { error: false, data: results, message: "create success" })

      })


  }
);



module.exports = router;
