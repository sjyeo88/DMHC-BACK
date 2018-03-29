import * as express from "express";
import * as pbkdf2Password from "pbkdf2-password";
import * as moment from "moment";
import * as passport from "passport";
import * as session from "express-session";
import * as fs from "fs";
import * as mkdirp from 'mkdirp'

import request = require("request");

import { ServerConfig, setInputInterface } from "../configure/config"
import { UserDATA } from "../interfaces/userdata.interface"
import { HTMLtoStringService } from "../service/html-service"

let LocalStrategy  = require("passport-local")
let FaceboockStrategy = require("passport-facebook")
// let jwt = require("jwt-simple")

let router = express.Router();
let hasher:pbkdf2Password  = pbkdf2Password();
import fileUpload = require('express-fileupload')
let mysql = require('mysql');
let jwt = require('jsonwebtoken');



module.exports = function(app):express.Router{
//Need to adding type of 'app'
  let config = new ServerConfig();
  let path = require('path')

  router.use(function timeLog(req:express.Request,
                     res:express.Response,
                     next:express.NextFunction):void
    {
      console.log('Time', Date.now());
      next();
    }
  );

  router.get("con");

  router.post(
    "/local/register",
    (req:express.Request, res:express.Response) => {
      hasher({password:req.body.password},
             (err:string, pass:string, salt:string, hash:string) => {
                let user:UserDATA = {
                  idEXPERT_USER: undefined,
                  email: req.body.email,
                  password: hash,
                  name: req.body.username,
                  birth: new Date(req.body.birthday),
                  phone: req.body.phone,
                  idJOBS: req.body.job,
                  idDEPT: req.body.dept,
                  status: 0,
                  license_path: '',
                  join_date: null,
                  last_login_date: '',
                  salt: salt,
                };

                let insertUser_Q:string = 'INSERT INTO EXPERT_USER SET ?'
                app.conn.query(insertUser_Q, user, (err, result) =>
                  {
                    console.log(new Date(req.body.birthday).toDateString());
                    if(err){
                      console.log(err);
                      res.status(500);
                    } else {
                      if(err) {
                        console.log(err)
                      } else {
                        let userId= result.insertId;
                        let name= "license_img";
                        let lic_path= path.join(config.fileStoragePath, "userfiles", userId.toString())
                        let file = (req as any).files.license
                        let opt = [
                          config.fullDomain + '/img/dmhc_logo',
                          user.name,
                          user.name,
                          user.email,
                          user.phone,
                          req.body.jobName,
                          req.body.deptName,
                          config.fullDomain + '/img' + '/' + userId.toString() + '/license_img',
                          config.fullDomain + '/auth'+ '/local' + '/confirm/' + userId.toString(),
                        ]

                        if(!fs.existsSync(lic_path)) {
                            mkdirp(lic_path, (err) => {
                              if(err) {console.log(err)}
                              else {
                                file.mv(path.join(lic_path, name), (err)=>{
                                  if (err) {
                                    return res.status(500).send(err)
                                  }
                                  else {
                                    let html = new HTMLtoStringService(
                                      user.name + '님께서 가입신청을 하셨습니다.',
                                    )
                                    html.getConfirmEmailString2('./assets/mail-schematic/reg-confirm.html', opt)
                                    res.status(200).send('Success')
                                  }
                                });
                              }
                          })
                        }
                      }
                    }
                  })
      }) //end of hasher
  })

  router.get(
    "/local/confirm/:userId",
    (req:express.Request, res:express.Response) => {
      let id:string = req.params.userId
      let query:string = 'UPDATE EXPERT_USER SET status = 1 ' +
      ' WHERE idEXPERT_USER = ' + mysql.escape(id) + '; '
      app.conn.query(query, (err, result) => {
        request(config.fullDomain + '/data/users/' + id, (err, Response, body) => {
          if(err) {
            return res.status(303);
          }
          let html = new HTMLtoStringService(
            '매일마음관리 가입신청이 승인되었습니다.',
            JSON.parse(body)[0].email,
          )
          if(err) {
            return res.status(500).send(err)
          } else {
            let htmlOption = [
              config.fullDomain + '/img' + '/dmhc_logo',
              config.frontDomain,
            ]
            html.getConfirmEmailString2('./assets/mail-schematic/welcome.html', htmlOption)
            return res.status(200).redirect(config.frontDomain + '/login-panel/confirm')
          }
        })
      })

    }
  );

  router.delete(
    "/local/drop/:userId",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      let id = req.params.userId
      let query:string = 'DELETE FROM EXPERT_USER ' +
      ' WHERE idEXPERT_USER = ' + mysql.escape(id)
      app.conn.query(query, (err, result) => {
          if(err) {
            return res.status(500).send(err)
          } else {
            return res.status(200).send('success')
          }
      })
    }
  );

  router.get(
    "/user",
    ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
        // console.log(req.isAuthenticated());
        if(req.isAuthenticated()) return res.status(200).json(req.user);
        else  return res.status(401).send('Fail')
      }
    )


  router.post('/local',
    passport.authenticate('local', {
        successRedirect: '/api/auth/welcome',
        failureRedirect: '/api/auth/fail',
    })
  )

  router.get('/local',
    (req:express.Request, res:express.Response) => {
      if (req.isAuthenticated()) {
        res.status(200).send(true)
      } else {
        res.status(401).send(false)
      }
    }
  )

  router.delete('/local', ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
    req.logout();
    res.status(200).send(null)
  });

  router.get('/welcome', ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      let Q1:string = 'UPDATE EXPERT_USER SET LAST_LOGIN_DATE=now()' +
      ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER) + '; '
      // console.log(query)
      app.conn.query(Q1, (err1, result1) => {
        if(err1) {
          res.status(500).send('fail');
        } else {
          let Q2 = ' SELECT status FROM EXPERT_USER '
          + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER) + '; '
          app.conn.query(Q2, (err2, result2)=>{
            if(err2) {
              res.status(500).send(err2);
              console.log(Q2);
              console.log(result2);
            } else {
              if(result2[0].status === 0) {
                res.status(402).send('need-confirm');
              }
              else {
                res.status(200).send('success');
              }
            }
          })
        }
      })
    }
  )

  router.get('/fail',
    (req:express.Request, res:express.Response) => {
      res.status(401).send('fail');
    }
  )

  router.delete('/', ensureAuthenticated,
    (req:express.Request, res:express.Response, next:express.NextFunction) => {
      req.session.destroy(()=>{
        res.status(300).send('Log-Out');
      })
    }
  )

  router.get('/check',
    (req:express.Request, res:express.Response, next:express.NextFunction) => {
      if (req.isAuthenticated()) { return res.status(300).send('Loged-in'); }
      else return res.status(401).send('Not Loged-in');
  })

