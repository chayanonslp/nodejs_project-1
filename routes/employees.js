var express = require('express');
var router = express.Router();
const db = require('../lib/connect.js')
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { ResultWithContext } = require('express-validator/src/chain/context-runner-impl.js');
var multer = require('multer');
//******upload รูปภาพ ***********/

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/image');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + ".jpg");
    }
});

var upload = multer({
    storage: storage
});

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/Eqimage');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + ".jpg");
    }
});

var Rqupload = multer({
    storage: storage
});

// ****** จบการ upload รูปภาพ ***********/
/* GET users listing. */
// หน้าแรก employee /method get
router.get('/:id', function(req, res, next) {
    const id = req.params.id;
    db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                const role = 2;
                db.query(`SELECT hotify_repaiv.*,equipment.Eq_image,equipment.Equipment_name
        FROM hotify_repaiv
        INNER JOIN equipment ON equipment.Equipment_id=hotify_repaiv.Equipment_id WHERE Appointmentdate is NULL =Employee_id IS NULL`,
                    (err, result_NR) => {

                        return res.render('employees/employeepage', { result, role, result_NR });
                    })

            }

        })

});
// หน้า Profiles employee /method get
router.get('/emProfiles/:id', function(req, res, next) {
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
});
// หน้า register employee  /method get
router.get('/register/s', function(req, res, next) {
    res.render('employees/register');
});
// หน้า re_equipment employee  /method get
router.get('/re_equipment/s/:id', function(req, res, next) {
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

// หน้าแสดง อุปกรณ์ Equipment  /method get
router.get('/equipment/s/:id', function(req, res, next) {
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
router.get('/edit_equipment/s/:equipment_id/:use_id', function(req, res, next) {
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
                        const role = 2; //role พนักงาน
                        return res.render('employees/edit_equipment', { result, result_eq, role });

                    })

            }

        })

});
// หน้า Appointment วันที่นัดหมาย	  /method get
router.get('/appointment/s/:Hr_id/:em_id', function(req, res, next) {
    const em_id = req.params.em_id;
    const Hr_id = req.params.Hr_id;
    db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(em_id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                db.query(`SELECT * FROM hotify_repaiv WHERE Hotify_repaiv_id = ${db.escape(Hr_id)}`,
                    (err, result_Hr) => {
                        if (err) {
                            console.log(err)
                        }
                        const role = 2; //role พนักงาน
                        return res.render('employees/appointment', { result, result_Hr, role });

                    })

            }

        })
});
// หน้า view appointment ดูรายการที่นัดหมาย	  /method get
router.get('/view_appointment/s/:em_id', function(req, res, next) {
    const em_id = req.params.em_id;
    db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(em_id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                db.query(`SELECT *
                FROM appointment inner JOIN hotify_repaiv ON appointment.Hotify_repaiv_id = hotify_repaiv.Hotify_repaiv_id
                 inner JOIN equipment
                  ON hotify_repaiv.Equipment_id = equipment.Equipment_id  
               WHERE  hotify_repaiv.Employee_id = ${db.escape(em_id)} = hotify_repaiv.statuse is NULL `,

                    (err, result_Hr) => {
                        if (err) {
                            console.log(err)
                        }
                        const role = 2; //role พนักงาน
                        return res.render('employees/view_appointment', { result, result_Hr, role });

                    })

            }

        })

});

// หน้า confirm_repair /method get
router.get('/confirm_repair/s/:id/:em_id', function(req, res, next) {
    const id = req.params.id; //รหัสวันนัดหมาย Appointment_date_id
    const em_id = req.params.em_id; //รหัสพนักงาน Employee_id
    console.log(id, em_id)
    db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(em_id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                db.query(`SELECT * FROM appointment INNER JOIN hotify_repaiv on hotify_repaiv.Hotify_repaiv_id = appointment.Hotify_repaiv_id
                INNER JOIN equipment ON hotify_repaiv.Equipment_id = equipment.Equipment_id
                WHERE appointment.Appointment_date_id =${db.escape(id)}`,

                    (err, result_HR) => {
                        if (err) {}
                        const role = 2; //role พนักงาน

                        const date = new Date().toLocaleString("th-TH");
                        console.log(result_HR)
                        return res.render('employees/confirm_repair', { result, result_HR, role, date });

                    })
            }
        });
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


    ],
    function(req, res, next) {
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

        const date = "1-1-2000"
        const EmPhoto = req.file.filename
        const EmPasswordhash = bcrypt.hashSync(EmPassword, 10);
        const role = 2;

        db.query('INSERT INTO email_pass (email,password,role) VALUES(?,?,?)', [Email, EmPasswordhash, role], (error, results, fields) => {
            if (error) throw error;

        })
        db.query('INSERT INTO employee (Employee_name,Employee_password,Employee_phone,Employee_address,Employee_date_of_birth,Employee_lgbt,Employee_Photo,Employee_email) VALUES(?,?,?,?,?,?,?,?)', [EmName, EmPasswordhash, EmPhone, EmAddress, date, Emlgbt, EmPhoto, Email], (error, results, fields) => {
            if (error) throw error;

            return res.render('employees/register', { error: false, data: results, message: "create success" })

        })


    }
);

