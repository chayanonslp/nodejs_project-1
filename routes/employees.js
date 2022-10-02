var express = require('express');
var router = express.Router();
const db = require('../lib/connect.js')
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const date = require('date-and-time')
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

const ifNotLoggedin = (req, res, next) => {
        if (!req.session.isLoggedIn) {
            return res.render('logins');
        }
        next();
    }
    /* GET employee */
    /* GET employee */
    /* GET employee */

// หน้าแรก employee /method get
router.get('/', ifNotLoggedin, function(req, res, next) {
    console.log(req.session)
    const id = req.session.userID;
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
router.get('/emProfiles', ifNotLoggedin, function(req, res, next) {
    const id = req.session.userID;
    const role = 2;
    db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {

                return res.render('employees/emProfile', { result, role });
            }

        })
});
// หน้า register employee  /method get
router.get('/register/s', function(req, res, next) {
    res.render('employees/register');
});
// หน้า re_equipment employee  /method get
router.get('/re_equipment/s', ifNotLoggedin, function(req, res, next) {
    const id = req.session.userID;
    const role = 2;
    db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                return res.render(`employees/re_equipment`, { result, role });

            }

        })
});

// หน้าแสดง อุปกรณ์ Equipment  /method get
router.get('/equipment/s', ifNotLoggedin, function(req, res, next) {
    const id = req.session.userID;
    const role = 2;
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
                        return res.render('employees/equipment', { result, result_eq, role });

                    })

            }

        })

});
// หน้า แก้ไข อุปกรณ์  /method get
router.get('/edit_equipment/s/:equipment_id', ifNotLoggedin, function(req, res, next) {
    const id = req.session.userID; // พนักงาน
    const equipment_id = req.params.equipment_id;
    const role = 2; //role พนักงาน
    console.log(id)
    db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                db.query(`SELECT * FROM equipment WHERE equipment_id = ${db.escape(equipment_id)}`,
                    (err, result_eq) => {
                        if (err) {
                            console.log(err)
                        }
                        return res.render('employees/edit_equipment', { result, result_eq, role });

                    })

            }

        })

});
// หน้า Appointment วันที่นัดหมาย	  /method get
router.get('/appointment/s/:Hr_id/', function(req, res, next) {
    const em_id = req.session.userID;
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
router.get('/view_appointment/s', ifNotLoggedin, function(req, res, next) {
    const em_id = req.session.userID;
    const role = 2; //role พนักงาน
    db.query(`SELECT Employee_id,Employee_name FROM employee WHERE Employee_id = ${db.escape(em_id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                db.query(`SELECT * FROM appointment inner JOIN hotify_repaiv ON appointment.Hotify_repaiv_id = hotify_repaiv.Hotify_repaiv_id
                inner JOIN equipment ON hotify_repaiv.Equipment_id = equipment.Equipment_id  
                WHERE  hotify_repaiv.Employee_id =${db.escape(em_id)} AND hotify_repaiv.Payment_code_id IS null`,

                    (err, result_Hr) => {
                        if (err) {
                            console.log(err)
                        }

                        return res.render('employees/view_appointment', { result, result_Hr, role });

                    })

            }

        })

});
router.get('/view_details/s/:id', ifNotLoggedin, function(req, res, next) {
    const em_id = req.session.userID;
    const Hrid = req.params.id;
    const role = 2; //role พนักงาน
    db.query(`SELECT * FROM hotify_repaiv WHERE Hotify_repaiv_id = ${db.escape(Hrid)};`,
        (err, result_HR) => {
            if (err) {
                console.log(err)
            } else {
                console.log(result_HR)
                db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(em_id)};`,
                    (err, result) => {
                        return res.render('employees/view_details', { result, result_HR, role });
                    })
            }
        })
});