router.get("/user", (req:express.Request, res:express.Response) => {
  req.logout();
  req.session.save(()=>{
    res.send("local log-out")
  })
});

router.put(
  "/user/email", ensureAuthenticated,
  (req:express.Request, res:express.Response) => {
  let Q1 = ' SELECT email, password, salt FROM EXPERT_USER '
  + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER)
  app.conn.query(Q1, (err1, result1)=>{
    if (err1) {
      console.log(err1);
      console.log(Q1);
      res.status(500).send(err1)
    } else  {
      // res.status(200).send(result1)
      let hashInfo = {password:req.body.password, salt:result1[0].salt};
      hasher(hashInfo , (err, pass, salt, hash) => {
        if(hash === result1[0].password){
          let Q2 = ' UPDATE EXPERT_USER '
          + 'SET email = ' + mysql.escape(req.body.email);
          app.conn.query(Q2, (err2, result2)=>{
            if(err2) res.status(500).send(err1);
            else res.status(200).send(result2);
          })
        } else {
          res.status(401).send(err1)
        }
      });
    }
  })
});

router.put(
  "/user/phone", ensureAuthenticated,
  (req:express.Request, res:express.Response) => {
  let Q1 = ' SELECT phone, password, salt FROM EXPERT_USER '
  + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER)
  app.conn.query(Q1, (err1, result1)=>{
    if (err1) {
      console.log(err1);
      console.log(Q1);
      res.status(500).send(err1)
    } else  {
      // res.status(200).send(result1)
      let hashInfo = {password:req.body.password, salt:result1[0].salt};
      hasher(hashInfo , (err, pass, salt, hash) => {
        if(hash === result1[0].password){
          let Q2 = ' UPDATE EXPERT_USER '
          + ' SET phone = ' + mysql.escape(req.body.phone)
          + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER)
          app.conn.query(Q2, (err2, result2)=>{
            if(err2) res.status(500).send(err1);
            else res.status(200).send(result2);
          })
        } else {
          res.status(401).send(err1)
        }
      });
    }
  })
});

