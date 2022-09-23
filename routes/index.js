var express = require('express');
var router = express.Router();
const db = require('../lib/connect')
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const JWT_SECRET =
    "goK!pusp6ThEdURUtRenOwUhAsWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu";
// DECLARING CUSTOM MIDDLEWARE
const ifNotLoggedin = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.render('logins');
    }
    next();
}
const ifLoggedin = (req, res, next) => {
        if (req.session.isLoggedIn) {
            return res.redirect('/users/');
        }
        next();
    }
    /* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
router.get('/login', function(req, res, next) {
    // var vr = con.query("SELECT * From user")
    res.render('logins');
});


router.post('/login', [
        check('email', 'ใส่ E-mail').not().isEmpty(),
        check('password', 'ใส่ Password').not().isEmpty(),
    ],
    function(req, res, next) {
        const result = validationResult(req);
        var errors = result.errors;
        var email = req.body.email;
        var password = req.body.password;
        if (!result.isEmpty()) {
            res.render('logins', {
                errors: errors
            })
            return res.status(400).send({ error: true, message: "Please provide user username and password." });
        }
        if (email || password) {
            db.query(`SELECT * FROM email_pass WHERE email = ${db.escape(email)};`,
                (err, result) => {
                    // user does not exists
                    if (err) {
                        throw err;
                        return res.status(400).send({
                            msg: err
                        });
                    }

                    if (!result.length) {
                        console.log(!result.length, 'check')
                        const mailers = "Email ไม่ถูกต้อง"
                        return res.render('logins', {
                            mailers

                        }, console.log(mailers));

                        // res.status(401).send({
                        //   msg: 'Email is incorrect!_1'

                        // });
                    }
                    // check password
                    bcrypt.compare(req.body.password, result[0].password,
                        // console.log(result[0]),
                        (bErr, bResult) => {
                            // wrong password
                            if (bErr) {
                                throw bErr;
                                return res.status(401).send({
                                    msg: 'Email or password is incorrect!_2'
                                });
                            }
                            if (bResult === false) {
                                const mailers = "Password ไม่ถูกต้อง"
                                return res.render('logins', {
                                    mailers
                                })
                            }
                            if (bResult === true) {
                                if (result[0].role === 1) {
                                    db.query(`SELECT * FROM users WHERE User_email = ${db.escape(email)};`,
                                        (err, result) => {
                                            token = jwt.sign({ id: result[0].User_id }, JWT_SECRET, { expiresIn: '1h' });
                                            db.query(
                                                `UPDATE users SET last_login = now() WHERE User_id = '${result[0].User_id}'`,
                                            );
                                            db.query(`SELECT * FROM equipment`,
                                                (err, result_eq) => {
                                                    if (err) {
                                                        console.log(err)
                                                    } else {
                                                        req.session.isLoggedIn = true;
                                                        req.session.userID = result[0].User_id;
                                                        res.redirect('users');
                                                    }

                                                })

                                        }
                                    )
                                }
                                if (result[0].role === 2) {
                                    db.query(`SELECT * FROM employee WHERE Employee_email = ${db.escape(email)};`,
                                        (err, result) => {
                                            token = jwt.sign({ id: result[0].Employee_id }, JWT_SECRET, { expiresIn: '1h' });
                                            db.query(
                                                `UPDATE employee SET Employee_login = now() WHERE Employee_id = '${result[0].Employee_id}'`
                                            );
                                            req.session.isLoggedIn = true;
                                            req.session.userID = result[0].Employee_id;
                                            res.redirect('employees');
                                        }

                                    )
                                }
                                if (result[0].role === 3) {
                                    const role = result[0].role
                                    db.query(`SELECT * FROM employee WHERE Employee_email = ${db.escape(email)};`,
                                        (err, result) => {
                                            token = jwt.sign({ id: result[0].Employee_id }, JWT_SECRET, { expiresIn: '1h' });
                                            db.query(
                                                `UPDATE employee SET Employee_login = now() WHERE Employee_id = '${result[0].Employee_id}'`
                                            );
                                            db.query(`SELECT * FROM equipment`,
                                                (err, result_eq) => {
                                                    return res.render('admins/admin_equipment', {
                                                        token,
                                                        result,
                                                        result_eq,
                                                        role
                                                    })
                                                });
                                        }

                                    )
                                }

                            }

                        }

                    );
                }


            )

        }
    })



router.get('/logout', function(req, res, next) {
        console.log(req.session)
        req.session = null;
        res.redirect('/');

    })
    // app.get('/logout',(req,res) => {
    //     req.session.destroy();
    //     res.redirect('/');
    // });

module.exports = router;