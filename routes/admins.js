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
const ifNotLoggedin = (req, res, next) => {
        if (!req.session.isLoggedIn) {
            return res.render('logins');
        }
        next();
    }
    // ****** จบการ upload รูปภาพ ***********/
    /* GET users listing. */
    // หน้าแรก employee /method get
router.get('/:id', function(req, res, next) {
    const id = req.params.id
    db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                const role = 3;
                return res.render('admins/admin', { result, role });
            }

        })
})

//*************************** รายการอุปกรณ์  **************************************** */



// หน้า Equipment  /method get
router.get('/admin_equipment/s', ifNotLoggedin, function(req, res, next) {
    const id = req.session.userID;
    console.log(id);
    db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                db.query(`SELECT * FROM equipment`,
                    (err, result_eq) => {
                        if (err) {
                            console.log(err)
                        }
                        const role = 3;
                        return res.render('admins/admin_equipment', { result, result_eq, role });
                    })
            }
        })

});


// หน้า แก้ไข อุปกรณ์  /method get
router.get('/admin_edit_equipment/s/:equipment_id', ifNotLoggedin, function(req, res, next) {
    const use_id = req.session.userID;
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
                        const role = 3; //role พนักงาน
                        return res.render('admins/admin_edit_equipment', { result, result_eq, role });
                    })
            }
        })
});

// หน้า Equipment  /method get
router.get('/admin_equipment/s/:id', ifNotLoggedin, function(req, res, next) {
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
                        const role = 3;
                        return res.render('admins/admin_equipment', { result, result_eq, role });

                    })

            }

        })

});
// หน้า re_equipment employee  /method get
router.get('/admin_re_equipment/s/:id', ifNotLoggedin, function(req, res, next) {
    const id = req.params.id;
    console.log(id)
    db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                const role = 3;
                return res.render(`admins/admin_re_equipment`, { result, role });

            }

        })
});
// เพิ่ม re_equipment equipment /method post
router.post('/admin_re_equipment', Rqupload.single("EqPhoto"), [
        check('inputEquipment_name', 'ใส่ ยี่ห้อ').not().isEmpty(),
        check('Device_details', 'ใส่ รายละเอียดอุปกรณ์').not().isEmpty(),
        check('Equipmentnum', 'ใส่จำนวน อุปกรณ์ ').not().isEmpty(),
        check('Price', 'ใส่ ราคา').not().isEmpty(),
    ],
    function(req, res, next) {
        const results = validationResult(req);
        var errors = results.errors;
        const id = req.body.Employee_id;
        const role = 3;

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
                            return res.render('admins/admin_equipment', { error: false, data: results, result, result_eq, role })
                        });


                })
            })


    });