// หน้า confirm_repair /method get
router.get('/confirm_repair/s/:id', ifNotLoggedin, function(req, res, next) {
    const id = req.params.id; //รหัสวันนัดหมาย Appointment_date_id
    const em_id = req.session.userID; //รหัสพนักงาน Employee_id
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
// หน้า /slip_record/s /method get
router.get('/slip_record/s', ifNotLoggedin, function(req, res, next) {
    const em_id = req.session.userID; //รหัสพนักงาน Employee_id
    const role = 2
    db.query(`SELECT * FROM payment_code INNER JOIN hotify_repaiv on hotify_repaiv.Payment_code_id = payment_code.Payment_code_id
                INNER JOIN equipment ON hotify_repaiv.Equipment_id = equipment.Equipment_id
                WHERE hotify_repaiv.Employee_id = ${db.escape(em_id)} AND payment_code.statuse ='รอตรวจสอบ'`,

        (err, result_HR) => {
            if (err) throw err
            db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(em_id)};`,
                (err, result) => {
                    return res.render('employees/slip_record', { result, result_HR, role });
                })
        })
});
// หน้า /slip_record/s /method get รอตรวจสอบ
router.get('/slip_view/s/:id', ifNotLoggedin, function(req, res, next) {
    const em_id = req.session.userID; //รหัสพนักงาน Employee_id
    const id = req.params.id
    console.log(id)
    const role = 2
    db.query(`SELECT * FROM payment_code INNER JOIN hotify_repaiv on hotify_repaiv.Payment_code_id = payment_code.Payment_code_id
    INNER JOIN equipment ON hotify_repaiv.Equipment_id = equipment.Equipment_id
     INNER JOIN slip_record ON slip_record.slip_Payment_code_id = payment_code.Payment_code_id
    WHERE payment_code.statuse ='รอตรวจสอบ'AND payment_code.Payment_code_id= ${db.escape(id)} AND hotify_repaiv.Employee_id = ${db.escape(em_id)}`,
        (err, result_HR) => {
            if (err) throw err
            db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(em_id)};`,
                (err, result) => {
                    if (err) throw err;
                    const he_id = result_HR[0].Hotify_repaiv_id;
                    db.query(`SELECT * FROM air_parts WHERE  Hotify_repaiv_id =${db.escape(he_id)}`,
                        (err, result_AP) => {
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
                            return res.render('employees/slip_view', { result, result_HR, role, result_AP, sum });
                        })
                })
        });
});
// หน้า /slip_record/s /method get สำเร็จ
router.get('/slip_view2/s/:id', ifNotLoggedin, function(req, res, next) {
    const em_id = req.session.userID; //รหัสพนักงาน Employee_id
    const id = req.params.id
    console.log(id)
    const role = 2
    db.query(`SELECT * FROM payment_code INNER JOIN hotify_repaiv on hotify_repaiv.Payment_code_id = payment_code.Payment_code_id
    INNER JOIN equipment ON hotify_repaiv.Equipment_id = equipment.Equipment_id
     INNER JOIN slip_record ON slip_record.slip_Payment_code_id = payment_code.Payment_code_id
    WHERE payment_code.statuse ='สำเร็จ'AND payment_code.Payment_code_id= ${db.escape(id)} AND hotify_repaiv.Employee_id = ${db.escape(em_id)}`,
        (err, result_HR) => {
            if (err) throw err
            db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(em_id)};`,
                (err, result) => {
                    if (err) throw err;
                    const he_id = result_HR[0].Hotify_repaiv_id;
                    db.query(`SELECT * FROM air_parts WHERE  Hotify_repaiv_id =${db.escape(he_id)}`,
                        (err, result_AP) => {
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
                            return res.render('employees/slip_view', { result, result_HR, role, result_AP, sum });
                        })
                })
        });
});
router.get('/slip_views/s/:id', ifNotLoggedin, function(req, res, next) {
    const em_id = req.session.userID; //รหัสพนักงาน Employee_id
    const id = req.params.id
    const role = 2
    db.query(`SELECT * FROM payment_code INNER JOIN hotify_repaiv on hotify_repaiv.Payment_code_id = payment_code.Payment_code_id
    INNER JOIN equipment ON hotify_repaiv.Equipment_id = equipment.Equipment_id
     INNER JOIN slip_record ON slip_record.slip_Payment_code_id = payment_code.Payment_code_id
    WHERE hotify_repaiv.Employee_id = ${db.escape(em_id)} AND payment_code.statuse ='รอตรวจสอบ`,
        (err, result_HR) => {
            if (err) throw err
            db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(em_id)};`,
                (err, result) => {
                    if (err) throw err;
                    const he_id = result_HR[0].Hotify_repaiv_id;
                    db.query(`SELECT * FROM air_parts WHERE  Hotify_repaiv_id =${db.escape(he_id)}`,
                        (err, result_AP) => {
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
                            return res.render('employees/slip_view', { result, result_HR, role, result_AP, sum });
                        })
                })
        });
});
router.get('/air_parts/s/:id', ifNotLoggedin, function(req, res, next) {
    const em_id = req.session.userID; //รหัสพนักงาน Employee_id
    const Ad_id = req.params.id
    const role = 2
    db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(em_id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                db.query(`SELECT * FROM appointment INNER JOIN hotify_repaiv on hotify_repaiv.Hotify_repaiv_id = appointment.Hotify_repaiv_id
                INNER JOIN equipment ON hotify_repaiv.Equipment_id = equipment.Equipment_id
                WHERE appointment.Appointment_date_id =${db.escape(Ad_id)}`,

                    (err, result_HR) => {
                        if (err) throw err
                        const he_id = result_HR[0].Hotify_repaiv_id;
                        db.query(`SELECT * FROM air_parts WHERE  Hotify_repaiv_id =${db.escape(he_id)}`,
                            (err, result_AP) => {
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

                                return res.render('employees/air_parts', { result, result_HR, result_AP, sum, role });
                            })
                    })
            }
        });

});
router.get('/air_parts/del/:id/:id2', ifNotLoggedin, function(req, res, next) {
    const ap_id = req.params.id
    const id = req.params.id2
    db.query(`DELETE FROM air_parts WHERE ap_id = ${db.escape(ap_id)}`, (err, results) => {
        if (err) throw err
        res.redirect(`/employees/air_parts/s/${id}`);
    })
})


router.post('/air_part/s',
    function(req, res, next) {
        const ap_air_parts = req.body.ap_air_parts;
        const ap_quantity = req.body.ap_quantity;
        const ap_price = req.body.ap_price;
        const Hotify_repaiv_id = req.body.Hotify_repaiv_id;

        db.query('INSERT INTO air_parts (ap_air_parts,ap_quantity,ap_price,Hotify_repaiv_id) VALUES(?,?,?,?)', [ap_air_parts, ap_quantity, ap_price, Hotify_repaiv_id], (error, results, fields) => {
            if (error) throw error;
        })
        db.query(`SELECT Appointment_date_id from appointment WHERE Hotify_repaiv_id = ${Hotify_repaiv_id}`,
            (err, result) => {
                if (err) throw err
                const Ad_id = result[0].Appointment_date_id;
                res.redirect(`/employees/air_parts/s/${Ad_id}`)
            })
    }
);
router.get('/service/s', ifNotLoggedin, function(req, res, next) {
    const role = 2
    const em_id = req.session.userID; //รหัสพนักงาน Employee_id
    db.query(`SELECT * FROM employee WHERE Employee_id = ${db.escape(em_id)};`,
        (err, result) => {
            db.query(`SELECT * FROM payment_code INNER JOIN hotify_repaiv on hotify_repaiv.Payment_code_id = payment_code.Payment_code_id
            INNER JOIN equipment ON hotify_repaiv.Equipment_id = equipment.Equipment_id
            WHERE hotify_repaiv.Employee_id = ${db.escape(em_id)} AND payment_code.statuse ='สำเร็จ'`,

                (err, result_HR) => {
                    return res.render('employees/view_service', { role, result, result_HR })
                })
        })
})

/* POST employee */
/* POST employee */
/* POST employee */

// เพิ่ม register employee /method post
router.post('/register', upload.single("inputEmPhoto"),

    [
        check('inputEmName', 'กรอก ชื่อ').not().isEmpty(),
        check('inputEmPassword', 'กรอก รหัสผ่าน').not().isEmpty(),
        check('inputEmPhone', 'กรอก เบอร์โทร').not().isEmpty(),
        check('inputEmAddress', 'กรอกที่อยู่').not().isEmpty(),
        check('inputEmlgbt', 'เลือกเพศ').not().isEmpty(),
        check('inputEmail', 'กรอก E-mail').not().isEmpty(),


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

            return res.render('logins', { error: false, data: results, message: "create success" })

        })


    }
);

// เพิ่ม re_equipment equipment /method post
router.post('/re_equipment', ifNotLoggedin, Rqupload.single("EqPhoto"), [
        check('inputEquipment_name', 'ใส่ ยี่ห้อ').not().isEmpty(),
        check('Device_details', 'ใส่ รายละเอียดอุปกรณ์').not().isEmpty(),
        check('Equipmentnum', 'ใส่จำนวน อุปกรณ์ ').not().isEmpty(),
        check('Price', 'ใส่ ราคา').not().isEmpty(),
    ],
    function(req, res, next) {
        const results = validationResult(req);
        var errors = results.errors;
        const Equipment_name = req.body.inputEquipment_name;
        const Device_details = req.body.Device_details;
        const Equipmentnum = req.body.Equipmentnum;
        const Price = req.body.Price;
        const EqPhoto = req.file.filename
        db.query('INSERT INTO equipment (Equipment_name,Device_details,Equipmentnum,Price,Eq_image) VALUES(?,?,?,?,?)', [Equipment_name, Device_details, Equipmentnum, Price, EqPhoto], (error, results, fields) => {
            if (error) throw error;
            res.redirect('/employees/equipment/s')
        })
    });

// ลบ equipment อุปกรณ์ /method get
router.get('/de_equipment/s/:id', ifNotLoggedin, function(req, res, next) {
    const id = req.params.id;
    db.query(`DELETE FROM equipment WHERE Equipment_id = ${db.escape(id) }`, (err, results) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/employees/equipment/s')
        }
    });

});
// แก้ไข equipment อุปกรณ์ /method post
router.post('/equipment/s', ifNotLoggedin, function(req, res, next) {
    const Eqid = req.body.Equipment_id
    const Equipment_name = req.body.inputEquipment_name;
    const Device_details = req.body.Device_details;
    const Equipmentnum = req.body.Equipmentnum;
    const Price = req.body.Price;

    db.query(`UPDATE equipment set Equipment_name = ? , Device_details = ? , Equipmentnum = ? , Price = ? WHERE Equipment_id = '${Eqid}'`, [Equipment_name, Device_details, Equipmentnum, Price], (error, results, fields) => {
        if (error) {
            console.log(error)
        } else {
            res.redirect('/employees/equipment/s')

        }
    });
});

router.post('/repair_record', ifNotLoggedin,

    function(req, res, next) {
        const results = validationResult(req);
        var errors = results.errors;
        const Hotify_repaiv_id = req.body.Hotify_repaiv_id;
        const Employee_id = req.session.userID;
        const Repair_notice_date = req.body.Repair_notice_date;
        const Amdate = req.body.Date;
        // แปลง วัน/เดือน/ปี 
        let today = new Date(Amdate).toLocaleDateString();

        const Appoint_ment_date = today.toLocaleString("th-TH", );
        console.log(Appoint_ment_date)
        db.query('INSERT INTO appointment ( Hotify_repaiv_id, Employee_id, Repair_notice_date,Appoint_ment_date) VALUES(?,?,?,?)', [Hotify_repaiv_id, Employee_id, Repair_notice_date, Appoint_ment_date], (error, results, fields) => {
            if (error) throw error;
            db.query(`UPDATE hotify_repaiv SET Appointmentdate = "${(Appoint_ment_date)}", Employee_id = "${(Employee_id)}"WHERE Hotify_repaiv_id = ${db.escape(Hotify_repaiv_id) }`)
            res.redirect('/employees')

        })

    });
router.post('/confirm_repair', ifNotLoggedin,
    function(req, res, next) {
        const Hotify_repaiv_id = req.body.Hotify_repaiv_id;
        const now = new Date();
        const Equipment_num = 'ว่าง'
        const Repair_cost = req.body.Price;
        const status = req.body.status;
        const em_id = req.session.userID;
        const Repair_date = date.format(now, 'DD/MM/YYYY HH:mm');
        console.log(Repair_date)
        db.query('INSERT INTO payment_code ( Hotify_repaiv_id, Repair_date, Equipment_num,Repair_cost,statuse) VALUES(?,?,?,?,?)', [Hotify_repaiv_id, Repair_date, Equipment_num, Repair_cost, status], (error, results, fields) => {
            if (error) throw error;

            db.query(`SELECT Payment_code_id FROM payment_code WHERE Hotify_repaiv_id = ${db.escape(Hotify_repaiv_id) };`,
                (err, result) => {
                    if (err) throw err;
                    db.query(
                        `UPDATE hotify_repaiv SET Payment_code_id = '${result[0].Payment_code_id}' WHERE Hotify_repaiv_id = '${Hotify_repaiv_id}'`
                    );
                })

        });
        res.redirect('view_appointment/s');
    });
router.post('/up_statuse/s', ifNotLoggedin,
        function(req, res, next) {
            const id = req.body.Payment_code_id
            console.log(id)
            const statuse = "สำเร็จ";
            db.query(`UPDATE payment_code SET statuse = "${statuse}" WHERE Payment_code_id = ${id};`,
                (err, result) => {
                    if (err) throw err
                    res.redirect('/employees/slip_record/s');
                }
            )
        })
    // res.redirect('view_appointment/s');


// edit profile /employees
router.post('/profile_employees/edit', ifNotLoggedin, function(req, res, next) {
    const employees_id = req.session.userID;
    const Employee_name = req.body.Employee_name;
    const Employee_email = req.body.Employee_email;
    const Employee_phone = req.body.Employee_phone;
    const Employee_address = req.body.Employee_address;
    const Employee_lgbt = req.body.Employee_lgbt
    db.query(`UPDATE employee set Employee_name = ? , Employee_email = ? , Employee_phone = ? , Employee_address = ? ,Employee_lgbt  = ?
     WHERE Employee_id = '${employees_id}'`, [Employee_name, Employee_email, Employee_phone, Employee_address, Employee_lgbt], (err, res, fields) => {
        if (err) throw err;


    })
    db.query(`UPDATE email_pass set  Employee_email = ?
    WHERE Employee_id = '${Employee_email}'`, [Employee_email], (err, res, fields) => {

    })
    res.redirect('/employees/emProfiles');
});

module.exports = router;