router.put(
  "/user/dept", ensureAuthenticated,
  (req:express.Request, res:express.Response) => {
  let Q1 = ' SELECT idDEPT, password, salt FROM EXPERT_USER '
  + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER)
  app.conn.query(Q1, (err1, result1)=>{
    if (err1) {
      console.log(err1);
      console.log(Q1);
      res.status(500).send(err1)
    } else  {
      // res.status(200).send(result1)
      let hashInfo = {password:req.body.password, salt:result1[0].salt};
      hasher(hashInfo , (err, pass, salt, hash) => {
        if(hash === result1[0].password){
          let Q2 = ' UPDATE EXPERT_USER '
          + 'SET idDEPT = ' + mysql.escape(req.body.dept);
          app.conn.query(Q2, (err2, result2)=>{
            if(err2) res.status(500).send(err1);
            else res.status(200).send(result2);
          })
        } else {
          res.status(401).send(err1)
        }
      });
    }
  })
});

router.put(
  "/user/job", ensureAuthenticated,
  (req:express.Request, res:express.Response) => {
    let file = (req as any).files.license;
    let toJob = req.body.job
    let toJobName = req.body.jobName
    let lic_path= path.join(config.fileStoragePath, "userfiles", req.user.idEXPERT_USER.toString())
    let Q1= ' SELECT '
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
    app.conn.query(Q1, (err1, result1)=>{
      let user = result1[0]
      let hashInfo = {password:req.body.password, salt:user.salt};
      hasher(hashInfo , (err, pass, salt, hash) => {
        if(hash === user.password){
        file.mv(path.join(lic_path, 'license_img.tmp'), (err)=>{
          if(err) res.status(500).send(err);
          else {
            let html = new HTMLtoStringService(user.name + ' 님께서 직종 변경을 요청하셨습니다.')
            let opt = [
              config.fullDomain + '/img/dmhc_logo',
              user.name,
              user.email,
              user.job,
              toJobName,
              user.dept,
              config.fullDomain + '/img' + '/' + user.idEXPERT_USER.toString() + '/license.tmp',
              config.fullDomain + '/auth'+ '/job' + '/confirm/' + user.idEXPERT_USER.toString() + '/' + toJob,
            ]
            html.getConfirmEmailString2('./assets/mail-schematic/change-job.html', opt)
            res.status(200).send(err);
          }
        })
      } else res.status(401).send(err1);
      })
    });
});

router.get(
  "/job/confirm/:idEXPERT_USER/:idJOBS",
  ensureAuthenticated,
  (req:express.Request, res:express.Response) => {
    let Q1 = ' SELECT email FROM EXPERT_USER '
    + ' WHERE idEXPERT_USER = ' +  mysql.escape(req.params.idEXPERT_USER);
    app.conn.query(Q1, (err1, result1)=>{
      if(err1) res.status(500).send(err1);
      else {
        let email = result1[0].email;
        let Q2 = ' UPDATE EXPERT_USER '
        + ' SET idJOBS = ' + mysql.escape(req.params.idJOBS);
        + ' WHERE idEXPERT_USER = ' +  mysql.escape(req.params.idEXPERT_USER);
        app.conn.query(Q2, (err2, result2)=>{
          if(err2) res.status(500).send(err2);
          else {
            let html = new HTMLtoStringService('매일마음관리 직종변경 신청이 승인되었습니다.', email)
            let opt = [
              config.fullDomain + '/img/dmhc_logo',
              config.frontDomain,
            ]
            html.getConfirmEmailString2('./assets/mail-schematic/confirm-job.html', opt)
            res.status(200).redirect(config.frontDomain + '/login-panel/confirm/job');

          }
        })
      }
    })
});



function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) { return next(); }
    // 로그인이 안되어 있으면, login 페이지로 진행
    res.redirect(config.perpose + '/auth/fail');
}

    return router;
}; //end of module
