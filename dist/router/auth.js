"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const pbkdf2Password = require("pbkdf2-password");
const passport = require("passport");
const fs = require("fs");
const mkdirp = require("mkdirp");
const request = require("request");
const config_1 = require("../configure/config");
const html_service_1 = require("../service/html-service");
let LocalStrategy = require("passport-local");
let FaceboockStrategy = require("passport-facebook");
let router = express.Router();
let hasher = pbkdf2Password();
let mysql = require('mysql');
let jwt = require('jsonwebtoken');
module.exports = function (app) {
    let config = new config_1.ServerConfig();
    let path = require('path');
    router.use(function timeLog(req, res, next) {
        console.log('Time', Date.now());
        next();
    });
    router.get("con");
    router.post("/local/register", (req, res) => {
        hasher({ password: req.body.password }, (err, pass, salt, hash) => {
	console.log(req.body);
            let user = {
                idEXPERT_USER: undefined,
                email: req.body.email,
                password: hash,
                name: req.body.username,
                birth: new Date(req.body.birthday),
                phone: req.body.phone,
                idJOBS: req.body.job,
                idDEPT: req.body.dept,
                password_q: req.body.password_q,
                password_a: req.body.password_a,
                status: 0,
                license_path: '',
                join_date: null,
                last_login_date: '',
                salt: salt,
            };
            let insertUser_Q = 'INSERT INTO EXPERT_USER SET ?';
            app.conn.query(insertUser_Q, user, (err, result) => {
                console.log(new Date(req.body.birthday).toDateString());
                if (err) {
                    console.log(err);
                    res.status(500);
                }
                else {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        let userId = result.insertId;
                        let name = "license_img";
                        let lic_path = path.join(config.fileStoragePath, "userfiles", userId.toString());
                        let file = req.files.license;
                        let opt = [
                            config.fullDomain + '/img/dmhc_logo',
                            user.name,
                            user.name,
                            user.email,
                            user.phone,
                            req.body.jobName,
                            req.body.deptName,
                            config.fullDomain + '/img' + '/' + userId.toString() + '/license_img',
                            config.fullDomain + '/auth' + '/local' + '/confirm/' + userId.toString(),
                        ];
                        if (!fs.existsSync(lic_path)) {
                            mkdirp(lic_path, (err) => {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    file.mv(path.join(lic_path, name), (err) => {
                                        if (err) {
                                            return res.status(500).send(err);
                                        }
                                        else {
                                            let html = new html_service_1.HTMLtoStringService(user.name + '님께서 가입신청을 하셨습니다.');
                                            html.getConfirmEmailString2('./assets/mail-schematic/reg-confirm.html', opt);
                                            res.status(200).send('Success');
                                        }
                                    });
                                }
                            });
                        }
                    }
                }
            });
        });
    });
    router.get("/local/confirm/:userId", (req, res) => {
        let id = req.params.userId;
        let query = 'UPDATE EXPERT_USER SET status = 1 ' +
            ' WHERE idEXPERT_USER = ' + mysql.escape(id) + '; ';
        app.conn.query(query, (err, result) => {
            request(config.fullDomain + '/data/users/' + id, (err, Response, body) => {
                if (err) {
                    return res.status(303);
                }
                let html = new html_service_1.HTMLtoStringService('매일마음관리 가입신청이 승인되었습니다.', JSON.parse(body)[0].email);
                if (err) {
                    return res.status(500).send(err);
                }
                else {
                    let htmlOption = [
                        config.fullDomain + '/img' + '/dmhc_logo',
                        config.frontDomain,
                    ];
                    html.getConfirmEmailString2('./assets/mail-schematic/welcome.html', htmlOption);
                    return res.status(200).redirect(config.frontDomain + '/login-panel/confirm');
                }
            });
        });
    });
    router.delete("/local/drop/:userId", ensureAuthenticated, (req, res) => {
        let id = req.params.userId;
        let query = 'DELETE FROM EXPERT_USER ' +
            ' WHERE idEXPERT_USER = ' + mysql.escape(id);
        app.conn.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            else {
                return res.status(200).send('success');
            }
        });
    });
    router.get("/user", ensureAuthenticated, (req, res) => {
        if (req.isAuthenticated())
            return res.status(200).json(req.user);
        else
            return res.status(401).send('Fail');
    });
    router.post('/local', passport.authenticate('local', {
        successRedirect: '/api/auth/welcome',
        failureRedirect: '/api/auth/fail',
    }));
    router.get('/local', (req, res) => {
        if (req.isAuthenticated()) {
            res.status(200).send(true);
        }
        else {
            res.status(401).send(false);
        }
    });
    router.delete('/local', ensureAuthenticated, (req, res) => {
        req.logout();
        res.status(200).send(null);
    });
    router.get('/welcome', ensureAuthenticated, (req, res) => {
        let Q1 = 'UPDATE EXPERT_USER SET LAST_LOGIN_DATE=now()' +
            ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER) + '; ';
        app.conn.query(Q1, (err1, result1) => {
            if (err1) {
                res.status(500).send('fail');
            }
            else {
                let Q2 = ' SELECT status FROM EXPERT_USER '
                    + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER) + '; ';
                app.conn.query(Q2, (err2, result2) => {
                    if (err2) {
                        res.status(500).send(err2);
                        console.log(Q2);
                        console.log(result2);
                    }
                    else {
                        if (result2[0].status === 0) {
                            res.status(402).send('need-confirm');
                        }
                        else {
                            res.status(200).send('success');
                        }
                    }
                });
            }
        });
    });
    router.get('/fail', (req, res) => {
        res.status(401).send('fail');
    });
    router.delete('/', ensureAuthenticated, (req, res, next) => {
        req.session.destroy(() => {
            res.status(300).send('Log-Out');
        });
    });
    router.get('/check', (req, res, next) => {
        if (req.isAuthenticated()) {
            return res.status(300).send('Loged-in');
        }
        else
            return res.status(401).send('Not Loged-in');
    });
    router.get("/user", (req, res) => {
        req.logout();
        req.session.save(() => {
            res.send("local log-out");
        });
    });
    router.put("/user/email", ensureAuthenticated, (req, res) => {
        let Q1 = ' SELECT email, password, salt FROM EXPERT_USER '
            + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER);
        app.conn.query(Q1, (err1, result1) => {
            if (err1) {
                console.log(err1);
                console.log(Q1);
                res.status(500).send(err1);
            }
            else {
                let hashInfo = { password: req.body.password, salt: result1[0].salt };
                hasher(hashInfo, (err, pass, salt, hash) => {
                    if (hash === result1[0].password) {
                        let Q2 = ' UPDATE EXPERT_USER '
                            + 'SET email = ' + mysql.escape(req.body.email);
                        app.conn.query(Q2, (err2, result2) => {
                            if (err2)
                                res.status(500).send(err1);
                            else
                                res.status(200).send(result2);
                        });
                    }
                    else {
                        res.status(401).send(err1);
                    }
                });
            }
        });
    });
    router.put("/user/phone", ensureAuthenticated, (req, res) => {
        let Q1 = ' SELECT phone, password, salt FROM EXPERT_USER '
            + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER);
        app.conn.query(Q1, (err1, result1) => {
            if (err1) {
                console.log(err1);
                console.log(Q1);
                res.status(500).send(err1);
            }
            else {
                let hashInfo = { password: req.body.password, salt: result1[0].salt };
                hasher(hashInfo, (err, pass, salt, hash) => {
                    if (hash === result1[0].password) {
                        let Q2 = ' UPDATE EXPERT_USER '
                            + ' SET phone = ' + mysql.escape(req.body.phone)
                            + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER);
                        app.conn.query(Q2, (err2, result2) => {
                            if (err2)
                                res.status(500).send(err1);
                            else
                                res.status(200).send(result2);
                        });
                    }
                    else {
                        res.status(401).send(err1);
                    }
                });
            }
        });
    });
    router.put("/user/dept", ensureAuthenticated, (req, res) => {
        let Q1 = ' SELECT idDEPT, password, salt FROM EXPERT_USER '
            + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER);
        app.conn.query(Q1, (err1, result1) => {
            if (err1) {
                console.log(err1);
                console.log(Q1);
                res.status(500).send(err1);
            }
            else {
                let hashInfo = { password: req.body.password, salt: result1[0].salt };
                hasher(hashInfo, (err, pass, salt, hash) => {
                    if (hash === result1[0].password) {
                        let Q2 = ' UPDATE EXPERT_USER '
                            + 'SET idDEPT = ' + mysql.escape(req.body.dept);
                        app.conn.query(Q2, (err2, result2) => {
                            if (err2)
                                res.status(500).send(err1);
                            else
                                res.status(200).send(result2);
                        });
                    }
                    else {
                        res.status(401).send(err1);
                    }
                });
            }
        });
    });
    router.put("/user/job", ensureAuthenticated, (req, res) => {
        let file = req.files.license;
        let toJob = req.body.job;
        let toJobName = req.body.jobName;
        let lic_path = path.join(config.fileStoragePath, "userfiles", req.user.idEXPERT_USER.toString());
        let Q1 = ' SELECT '
            + ' idEXPERT_USER, '
            + ' EXPERT_USER.email, '
            + ' EXPERT_USER.name, '
            + ' EXPERT_USER.password, '
            + ' EXPERT_USER.salt, '
            + ' JOBS.name as job, '
            + ' DEPT.name as dept '
            + ' FROM DMHC.EXPERT_USER '
            + ' left join JOBS ON EXPERT_USER.idJOBS = JOBS.idJOBS '
            + ' left JOIN DEPT ON EXPERT_USER.idDEPT = DEPT.idDEPT '
            + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER);
        app.conn.query(Q1, (err1, result1) => {
            let user = result1[0];
            let hashInfo = { password: req.body.password, salt: user.salt };
            hasher(hashInfo, (err, pass, salt, hash) => {
                if (hash === user.password) {
                    file.mv(path.join(lic_path, 'license_img.tmp'), (err) => {
                        if (err)
                            res.status(500).send(err);
                        else {
                            let html = new html_service_1.HTMLtoStringService(user.name + ' 님께서 직종 변경을 요청하셨습니다.');
                            let opt = [
                                config.fullDomain + '/img/dmhc_logo',
                                user.name,
                                user.email,
                                user.job,
                                toJobName,
                                user.dept,
                                config.fullDomain + '/img' + '/' + user.idEXPERT_USER.toString() + '/license.tmp',
                                config.fullDomain + '/auth' + '/job' + '/confirm/' + user.idEXPERT_USER.toString() + '/' + toJob,
                            ];
                            html.getConfirmEmailString2('./assets/mail-schematic/change-job.html', opt);
                            res.status(200).send(err);
                        }
                    });
                }
                else
                    res.status(401).send(err1);
            });
        });
    });
    router.get("/job/confirm/:idEXPERT_USER/:idJOBS", ensureAuthenticated, (req, res) => {
        let Q1 = ' SELECT email FROM EXPERT_USER '
            + ' WHERE idEXPERT_USER = ' + mysql.escape(req.params.idEXPERT_USER);
        app.conn.query(Q1, (err1, result1) => {
            if (err1)
                res.status(500).send(err1);
            else {
                let email = result1[0].email;
                let Q2 = ' UPDATE EXPERT_USER '
                    + ' SET idJOBS = ' + mysql.escape(req.params.idJOBS);
                +' WHERE idEXPERT_USER = ' + mysql.escape(req.params.idEXPERT_USER);
                app.conn.query(Q2, (err2, result2) => {
                    if (err2)
                        res.status(500).send(err2);
                    else {
                        let html = new html_service_1.HTMLtoStringService('매일마음관리 직종변경 신청이 승인되었습니다.', email);
                        let opt = [
                            config.fullDomain + '/img/dmhc_logo',
                            config.frontDomain,
                        ];
                        html.getConfirmEmailString2('./assets/mail-schematic/confirm-job.html', opt);
                        res.status(200).redirect(config.frontDomain + '/login-panel/confirm/job');
                    }
                });
            }
        });
    });
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect(config.perpose + '/auth/fail');
    }
    return router;
};