// ลบ equipment อุปกรณ์ /method get
router.get('/de_equipment/s/:id/', ifNotLoggedin, function(req, res, next) {
    const id = req.params.id;
    // const id2 = req.session.id2;
    console.log(id)
    db.query(`DELETE FROM equipment WHERE Equipment_id = ${db.escape(id)}`, (err, results) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/admins/admin_equipment/s')
        }
    });

});
// แก้ไข equipment อุปกรณ์ /method post
router.post('/admin_equipment/s', function(req, res, next) {
    const Eqid = req.body.Equipment_id
    const Equipment_name = req.body.inputEquipment_name;
    const Device_details = req.body.Device_details;
    const Equipmentnum = req.body.Equipmentnum;
    const Price = req.body.Price;
    const Emid = req.body.Employee_id;
    const role = 3;
    db.query(`UPDATE equipment set Equipment_name = ?,Device_details = ?,Equipmentnum = ?,Price = ? WHERE Equipment_id ='${Eqid}'`, [Equipment_name, Device_details, Equipmentnum, Price], (error, results, fields) => {
        if (error) {
            console.log(error)
        } else {
            db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(Emid)};`,
                (err, result) => {
                    db.query(`SELECT * FROM equipment`,
                        (err, result_eq) => {

                            return res.render('admins/admin_equipment', { error: false, result, result_eq, role })
                        });
                })
        }

    });
});


//*************************** จบรายการอุปกรณ์  **************************************** */


//*************************** ดูการนัดหมาย  **************************************** */


router.get('/admin_service/s', ifNotLoggedin, function(req, res, next) {
    const role = 3
    const em_id = req.session.userID; //รหัสพนักงาน Employee_id
    db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(em_id)};`,
        (err, result) => {
            db.query(`SELECT * FROM payment_code 
            inner join hotify_repaiv on payment_code.Hotify_repaiv_id =hotify_repaiv.Hotify_repaiv_id
            inner join equipment on hotify_repaiv.Equipment_id =equipment.Equipment_id WHERE payment_code.statuse ='สำเร็จ'`,
                (err, result_HR) => {
                    return res.render('admins/admin_view_service', { role, result, result_HR })
                })
        })
})

router.get('/slip_view/s/:id', ifNotLoggedin, function(req, res, next) {
    const em_id = req.session.userID; //รหัสพนักงาน Employee_id
    const id = req.params.id
    const role = 3
    db.query(`SELECT * FROM payment_code INNER JOIN hotify_repaiv on hotify_repaiv.Payment_code_id = payment_code.Payment_code_id
    INNER JOIN equipment ON hotify_repaiv.Equipment_id = equipment.Equipment_id
     INNER JOIN slip_record ON slip_record.slip_Payment_code_id = payment_code.Payment_code_id
    WHERE payment_code.statuse = 'สำเร็จ' AND hotify_repaiv.Hotify_repaiv_id = ${db.escape(id)}`,
        (err, result_HR) => {
            if (err) throw err
            db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(em_id)};`,
                (err, result) => {
                    if (err) throw err;
                    const he_id = result_HR[0].Hotify_repaiv_id;
                    console.log(result_HR[0], 'result_HR')
                    console.log(he_id, 'he_id')
                    db.query(`SELECT * FROM air_parts WHERE Hotify_repaiv_id =${db.escape(he_id)}`,
                        (err, result_AP) => {
                            console.log(result_AP[0], 'result_AP')

                            function ap_price_sum() {
                                if (result_AP) {
                                    const numbers = [];
                                    result_AP.forEach(function(APs) {
                                        numbers.push(APs.ap_price * APs.ap_quantity) //ราคา คูณจำนวน
                                    })
                                    return numbers;
                                }
                            }
                            const number = ap_price_sum()
                            let sum = 0
                            for (let i = 0; i < number.length; i++) {
                                sum += number[i]
                            }
                            return res.render('admins/admin_slip_view', { result, result_HR, role, result_AP, sum });
                        })
                })
        });
});



// หน้า confirm_repair /method get
router.get('/admin_confirm_repair/s/:id/:em_id', ifNotLoggedin, function(req, res, next) {
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
                        const role = 3; //role พนักงาน

                        const date = new Date().toLocaleString("th-TH");
                        console.log(result_HR)
                        return res.render('admins/admin_confirm_repair', { result, result_HR, role, date });
                    })
            }
        });
});
router.post('/admin_confirm_repair', ifNotLoggedin,
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

                        const role = 3; //role พนักงาน
                        return res.render('admins/admin_view_appointment', { result, result_Hr, role });

                    })

            });
    })

//*************************** ดูการนัดหมาย  **************************************** */
router.get('/admin_employeepage/s', ifNotLoggedin, function(req, res, next) {
    const id = req.session.userID;
    db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                const role = 3;
                db.query(`SELECT hotify_repaiv.*,equipment.Eq_image,equipment.Equipment_name
          FROM hotify_repaiv
          INNER JOIN equipment ON equipment.Equipment_id=hotify_repaiv.Equipment_id WHERE Appointmentdate is NULL =Employee_id IS NULL`,
                    (err, result_NR) => {

                        return res.render('admins/admin_employeepage', { result, role, result_NR });
                    })

            }

        })

});

router.post('/repair_record', ifNotLoggedin,
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
        const role = 3;

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

                            return res.render('admins/admin_employeepage', { error: false, data: results, result, result_NR, role })
                        });


                })
            })


    });

//*************************** ข้อมูลพนักงาน  **************************************** */

router.get('/admin_employees/s', ifNotLoggedin, function(req, res, next) {
    const id = req.session.userID;
    db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                db.query(`SELECT * FROM employee`,
                    (err, result_edit_ep) => {
                        if (err) {
                            console.log(err)
                        }
                        const role = 3;
                        return res.render('admins/admin_employees', { result, result_edit_ep, role });

                    })

            }

        })

});

// หน้า แก้ไข admin_edit_employees  /method get
router.get('/admin_edit_employees/s/:employees_id', ifNotLoggedin, function(req, res, next) {
    const use_id = req.session.userID;
    const employees_id = req.params.employees_id;
    console.log(employees_id)
    const role = 3;
    db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(employees_id)};`,
        (err, result_edit_ep) => {
            db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(use_id)};`,
                (err, result) => {
                    return res.render('admins/admin_edit_employees', { result, result_edit_ep, role });
                });
        });

});

// ลบ equipment อุปกรณ์ /method get
router.get('/ep_employees/s/:id/:id2', ifNotLoggedin, function(req, res, next) {
    const id = req.params.id;
    const id2 = req.params.id2;
    const role = 3;
    console.log(id, id2)
    db.query(`DELETE FROM employee WHERE Employee_id = ${db.escape(id)}`, (err, results) => {
        if (err) {
            console.log(err);
        } else {
            db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(id2)};`,
                (err, result) => {
                    db.query(`SELECT * FROM employee`,
                        (err, result_edit_ep) => {
                            return res.render('admins/admin_employees', { error: false, result, result_edit_ep, role })
                        });
                })
        }
    });

});

