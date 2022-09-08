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
// หน้าแรก employee /method get
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
// หน้า Profiles employee /method get
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
// หน้า register employee  /method get
router.get('/register/s', function (req, res, next) {
  res.render('employees/register');
});
// หน้า re_equipment employee  /method get
router.get('/re_equipment/s/:id', function (req, res, next) {
  const id = req.params.id;
  console.log(id)
  db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(id)};`,
    (err, result) => {
      if (err) {
        console.log(err)
      } else {
        const role = 2;
        return res.render(`employees/re_equipment`, { result, role });

      }

    })
});

// หน้า Equipment  /method get
router.get('/equipment/s/:id', function (req, res, next) {
  const id = req.params.id;
  db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(id)};`,
    (err, result) => {
      if (err) {
        console.log(err)
      } else {
        db.query(`SELECT * FROM equipment`,
          (err, result_eq) => {
            if (err) {
              console.log(err)
            }
            const role = 2;
            return res.render('employees/equipment', { result, result_eq, role });

          })

      }

    })

});
// หน้า แก้ไข อุปกรณ์  /method get
router.get('/edit_equipment/s/:equipment_id/:use_id', function (req, res, next) {
  const use_id = req.params.use_id;
  const equipment_id = req.params.equipment_id;
  db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(use_id)};`,
    (err, result) => {
      if (err) {
        console.log(err)
      } else {
        db.query(`SELECT * FROM equipment WHERE equipment_id = ${db.escape(equipment_id)}`,
          (err, result_eq) => {
            if (err) {
              console.log(err)
            }
            const role = 2;//role พนักงาน
            return res.render('employees/edit_equipment', { result, result_eq, role });

          })

      }

    })

});


// เพิ่ม register employee /method post
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

// เพิ่ม re_equipment equipment /method post
router.post('/re_equipment',
  [
    check('inputEquipment_name', 'ใส่ ยี่ห้อ').not().isEmpty(),
    check('Device_details', 'ใส่ รายละเอียดอุปกรณ์').not().isEmpty(),
    check('Equipmentnum', 'ใส่จำนวน อุปกรณ์ ').not().isEmpty(),
    check('Price', 'ใส่ ราคา').not().isEmpty(),
  ],
  function (req, res, next) {
    const results = validationResult(req);
    var errors = results.errors;
    const id = req.body.Employee_id;
    const role = 2;

    const Equipment_name = req.body.inputEquipment_name;
    const Device_details = req.body.Device_details;
    const Equipmentnum = req.body.Equipmentnum;
    const Price = req.body.Price;
    db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(id)};`,
      (err, result) => {
        db.query('INSERT INTO equipment (Equipment_name,Device_details,Equipmentnum,Price) VALUES(?,?,?,?)',
          [Equipment_name, Device_details, Equipmentnum, Price], (error, results, fields) => {
            if (error) throw error;
            db.query(`SELECT * FROM equipment`,
              (err, result_eq) => {
                return res.render('employees/equipment', { error: false, data: results, result, result_eq, role })
              });


          })
      })

    // if (!results.isEmpty() || id) {
    //   const ids = id;
    //   db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(ids)};`,
    //     (err, result) => {
    //       if (err) {
    //         console.log(err)
    //       } else {
    //         res.render("/employees/re_equipment",)
    //         return res.status(400);
    //       }



    //     }
    //   )
    // }
  });

// ลบ equipment อุปกรณ์ /method get
router.get('/de_equipment/s/:id/:id2', function (req, res, next) {
  const id = req.params.id;
  const id2 = req.params.id2;
  const role = 2;
  console.log(id, id2)
  db.query(`DELETE FROM equipment WHERE Equipment_id = ${db.escape(id)}`, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(id2)};`,
        (err, result) => {
          db.query(`SELECT * FROM equipment`,
            (err, result_eq) => {
              return res.render('employees/equipment', { error: false, result, result_eq, role })
            });
        })
    }
  });

});
// แก้ไข equipment อุปกรณ์ /method post
router.post('/equipment/s', function (req, res, next) {
  const Eqid = req.body.Equipment_id
  const Equipment_name = req.body.inputEquipment_name;
  const Device_details = req.body.Device_details;
  const Equipmentnum = req.body.Equipmentnum;
  const Price = req.body.Price;
  const Emid = req.body.Employee_id;
  const role = 2;
  db.query(`UPDATE equipment set Equipment_name = ?,Device_details = ?,Equipmentnum = ?,Price = ? WHERE Equipment_id ='${Eqid}'`,
  [Equipment_name, Device_details, Equipmentnum, Price], (error, results, fields) => {
   if(error){
    console.log(error)
   }else{
    db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(Emid)};`,
    (err, result) => {
        db.query(`SELECT * FROM equipment`,
        (err, result_eq) => {

          return res.render('employees/equipment', { error: false, result,result_eq,role})
        });
  })
   }
   
  });
  
 

});

module.exports = router;
