var express = require('express');
var router = express.Router();
const db = require('../lib/connect.js')
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const date = require('date-and-time')
var multer = require('multer');
const {
    check,
    validationResult
} = require('express-validator');
const ifNotLoggedin = (req, res, next) => {
        if (!req.session.isLoggedIn) {
            return res.render('logins');
        }
        next();
    }
    /* GET users listing. */
router.get('/', ifNotLoggedin, function(req, res, next) {
    const id = req.session.userID;
    const role = 1;
    db.query(`SELECT * FROM users WHERE User_id = ${db.escape(id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                db.query(`SELECT * FROM equipment`,
                    (err, result_eq) => {
                        if (err) {
                            console.log(err)
                        }
                        return res.render('users/user', { result, result_eq, role, session });
                    })
            }
        })
})
router.get('/homepage/s', ifNotLoggedin, function(req, res, next) {
    const id = req.session.userID;
    const role = 1;
    db.query(`SELECT * FROM users WHERE User_id = ${db.escape(id)};`,
        (err, result) => {
            return res.render('users/homepage', { result, role, });

        })
})

router.get('/useProfiles', ifNotLoggedin, function(req, res, next) {
    const id = req.session.userID;
    db.query(`SELECT * FROM users WHERE User_id = ${db.escape(id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                const role = 1;
                return res.render('users/useProfile', { result, role });
            }

        })
})
router.get('/notify_repair/s/:Eq_id', ifNotLoggedin, function(req, res, next) {
    const use_id = req.session.userID;
    const Eq_id = req.params.Eq_id;
    const role = 1;
    // const result = use_id;
    // console.log(result)
    db.query(`SELECT * FROM users WHERE User_id = ${db.escape(use_id)};`,
        (err, result) => {
            db.query(`SELECT * FROM equipment WHERE Equipment_id = ${db.escape(Eq_id)};`,
                (err, result_eq) => {
                    if (err) {
                        console.log(err)
                    }
                    return res.render('users/notify_repair', { result, result_eq, role });
                })
        })

})

router.get('/register/s', function(req, res, next) {
    res.render('users/register');
});
router.get('/appointment/s/', ifNotLoggedin,
    function(req, res, next) {
        const id = req.session.userID;
        const role = 1;
        db.query(`SELECT *
    FROM hotify_repaiv INNER JOIN equipment ON hotify_repaiv.Equipment_id = equipment.Equipment_id
    WHERE User_id =  ${db.escape(id)} and Payment_code_id IS null `,
            (err, result_hv) => {
                if (err) {
                    console.log(err)
                }

                db.query(`SELECT * FROM users WHERE User_id = ${db.escape(id)};`,
                    (err, result) => {
                        console.log(result_hv)
                        return res.render('users/appointment', { result, result_hv, role });
                    })
            })
    });