// แก้ไข admin_employees อุปกรณ์ /method post
router.post('/admin_employees/edit', ifNotLoggedin, function(req, res, next) {
    const Em_id = req.body.Employee_id;
    const email = req.body.email;
    const Employee_name = req.body.Employee_name;
    const Employee_email = req.body.Employee_email;
    const Employee_phone = req.body.Employee_phone;
    const Employee_address = req.body.Employee_address;
    const Employee_lgbt = req.body.Employee_lgbt
    db.query(`UPDATE employee set Employee_name = ? , Employee_email = ? , Employee_phone = ? , Employee_address = ? ,Employee_lgbt  = ?
         WHERE Employee_id = '${Em_id}'`, [Employee_name, Employee_email, Employee_phone, Employee_address, Employee_lgbt], (err, res, fields) => {
        if (err) throw err;
    })
    db.query(`SELECT id FROM email_pass WHERE email = ${db.escape(email)}`,
        (err, result) => {
            if (err) throw err
            console.log(result[0])
            const id_ep = result[0].id;
            db.query(`UPDATE email_pass set email = ? 
              WHERE id = '${id_ep}'`, [Employee_email], (err, res, fields) => {
                if (err) throw err
                console.log(err)
            });
            res.redirect(`/admins/admin_edit_employees/s/${Em_id}`)
        });
});

//*************************** จบข้อมูลพนักงาน  **************************************** */

//*************************** ข้อมูลผู้ใช่งาน  **************************************** */

router.get('/admin_user/s', ifNotLoggedin, function(req, res, next) {
    const id = req.session.userID;
    db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                db.query(`SELECT * FROM users`,
                    (err, result_edit_user) => {
                        if (err) {
                            console.log(err)
                        }
                        const role = 3;
                        return res.render('admins/admin_user', { result, result_edit_user, role });

                    })

            }

        })

});


// หน้า แก้ไข admin_edit_user  /method get
router.get('/admin_edit_user/s/:User_id', ifNotLoggedin, function(req, res, next) {
    const use_id = req.session.userID;
    const User_id = req.params.User_id;
    const role = 3;
    db.query(`SELECT * FROM users WHERE User_id = ${db.escape(User_id)};`,
        (err, result_edit_user) => {
            db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(use_id)};`,
                (err, result) => {
                    return res.render('admins/admin_edit_user', { result, result_edit_user, role });
                });
        });

});

// หน้า แก้ไข อุปกรณ์  /method get



// ลบ equipment อุปกรณ์ /method get
router.get('/user_employees/s/:id/:id2', ifNotLoggedin, function(req, res, next) {
    const id = req.params.id;
    const id2 = req.params.id2;
    const role = 3;
    console.log(id, id2)
    db.query(`DELETE FROM users WHERE User_id = ${db.escape(id)}`, (err, results) => {
        if (err) {
            console.log(err);
        } else {
            db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(id2)};`,
                (err, result) => {
                    db.query(`SELECT * FROM users`,
                        (err, result_edit_user) => {
                            return res.render('admins/admin_user', { error: false, result, result_edit_user, role })
                        });
                })
        }
    });

});


router.post('/admin_user/s', ifNotLoggedin, function(req, res, next) {
    const User_id = req.body.User_id;
    const email = req.body.email;
    const User_name = req.body.User_name;
    const User_phone = req.body.User_phone;
    const User_email = req.body.User_email;
    const User_address = req.body.User_address;
    console.log(User_id, User_name, User_phone, User_email, User_address)
    db.query(`UPDATE users set User_name = ? , User_phone = ? , User_address = ? ,User_email=? WHERE User_id = '${User_id}'`, [User_name, User_phone, User_address, User_email], (err, res, fields) => {
        if (err) throw err;
    })
    db.query(`SELECT id FROM email_pass WHERE email = ${db.escape(email)}`,
        (err, result) => {
            if (err) throw err
            console.log(result[0])
            const id_ep = result[0].id;
            db.query(`UPDATE email_pass set email = ? 
          WHERE id = '${id_ep}'`, [User_email], (err, res, fields) => {
                if (err) throw err
                console.log(err)
            });
            res.redirect(`/admins/admin_edit_user/s/${User_id}`);
        });
});


//*************************** จบข้อมูลผู้ใช่งาน  **************************************** */


module.exports = router;