// เพิ่ม re_equipment equipment /method post
router.post('/re_equipment', Rqupload.single("EqPhoto"), [
        check('inputEquipment_name', 'ใส่ ยี่ห้อ').not().isEmpty(),
        check('Device_details', 'ใส่ รายละเอียดอุปกรณ์').not().isEmpty(),
        check('Equipmentnum', 'ใส่จำนวน อุปกรณ์ ').not().isEmpty(),
        check('Price', 'ใส่ ราคา').not().isEmpty(),
    ],
    function(req, res, next) {
        const results = validationResult(req);
        var errors = results.errors;
        const id = req.body.Employee_id;
        const role = 2;

        const Equipment_name = req.body.inputEquipment_name;
        const Device_details = req.body.Device_details;
        const Equipmentnum = req.body.Equipmentnum;
        const Price = req.body.Price;
        const EqPhoto = req.file.filename
        console.log(EqPhoto)
        db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(id)};`,
            (err, result) => {
                db.query('INSERT INTO equipment (Equipment_name,Device_details,Equipmentnum,Price,Eq_image) VALUES(?,?,?,?,?)', [Equipment_name, Device_details, Equipmentnum, Price, EqPhoto], (error, results, fields) => {
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
router.get('/de_equipment/s/:id/:id2', function(req, res, next) {
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
router.post('/equipment/s', function(req, res, next) {
    const Eqid = req.body.Equipment_id
    const Equipment_name = req.body.inputEquipment_name;
    const Device_details = req.body.Device_details;
    const Equipmentnum = req.body.Equipmentnum;
    const Price = req.body.Price;
    const Emid = req.body.Employee_id;
    const role = 2;
    db.query(`UPDATE equipment set Equipment_name = ?,Device_details = ?,Equipmentnum = ?,Price = ? WHERE Equipment_id ='${Eqid}'`, [Equipment_name, Device_details, Equipmentnum, Price], (error, results, fields) => {
        if (error) {
            console.log(error)
        } else {
            db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(Emid)};`,
                (err, result) => {
                    db.query(`SELECT * FROM equipment`,
                        (err, result_eq) => {

                            return res.render('employees/equipment', { error: false, result, result_eq, role })
                        });
                })
        }

    });



});

router.post('/repair_record',
    // [
    //   check('Repair_record_id ', '1 ').not().isEmpty(),
    //   check('Hotify_repaiv_id', '2').not().isEmpty(),
    //   check('Employee_id', '3 ').not().isEmpty(),
    //   check('Repair_date', '4').not().isEmpty(),
    //   check('Device_details', '5').not().isEmpty(),
    // ],
    function(req, res, next) {
        const results = validationResult(req);
        var errors = results.errors;
        const role = 2;

        const Hotify_repaiv_id = req.body.Hotify_repaiv_id;
        const Employee_id = req.body.Employee_id;
        const Repair_notice_date = req.body.Repair_notice_date;
        const Amdate = req.body.Date;
        // แปลง วัน/เดือน/ปี 
        let today = new Date(Amdate);
        const Appoint_ment_date = today.toLocaleString("th-TH");

        db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(Employee_id)};`,
            (err, result) => {
                db.query('INSERT INTO appointment ( Hotify_repaiv_id, Employee_id, Repair_notice_date,Appoint_ment_date) VALUES(?,?,?,?)', [Hotify_repaiv_id, Employee_id, Repair_notice_date, Appoint_ment_date], (error, results, fields) => {
                    if (error) throw error;
                    db.query(`SELECT hotify_repaiv.*,equipment.Eq_image,equipment.Equipment_name
            FROM hotify_repaiv
            INNER JOIN equipment ON equipment.Equipment_id=hotify_repaiv.Equipment_id WHERE Appointmentdate is NULL =Employee_id IS NULL`,
                        (err, result_NR) => {
                            db.query(`UPDATE hotify_repaiv
                SET Appointmentdate ="${(Appoint_ment_date)}" , Employee_id ="${(Employee_id)}"
                WHERE Hotify_repaiv_id =${db.escape(Hotify_repaiv_id)} `)

                            return res.render('employees/employeepage', { error: false, data: results, result, result_NR, role })
                        });


                })
            })


    });
router.post('/confirm_repair',
    function(req, res, next) {
        const Hotify_repaiv_id = req.body.Hotify_repaiv_id;
        const Repair_date = req.body.date;
        const Equipment_num = 'ว่าง'
        const Repair_cost = req.body.Price;
        const status = req.body.status;
        const em_id = req.body.Employee_id;
        console.log(em_id)

        // return res.render('employees/view_appointment')
        db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(em_id)};`,
            (err, result) => {
                if (err) {
                    console.log(err)
                }
                db.query(`SELECT *
                FROM appointment inner JOIN hotify_repaiv ON appointment.Hotify_repaiv_id = hotify_repaiv.Hotify_repaiv_id
                 inner JOIN equipment
                  ON hotify_repaiv.Equipment_id = equipment.Equipment_id  
               WHERE  hotify_repaiv.Employee_id = ${db.escape(em_id)} = hotify_repaiv.statuse is NULL`,

                    (err, result_Hr) => {
                        if (err) {
                            console.log(err)
                        }
                        db.query('INSERT INTO payment_code ( Hotify_repaiv_id, Repair_date, Equipment_num,Repair_cost,statuse) VALUES(?,?,?,?,?)', [Hotify_repaiv_id, Repair_date, Equipment_num, Repair_cost, status], (error, results, fields) => {
                            if (error) throw error;

                        })
                        db.query(
                            `UPDATE hotify_repaiv SET statuse =${db.escape(status)}  WHERE Hotify_repaiv_id = '${result_Hr[0].Hotify_repaiv_id}'`
                        );

                        const role = 2; //role พนักงาน
                        return res.render('employees/view_appointment', { result, result_Hr, role });

                    })

            });
    })

module.exports = router;