// หน้า view_expend /method get
router.get('/view_expend/s', ifNotLoggedin, function(req, res, next) {
    const use_id = req.session.userID; //รหัส User_id:
    db.query(`SELECT * FROM users WHERE User_id = ${db.escape(use_id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                db.query(`SELECT * FROM appointment INNER JOIN hotify_repaiv on hotify_repaiv.Hotify_repaiv_id = appointment.Hotify_repaiv_id
                INNER JOIN equipment ON hotify_repaiv.Equipment_id = equipment.Equipment_id
                INNER JOIN payment_code ON hotify_repaiv.Hotify_repaiv_id = payment_code.Hotify_repaiv_id
                WHERE hotify_repaiv.User_id = '${db.escape(use_id)}' AND payment_code.statuse ='ค้างชำระ' OR payment_code.statuse ='รอตรวจสอบ'`,

                    (err, result_HR) => {
                        if (err) {}
                        const role = 1; //role พนักงาน
                        return res.render('users/view_expend', { result, result_HR, role });

                    })
            }
        });
});
// หน้า page_payment /method get
router.get('/page_payment/s', ifNotLoggedin, function(req, res, next) {
    const use_id = req.session.userID; //รหัส User_id:
    db.query(`SELECT * FROM users WHERE User_id = ${db.escape(use_id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                db.query(`SELECT * FROM appointment INNER JOIN hotify_repaiv on hotify_repaiv.Hotify_repaiv_id = appointment.Hotify_repaiv_id
                INNER JOIN equipment ON hotify_repaiv.Equipment_id = equipment.Equipment_id
                INNER JOIN payment_code ON hotify_repaiv.Hotify_repaiv_id = payment_code.Hotify_repaiv_id
                WHERE hotify_repaiv.User_id = '${db.escape(use_id)}' AND payment_code.statuse ='สำเร็จ' `,

                    (err, result_HR) => {
                        if (err) {}
                        const role = 1; //role พนักงาน
                        return res.render('users/page_payment', { result, result_HR, role });
                    })
            }
        });
});
// หน้า confirm_repair /method get
router.get('/confirm_repair/s/:id', ifNotLoggedin, function(req, res, next) {
    const id = req.params.id; //รหัสวันนัดหมาย Appointment_date_id
    const use_id = req.session.userID; //รหัสพนักงาน Employee_id
    db.query(`SELECT * FROM users WHERE User_id = ${db.escape(use_id)};`,
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                db.query(`SELECT * FROM appointment INNER JOIN hotify_repaiv on hotify_repaiv.Hotify_repaiv_id = appointment.Hotify_repaiv_id
                INNER JOIN equipment ON hotify_repaiv.Equipment_id = equipment.Equipment_id
                INNER JOIN payment_code ON hotify_repaiv.Hotify_repaiv_id = payment_code.Hotify_repaiv_id
                WHERE hotify_repaiv.Hotify_repaiv_id =${db.escape(id)}`,
                    (err, result_HR) => {
                        if (err) throw err
                        const role = 1; //role พนักงาน
                        const date = new Date().toLocaleString("th-TH");

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
                                let sum = 0; //รวมยอด
                                for (let i = 0; i < number.length; i++) {
                                    sum += number[i]
                                }

                                return res.render('users/confirm_repair', { result, result_HR, result_AP, sum, role, date });
                            })


                    })
            }
        })
});
// ส่ง slip_
router.get('/slip_record/s/:id', ifNotLoggedin, function(req, res, next) {
    const use_id = req.session.userID
    const Payment_code_id = req.params.id
    const role = 1;
    db.query(`SELECT * FROM users WHERE User_id = ${db.escape(use_id)};`,
        (err, result) => {
            if (err) throw err;
            db.query(`SELECT hotify_repaiv.User_id ,hotify_repaiv.Payment_code_id,hotify_repaiv.Employee_id,hotify_repaiv.Equipment_id,hotify_repaiv.Hotify_repaiv_id,appointment.Appointment_date_id
            FROM hotify_repaiv INNER JOIN appointment on appointment.Hotify_repaiv_id = hotify_repaiv.Hotify_repaiv_id
          WHERE hotify_repaiv.User_id = ${db.escape(use_id)} and hotify_repaiv.Payment_code_id=${db.escape(Payment_code_id)}`,
                (err, result_all) => {
                    if (err) throw err;
                    console.log(result_all)
                    return res.render('users/slip_record', { result, result_all, role });
                })

        });
});
// เพิ่ม Users
router.post('/register', [
        check('inputName', 'กรอก ชื่อ').not().isEmpty(),
        check('inputPassword', 'กรอก รหัสผ่าน ').not().isEmpty(),
        check('inputPhone', 'กรอก เบอร์โทร ').not().isEmpty(),
        check('inputEmail', 'กรอก E-mail').not().isEmpty(),
        check('inputAddress', 'กรอก ที่อยู่').not().isEmpty(),

    ],
    function(req, res, next) {
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
        db.query('INSERT INTO email_pass (email,password,role) VALUES(?,?,?)', [Email, Passwordhash, role], (error, results, fields) => {
            if (error) throw error;
        })
        db.query('INSERT INTO users (User_name,User_password,User_phone,User_email,User_address) VALUES(?,?,?,?,?)', [Name, Passwordhash, Phone, Email, Address], (error, results, fields) => {
            if (error) throw error;

            return res.render('logins', { error: false, data: results, message: "create success" })

        })
    }
);

router.post('/notify_repair/s', ifNotLoggedin, function(req, res, next) {
    const use_id = req.session.userID;
    const Eq_id = req.body.Equipment_id;
    const Rdn = req.body.Repair_details_num;
    const now = new Date();
    const dateTH = date.format(now, 'DD/MM/YYYY HH:mm');
    const hr_parish = req.body.hr_parish; //ตำบล 
    const hr_district = req.body.hr_district; //อำเภอ  
    const hr_province = req.body.hr_province; //จังหวัด  
    const hr_contactnum = req.body.hr_contactnum; //เบอร์โทร ติดต่อ 

    db.query(`INSERT INTO hotify_repaiv (Equipment_id,User_id ,Repair_details_num ,Repair_noticedate,hr_parish,hr_district,hr_province,hr_contactnum) VALUES(?,?,?,?,?,?,?,?)`, [Eq_id, use_id, Rdn, dateTH, hr_parish, hr_district, hr_province, hr_contactnum], (error, results, fields) => {
        if (error) throw error;
        res.redirect('/users', );

    })

})
const QRCode = require('qrcode')
const generatePayload = require('promptpay-qr')
const _ = require('lodash');
const session = require('express-session');


router.post('/generateQR', ifNotLoggedin, (req, res) => {
    const amount = parseFloat(_.get(req, ["body", "amount"]));
    const mobileNumber = '0644580471';
    const payload = generatePayload(mobileNumber, { amount });
    const option = {
        color: {
            dark: '#000',
            light: '#fff'
        }
    }
    QRCode.toDataURL(payload, option, (err, url) => {
        if (err) {
            console.log('generate fail')
            return res.status(400).json({
                RespCode: 400,
                RespMessage: 'bad : ' + err
            })
        } else {
            return res.status(200).json({
                RespCode: 200,
                RespMessage: 'good',
                Result: url

            })
        }

    })
})

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/slip_Photo');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + ".jpg");
    }
});

var upload = multer({
    storage: storage
});

router.post('/slip_record/s', upload.single("slip_Photo"), ifNotLoggedin,
    function(req, res, next) {
        const slip_Photo = req.file.filename
        const slip_User_id = req.body.slip_User_id
        const slip_Payment_code_id = req.body.slip_Payment_code_id
        const slip_Employee_id = req.body.slip_Employee_id
        const slip_Equipment_id = req.body.slip_Equipment_id
        const slip_Hotify_repaiv_id = req.body.slip_Hotify_repaiv_id
        const slip_Appointment_date_id = req.body.slip_Appointment_date_id
        const statuse = "รอตรวจสอบ"
        console.log(slip_Appointment_date_id)
        db.query('INSERT INTO slip_record (slip_Payment_code_id,slip_User_id,slip_Equipment_id,slip_Hotify_repaiv_id,slip_Employee_id,slip_Appointment_date_id,slip) VALUES(?,?,?,?,?,?,?)', [slip_Payment_code_id, slip_User_id, slip_Equipment_id, slip_Hotify_repaiv_id, slip_Employee_id, slip_Appointment_date_id, slip_Photo], (error, results, fields) => {
            if (error) throw error;
            db.query(
                `UPDATE payment_code SET statuse ='${statuse}' WHERE Payment_code_id = '${slip_Payment_code_id}'`
            );
            res.redirect('/users/view_expend/s')
        })

    });
// edit profile /User
router.post('/profile_user/edit', ifNotLoggedin, function(req, res, next) {

    const User_id = req.session.userID;
    const email = req.body.email;
    const User_name = req.body.User_name;
    const User_email = req.body.User_email;
    const User_phone = req.body.User_phone;
    const User_address = req.body.User_address;

    db.query(`UPDATE users set User_name = ? , User_email = ? , User_phone = ? , User_address = ? WHERE User_id = '${User_id}'`, [User_name, User_email, User_phone, User_address], (err, res, fields) => {
        if (err) throw err

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
            res.redirect(`/users/useProfiles`)
        });
});
module.exports = router;