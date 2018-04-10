import * as express from "express";
let router = express.Router();
import * as mysql from 'mysql'
import { ServerConfig } from "../configure/config"
import request = require("request");
import fs = require("fs")
import * as mkdirp from 'mkdirp'
import { MailService } from "../service/mail-service"



module.exports = function(app):express.Router{
//Need to adding type of 'app'
  let config = new ServerConfig()
  let path = require('path')
  router.use(function timeLog(req:express.Request,
                     res:express.Response,
                     next:express.NextFunction):void
    {
      console.log('Time', Date.now());
      next();
    }
  );
  router.get(
    //Get Registered Jobs
    "/user",
    (req:express.Request, res:express.Response) => {
        let Q:string = ' SELECT '
        + " idEXPERT_USER, "
        + " name, "
        + " email, "
        + " idDEPT, "
        + " (SELECT name FROM DEPT WHERE DEPT.idDEPT = EXPERT_USER.idDEPT) as deptName, "
        + " idJOBS, "
        + " (SELECT name FROM JOBS WHERE JOBS.idJOBS = EXPERT_USER.idJOBS) as jobName, "
        + " birth, "
        + " phone, "
        + " last_login_date "
        + " FROM EXPERT_USER "
        + " WHERE idEXPERT_USER = " + mysql.escape(req.user.idEXPERT_USER);
        app.conn.query(Q, (err:string, result:object) =>
          {
            if(err){
              console.log(err);
              res.status(500).send(err);
            } else {
              res.status(200).send(result)
            }
          }
        )
    })

  router.get(
    //Get Registered Jobs
    "/jobs",
    (req:express.Request, res:express.Response) => {

        let insertUser_Q:string = 'SELECT * from JOBS'
        app.conn.query(insertUser_Q, (err:string, result:object) =>
          {
            if(err){
              console.log(err);
              res.status(500);
              res.json({success:false, msg:'Failed to Save'})
            } else {
              res.json(result)
            }
          }
        )
    })


    router.get(
    //Get Registered Jobs
    "/jobs/:jobId",
    (req:express.Request, res:express.Response) => {
        let Query:string =
        ' SELECT name FROM JOBS ' +
        ' WHERE idJOBS = ' + mysql.escape(req.params.jobId);
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(err){
              console.log(err);
              res.status(500);
              res.json({success:false, msg:'Failed to Save'})
            } else {
              res.json(result)
            }
          }
        )
    })

    router.get(
    //Get Registered Jobs
    "/depts/:deptId",
    (req:express.Request, res:express.Response) => {
        let Query:string =
        ' SELECT name FROM DEPT ' +
        ' WHERE idDEPT = ' + mysql.escape(req.params.deptId);
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(err){
              console.log(err);
              res.status(500);
              res.json({success:false, msg:'Failed to Save'})
            } else {
              res.json(result)
            }
          }
        )
    })

    router.get(
    //Get Registered Facilites
    "/depts",
    (req:express.Request, res:express.Response) => {
        let insertUser_Q:string = 'SELECT * from DEPT'
        app.conn.query(insertUser_Q, (err:string, result:object) =>
          {
            if(err){
              console.log(err);
              res.status(500);
              res.json({success:false, msg:'Failed to Save'})
            } else {
              // res.json({success:true, data: result})
              res.json(result);
            }
          }
        )
    })

    router.get(
    //Get Registered Jobs
    "/users",
    (req:express.Request, res:express.Response) => {
        let Query:string =
        'SELECT idEXPERT_USER , email FROM EXPERT_USER'
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(err){
              console.log(err);
              res.status(500);
              res.json({success:false, msg:'Failed to Save'})
            } else {
              res.json(result)
            }
          }
        )
    })

    router.get(
    //Get Registered Jobs
    "/users/:userId",
    (req:express.Request, res:express.Response) => {
        let Query:string =
        ' SELECT idEXPERT_USER, name, email FROM EXPERT_USER ' +
        ' WHERE idEXPERT_USER = ' + mysql.escape(req.params.userId);
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(err){
              console.log(err);
              res.status(500);
              res.json({success:false, msg:'Failed to Save'})
            } else {
              res.json(result)
            }
          }
        )
    })

    router.get(
    //Get Registered Jobs
    "/patient/:id",
    (req:express.Request, res:express.Response) => {
        let Query:string =
        ' SELECT  * FROM PATIENT_USER ' +
        ' WHERE idEXPERT_USER = ' + mysql.escape(req.params.id);
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(req.user) {
              if(err){
                console.log(err);
                res.status(500).json({success:false, msg:'Failed to Save'})
              } else {
                res.status(200).json(result)
              }
            } else {
              res.status(401).send('Not authenticated user')
            }
          }
        )
    })

    router.get(
    //Get Registered Jobs
    "/admin",
    (req:express.Request, res:express.Response) => {
        // console.log(req.headers);
        let Query:string =
        'SELECT EXPERT_USER.name, EXPERT_USER.email, EXPERT_USER.phone ' +
        'FROM ADMIN, EXPERT_USER ' +
        'WHERE ADMIN.idEXPERT_USER = EXPERT_USER.idEXPERT_USER ';
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(err){
              console.log(err);
              res.status(500);
              res.json({success:false, msg:'Failed to Save'})
            } else {
              res.json(result)
            }
          }
        )
    })

    router.get(
    //Get Registered Jobs
    "/admin/check",
    (req:express.Request, res:express.Response) => {
        // console.log(req.headers);
        let Query:string =
        ' SELECT EXPERT_USER.name ' +
        ' FROM ADMIN, EXPERT_USER ' +
        ' WHERE ADMIN.idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER)
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(err){
              console.log(err);
              res.status(500);
              res.json({success:false, msg:'Failed to Save'})
            } else {
              res.json(result)
            }
          }
        )
    })


    router.get(
    //Get Registered Jobs
    "/lectures/finished",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
        let Query:string = ' SELECT * FROM LECTURE_ALL '
        + ' WHERE idEXPERT_USER=' + mysql.escape(req.user.idEXPERT_USER) + ' AND '
        + ' status= 0'
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(req.user) {
              if(err){
                console.log(err);
                res.status(500).json({success:false, msg:'Failed to Save'})
              } else {
                res.status(200).json(result)
              }
            } else {
              res.status(401).send('Not authenticated user')
            }
          }
        )
    })

    router.get(
    //Get Registered Jobs
    "/lectures",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
        let Query:string = ' SELECT * FROM LECTURE_ALL ' +
        'WHERE idEXPERT_USER=' + mysql.escape(req.user.idEXPERT_USER)
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(req.user) {
              if(err){
                console.log(err);
                res.status(500).json({success:false, msg:'Failed to Save'})
              } else {
                res.status(200).json(result)
              }
            } else {
              res.status(401).send('Not authenticated user')
            }
          }
        )
    })

    router.delete(
    //Get Registered Jobs
    "/lecture/:idLECTURE",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      let Q0:string = ' DELETE FROM LECTURE_HTML '
      + 'WHERE idLECTURE = ' + mysql.escape(req.params.idLECTURE)
        app.conn.query(Q0, (err:string, result:object) => {
          if(err) console.log(err);
          let Q1:string = ' DELETE FROM LECTURE_ALL '
          + 'WHERE idLECTURE = ' + mysql.escape(req.params.idLECTURE)
          app.conn.query(Q1, (err:string, result:object) =>
            {
              if(req.user) {
                if(err){
                  console.log(err);
                  res.status(500).json({success:false, msg:'Failed to Save'})
                } else {
                  console.log(Q1);
                  res.status(200).json(result)
                }
              } else {
                res.status(401).send('Not authenticated user')
              }
            }
          )
        })
    })

    router.put(
    //Get Registered Jobs
    "/lecture/:idLECTURE",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      let Q0:string = ' UPDATE LECTURE_HTML '
      + ' SET status=' + mysql.escape(0)
      + ' WHERE idLECTURE = ' + mysql.escape(req.params.idLECTURE)
        app.conn.query(Q0, (err:string, result:object) => {
          if(err) console.log(err);
          let Q1:string = ' UPDATE LECTURE_ALL '
          + ' SET status=' + mysql.escape(0)
          + ' WHERE idLECTURE = ' + mysql.escape(req.params.idLECTURE)
          app.conn.query(Q1, (err:string, result:object) =>
            {
              if(req.user) {
                if(err){
                  console.log(err);
                  res.status(500).json({success:false, msg:'Failed to Save'})
                } else {
                  console.log(Q1);
                  res.status(200).json(result)
                }
              } else {
                res.status(401).send('Not authenticated user')
              }
            }
           )
        })
    })

    router.get(
    //Get Registered Jobs
    "/lectures/:page",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      let limitNo = 15;
        let Query:string = ' SELECT * FROM LECTURE_ALL '
        + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER)
        + ' LIMIT ' + (limitNo*req.params.page-limitNo).toString() + ','
        + limitNo  + ';'
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(req.user) {
              if(err){
                console.log(err);
                res.status(500).json({success:false, msg:'Failed to Save'})
              } else {
                res.status(200).json(result)
              }
            } else {
              res.status(401).send('Not authenticated user')
            }
          }
        )
    })

    router.get(
    //Get Registered Jobs
    "/lectures/title/:title",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      let limitNo = 15;
        let Query:string = ' SELECT * FROM LECTURE_ALL '
        + ' WHERE title like ' + mysql.escape('%'+ req.params.title +'%') + ' AND '
        + ' idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER);
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(req.user) {
              if(err){
                console.log(err);
                res.status(500).json({success:false, msg:'Failed to Save'})
              } else {
                res.status(200).json(result)
              }
            } else {
              res.status(401).send('Not authenticated user')
            }
          }
        )
    })

    router.get(
    //Get Registered Jobs
    "/lecture/html/:idLECTURE",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
        let Q:string = ' SELECT * FROM LECTURE_HTML ' +
        'WHERE idLECTURE =' + mysql.escape(req.params.idLECTURE)
        app.conn.query(Q, (err:string, result:object) =>
          {
            if(req.user) {
              if(err){
                console.log(err);
                res.status(500).json({success:false, msg:'Failed to Save'})
              } else {
                res.status(200).json(result)
              }
            } else {
              res.status(401).send('Not authenticated user')
            }
          }
        )
    })

    router.post(
    //
    "/lecture/html",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      let insertId
        let Q:string =
        "INSERT INTO LECTURE_ALL (idEXPERT_USER, title, type, page_no) " +
        " VALUES(" + mysql.escape(req.user.idEXPERT_USER) + ' , ' +
        mysql.escape(req.body.title) +  ' , ' +
        mysql.escape(0) +  ' , ' +
        mysql.escape(req.body.all_page_no) + ") " +
        ' ON DUPLICATE KEY UPDATE ' +
        ' idEXPERT_USER=' + mysql.escape(req.user.idEXPERT_USER) + ',' +
        ' type=0,' +
        ' page_no=' + mysql.escape(req.body.all_page_no) + ';'
        app.conn.query(Q, (err:string, result) =>
          {
            if(err){
              console.log(Q)
              console.log(err)
              res.status(500).send(err);
            }
            console.log(result.insertId);
            if(result.insertId == 0) {
              console.log('Exist')
              let Q1 = 'SELECT idLECTURE FROM LECTURE_ALL WHERE title=' + mysql.escape(req.body.title)
              app.conn.query(Q1, (err1:string, result1) => {
                insertId = result1[0].idLECTURE;
                UpdateLectureHTML(req, res, insertId, req.body.all_page_no);
              })
            } else {
              console.log('New')
                insertId = result.insertId;
                UpdateLectureHTML(req, res, insertId, req.body.all_page_no);
            }
          }
        )
    })

    function UpdateLectureHTML(req, res, insertId, all) {
      let Q1:string =
      'DELETE FROM LECTURE_HTML WHERE idLECTURE = ' +
      mysql.escape(insertId) + ' AND ' + 'page_no > ' +
      mysql.escape(all);
      app.conn.query(Q1);

        let Q2:string =
        "INSERT INTO LECTURE_HTML (idLECTURE_HTML, idLECTURE, page_no, html) " +
        " VALUES(" +
        mysql.escape(req.body.title + '_' + req.body.page_no) + ' , ' +
        // '1' +  ' , ' +
        mysql.escape(insertId) +  ' , ' +
        mysql.escape(req.body.page_no) +  ' , ' +
        mysql.escape(req.body.html) +
        ") " +
        ' ON DUPLICATE KEY UPDATE ' +
        // ' idLECTURE=' + '1' + ',' +
        ' idLECTURE=' + mysql.escape(insertId) + ',' +
        ' page_no=' + mysql.escape(req.body.page_no) + ',' +
        ' html=' + mysql.escape(req.body.html) + ';'

        app.conn.query(Q2, (err:string, result) => {
          if(err){
            console.log(Q2)
            console.log(err)
            res.status(500).send(err);
          }
          res.status(300).send('OK');
        })
    }

    router.post(
    "/lecture/pdf",
    (req:express.Request, res:express.Response) => {
        let insertId
        let Q:string =
        "INSERT INTO LECTURE_ALL (idEXPERT_USER, title, type, page_no) " +
        " VALUES(" + mysql.escape(req.user.idEXPERT_USER) + ' , ' +
        mysql.escape(req.body.title) +  ' , ' +
        mysql.escape(1) +  ' , ' +
        mysql.escape(req.body.all_page_no) + ") " +
        ' ON DUPLICATE KEY UPDATE ' +
        ' idEXPERT_USER=' + mysql.escape(req.user.idEXPERT_USER) + ',' +
        ' type=1,' +
        ' page_no=' + mysql.escape(req.body.all_page_no) + ';'
        app.conn.query(Q, (err:string, result) =>
            {
            if(err){
              console.log(Q)
              console.log(err)
              res.status(500).send(err);
            }
            console.log(result.insertId);
            if(result.insertId == 0) {
              console.log('Exist')
              let Q1 = 'SELECT idLECTURE FROM LECTURE_ALL WHERE title=' + mysql.escape(req.body.title)
              app.conn.query(Q1, (err1:string, result1) => {
                insertId = result1[0].idLECTURE;
                let path = config.fileStoragePath + "/userfiles/" + req.user.idEXPERT_USER  + '/lectures/'
                + req.body.title + "/";
                let fileName = req.body.title + '.pdf';
                console.log((req as any).files)
                savePdf(res, req, (req as any).files.lecture_file, path, fileName);
              })
            } else {
              console.log('New')
              console.log((req as any).files);
                insertId = result.insertId;
                let path = config.fileStoragePath + "/userfiles/" + req.user.idEXPERT_USER  + '/lectures/'
                + req.body.title + "/";
                let fileName = req.body.title + '.pdf';
                savePdf(res, req, (req as any).files.lecture_file, path, fileName);
            }
          })
    })


    function savePdf(res, req, data, path, name) {
      if(!data) {
        return res.status(400).send('No files ware uploaded')
      }
      if(!fs.existsSync(path)) {
          mkdirp(path, (err) => {
              if(err) {console.log(err)}
              else {
                  data.mv(path + '/' + name, (err)=>{
                  if (err) {
                    res.status(500).send(err)
                  }
                    res.status(200).send('Success')
                });
              }
          })
      } else {
        data.mv(path + '/' + name, (err)=>{
        if (err) {
          res.status(500).send(err)
        }
          res.status(200).send('Success')
        })
      }
  }

  router.get(
    //Get Registered Jobs
    "/lecture/pdf/:idLECTURE",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      let path = config.fileStoragePath + "/userfiles/"+
       req.user.idEXPERT_USER + '/lectures/' +
       req.params.idLECTURE + "/";
      console.log(req.user);
      let fileName = req.params.idLECTURE + '.pdf';
      fs.readFile(path + fileName, (err, data) => {
        if(err) { res.status(404).send(err) }
        else {
          res.writeHead(200, { 'Content-Type': 'application/pdf' });
          res.end(data, 'binary');
        }
      })
  })

  router.get(
    //Get Registered Jobs
    "/hash/struct",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      let Q = 'SELECT HASH_TREE.ance, HASH_TREE.dece, HASH.name, HASH.ADD_TIME, HASH_TREE.level, countTable.count FROM DMHC.HASH_TREE JOIN HASH ON HASH_TREE.dece = HASH.idHASH INNER JOIN (SELECT HASH_TREE.ance as countId, count(text) as count FROM DMHC.HASH_TREE LEFT JOIN HASH_SUB ON HASH_TREE.dece = HASH_SUB.idHASH GROUP BY HASH_TREE.ance) as countTable ON HASH_TREE.dece = countTable.countId WHERE idEXPERT_USER = '+ mysql.escape(req.user.idEXPERT_USER) + ' ORDER BY HASH_TREE.ance, HASH_TREE.dece; '
      app.conn.query(Q, (err:string, result) => {
        if(err) {
          console.log(Q);
          console.log(err);
          res.status(500).send(err);
        } else {
          res.status(200).send(result);
        }
      })
    }
  )


  router.get(
    //Get Registered Jobs
    "/hash/sub/all",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      console.log('Work?')
      let Q = 'SELECT * FROM HASH_SUB'
      app.conn.query(Q, (err:string, result) => {
        if(err) {
          console.log(Q);
          console.log(err);
          res.status(500).send(err);
        } else {
          res.status(200).send(result);
        }
      })
    }
  )


  router.post(
    //Get Registered Jobs
    "/hash/all",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      console.log(req.body);
        let Q:string =
        // "INSERT INTO HASH (name, idEXPERT_USER, children) " +
        "INSERT INTO HASH (name, idEXPERT_USER, ADD_TIME) " +
        " VALUES(" +
          mysql.escape(req.body.name) + ' , ' +
          mysql.escape(req.user.idEXPERT_USER) + ' , ' +
          mysql.escape(req.body.ADD_TIME) +
        ") "
        app.conn.query(Q, (err:string, result) => {
          if(err) {
            console.log(Q);
            console.log(err);
            res.status(500).send(err);
          } else {
            console.log(result);
            let Q2:string = " INSERT INTO HASH_TREE (ance, dece, level) ";
            Q2 += " VALUES( " + mysql.escape(result.insertId) + ' , ' ;
            Q2 += mysql.escape(result.insertId)  + ' , ';
            Q2 += mysql.escape(0)  + ' ) ';
            app.conn.query(Q2, (err2:string, result2)=>{
              if(err) { console.log(Q2); console.log(err2); res.status(500).send(err) }
              else { res.status(200).send(result); }
            })

          }
        })
    }
  )

  router.post(
    //Get Registered Jobs
    "/hash/decend",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      console.log(req.body)
      // res.status(200).send();
      let Q:string = " INSERT INTO HASH_TREE (ance, dece, level) "
      Q += "SELECT ance, "
      Q += mysql.escape(req.body.dece) + ' , '
      Q += " level+1 FROM HASH_TREE WHERE dece = " + mysql.escape(req.body.ance)
      app.conn.query(Q, (err:string, result) => {
        if(err) {
          console.log(Q);
          console.log(err);
          res.status(500).send(err);
        } else {
          res.status(200).send(result);
        }
      })
    }
  )

  router.delete(
    //Get Registered Jobs
    "/hash/decend/:idHASH/:parentId",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      console.log(req.body)
      // res.status(200).send();
      let Q:string = " DELETE from DMHC.HASH_TREE where idHASH_TREE in  "
      Q += " (SELECT idHASH_TREE FROM "
      Q += " ( SELECT idHASH_TREE FROM HASH_TREE WHERE dece in (SELECT dece FROM DMHC.HASH_TREE  where "
      Q += " dece= " + mysql.escape(req.params.idHASH)
      Q += " AND dece <> ance) and ance in (SELECT ance FROM DMHC.HASH_TREE  WHERE "
      Q += " dece=" + mysql.escape(req.params.parentId) + ") ) tmp ) "
      app.conn.query(Q, (err:string, result) => {
        if(err) {
          console.log(Q);
          console.log(err);
          res.status(500).send(err);
        } else {
          res.status(200).send(result);
        }
      })
    }
  )

  router.post(
    //Get Registered Jobs
    "/hash/sub/all",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
        let Q:string = "INSERT INTO HASH_SUB (text, ADD_TIME, idHASH) VALUES ? ";
        console.log(req.body.words);
        let values = JSON.parse(req.body.words).map(obj => { return [obj.text, obj.ADD_TIME, obj.idHASH] })
        app.conn.query(Q, [values], (err:string, result) => {
          if(err) {
            console.log(Q);
            console.log(err);
            res.status(500).send(err);
          } else {
             res.status(200).send(result);
          }
        })
    }
  )

  router.delete(
    //Get Registered Jobs
    "/hash/:idHASH",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      // console.log(req.body);
        let Q1:string =
        'DELETE FROM HASH_SUB '
        + ' WHERE idHASH = ' + mysql.escape(req.params.idHASH);
        app.conn.query(Q1, (err1:string, result1) => {
          if(err1) { console.log(err1); res.status(500).send(err1);}
          else {
            let Q2:string =
            'DELETE FROM HASH '
            + ' WHERE idHASH = ' + mysql.escape(req.params.idHASH);
            app.conn.query(Q2, (err2:string, result2)=>{
              if(err2) { console.log(err2); res.status(500).send(err2);}
              else {
                let Q3:string =
                'DELETE FROM HASH_TREE '
                + ' WHERE ance = ' + mysql.escape(req.params.idHASH) + ' OR '
                + ' dece = ' + mysql.escape(req.params.idHASH)
                app.conn.query(Q3, (err3:string, result3)=>{
                  if(err3) { console.log(err3); res.status(500).send(err3);}
                  else {
                    res.status(200).send(result3)
                  }
                })

              }
            })
          };
        })
      }
  )

  router.delete(
    //Get Registered Jobs
    "/hash/sub/:idHASH/:subId",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      console.log(req.body);
        let Q:string =
        'DELETE FROM HASH_SUB '
        + ' WHERE idHASH = ' + mysql.escape(req.params.idHASH) +' AND '
        + ' text = ' + mysql.escape(req.params.subId);
        app.conn.query(Q, (err:string, result) => {
          if(err) {
            console.log(Q);
            console.log(err);
            res.status(500).send(err);
          } else {
            console.log(Q);
            res.status(200).send(result);
          }
        })
    }
  )

  router.get(
    //Get Registered Jobs
    "/hash/name/:name",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
        let Q:string = " SELECT COUNT(idHASH_SUB) as COUNT FROM HASH_SUB "
        Q += " JOIN (SELECT dece FROM HASH_TREE WHERE ance = "
        Q += " (SELECT idHASH FROM HASH WHERE name = " + mysql.escape('#' + req.params.name)
        Q += " AND idEXPERT_USER = " + mysql.escape(req.user.idEXPERT_USER)+")) as HASHES "
        Q += " ON HASH_SUB.idHASH = HASHES.dece "
        app.conn.query(Q, (err:string, result) => {
          if(err) {
            console.log(Q);
            console.log(err);
            res.status(500).send(err);
          } else {
            res.status(200).send(result);
          }
        })
    }
  )

    router.post(
    //Get Registered Jobs
    "/survey",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      console.log(req.body);
        let Q1:string =
        "INSERT INTO SURVEY_CONF "
        + "(idEXPERT_USER, title, measure, text01, text02, text03, text04, text05, text06, text07, ADD_TIME,UPDATE_TIME) "
        + " VALUES(" + mysql.escape(req.user.idEXPERT_USER) + ' , '
        + mysql.escape(req.body.title) +  ' , '
        + mysql.escape(req.body.measure) +  ' , '
        + mysql.escape(req.body.text01) +  ' , '
        + mysql.escape(req.body.text02) +  ' , '
        + mysql.escape(req.body.text03) +  ' , '
        + mysql.escape(req.body.text04) +  ' , '
        + mysql.escape(req.body.text05) +  ' , '
        + mysql.escape(req.body.text06) +  ' , '
        + mysql.escape(req.body.text07) +  ' , '
        + ' now()' +  ' , '
        + ' now()' + ") "
        + ' ON DUPLICATE KEY UPDATE '
        + ' idEXPERT_USER=' + mysql.escape(req.user.idEXPERT_USER) + ','
        + ' measure=' + mysql.escape(req.body.measure) + ','
        + ' text01=' + mysql.escape(req.body.text01) + ','
        + ' text02=' + mysql.escape(req.body.text02) + ','
        + ' text03=' + mysql.escape(req.body.text03) + ','
        + ' text04=' + mysql.escape(req.body.text04) + ','
        + ' text05=' + mysql.escape(req.body.text05) + ','
        + ' text06=' + mysql.escape(req.body.text06) + ','
        + ' text07=' + mysql.escape(req.body.text07) + ','
        + ' UPDATE_TIME = now();'
        app.conn.query(Q1, (err1, result1) =>
          {
            if(err1){
              console.log(err1);
              res.status(500).json({success:false, msg:'Failed to Save'})
            } else {
              let objs = JSON.parse(req.body.obj);
              let Q2 =
              ' INSERT INTO SURVEY_CONF_OBJECT '
              + ' (idSURVEY, num, text, type) '
              + ' VALUES '
              objs.map((obj)=>{
                let q = "("
                + mysql.escape(result1.insertId) + ' , '
                + mysql.escape(obj.idx) + ' , '
                + mysql.escape(obj.value) + ' , '
                + mysql.escape((obj.type ? 1 : 0)) +  '),'
                Q2 += q;
              })
              Q2 = Q2.substring(0, Q2.length-1)
              app.conn.query(Q2, (err2, result2)=>{
                if(err2) {
                  console.log(Q2)
                  console.log(err2)
                  res.status(500).send(err2)
                }
                else {res.status(200).send(result1)}
              })
            }
        })

    })

    router.get(
      "/survey/all",  ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q = ' SELECT * from SURVEY_CONF '
        + ' WHERE idEXPERT_USER =  ' + mysql.escape(req.user.idEXPERT_USER);
        app.conn.query(Q, (err, result)=>{
          if(err) {
            console.log(err);
            res.status(500).send(err);
          } else {
            res.status(200).send(result);
          }
        })
      }
    )

    router.get(
      "/survey/:idSURVEY",  ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        // let Q = 'SELECT idSURVEY, title, measure, text01, text02 text03, text04, text05,text06 text07'
        let Q = 'SELECT SURVEY_CONF.idSURVEY, title, measure, text01, text02, text03, text04, text05, text06, text07'
        + ' ,num ,text, type'
        + ' from SURVEY_CONF RIGHT JOIN SURVEY_CONF_OBJECT '
        + ' ON SURVEY_CONF.idSURVEY = SURVEY_CONF_OBJECT.idSURVEY '
        + ' WHERE SURVEY_CONF.idSURVEY = ' + mysql.escape(req.params.idSURVEY) + ' AND '
        + ' SURVEY_CONF.idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER);
        app.conn.query(Q, (err, result)=>{
          if(err) {
            console.log(err);
            res.status(500).send(err);
          } else {
            res.status(200).send(result);
          }
        })
      }
    )


    router.delete(
      '/survey/:idSURVEY', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q= ' DELETE FROM SURVEY_CONF '
        + ' WHERE idSURVEY = ' + mysql.escape(req.params.idSURVEY)
        app.conn.query(Q, (err, result)=>{
          if (err) {
            res.status(500).send(err);
            console.log(Q);
            console.log(err);
          } else {
            res.status(200).send(result);
          }
        })
      }
    )

    router.get(
      '/assigns/list', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q= ' SELECT * FROM SBJT_CONF_ALL'
        + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER)
        + ' ORDER BY idSBJT_CONF_ALL DESC '
        app.conn.query(Q, (err, result)=>{
          if (err) {
            res.status(500).send(err);
            console.log(Q);
            console.log(err);
          } else {
            res.status(200).send(result);
          }
        })
      }
    )

    router.get(
      '/assigns/finished', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q= ' SELECT * FROM SBJT_CONF_ALL'
        + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER) + ' AND '
        + ' status = 0'
        app.conn.query(Q, (err, result)=>{
          if (err) {
            res.status(500).send(err);
            console.log(Q);
            console.log(err);
          } else {
            res.status(200).send(result);
          }
        })
      }
    )

    router.put(
      '/assigns/:idSBJT_CONF_ALL', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q= ' UPDATE SBJT_CONF_ALL SET status = ' + mysql.escape(0)
        + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER) + ' AND '
        + ' idSBJT_CONF_ALL = ' + mysql.escape(req.params.idSBJT_CONF_ALL)
        app.conn.query(Q, (err, result)=>{
          if (err) {
            res.status(500).send(err);
            console.log(Q);
            console.log(err);
          } else {
            res.status(200).send(result);
          }
        })
      }
    )

    router.delete(
      '/assigns/:title/:idx', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q= ' DELETE FROM SB_SBJT_CONF'
        + ' WHERE idEXPERT_USER= ' + mysql.escape(req.user.idEXPERT_USER) + ' AND '
        + ' title = ' + mysql.escape(req.params.title) + ' AND '
        + ' idx = ' + mysql.escape(req.params.idx)
        app.conn.query(Q, (err, result)=>{
          if (err) {
            res.status(500).send(err);
            console.log(Q);
            console.log(err);
          } else {
            res.status(200).send(result);
          }
        })
      }
    )

    router.post(
      '/assign', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        const data = JSON.parse(req.body.assign);
        console.log(data);
        let Q1 = 'INSERT INTO SBJT_CONF_ALL '
        + '(idLECTURE, idEXPERT_USER, title, status, ADD_TIME, UPDATE_TIME) '
        + 'VALUES ('
        + mysql.escape(data.idLECTURE)  + ' , '
        + mysql.escape(req.user.idEXPERT_USER)  + ' , '
        + mysql.escape(data.title)  + ' , '
        + ' 1, '
        + ' NOW(), '
        + ' NOW())'
        + ' ON DUPLICATE KEY UPDATE '
        + ' idLECTURE = ' + mysql.escape(data.idLECTURE) + ' , '
        + ' title = ' + mysql.escape(data.title) + ' , '
        + ' status = 1' + ' , '
        + ' UPDATE_TIME = NOW() ' + ' ; '

        app.conn.query(Q1, (err1, result1)=>{
          if (err1) {
            res.status(500).send(err1);
            console.log(Q1);
            console.log(err1);
          } else {
            let Q2 =
            ' INSERT INTO SB_SBJT_CONF '
            + ' ( '
            + ' idSBJT_CONF_ALL, '
            + ' idx, '
            + ' title, '
            + ' command, '
            + ' type_create_condition, '
            + ' conf_create_condition_01, '
            + ' conf_create_condition_02, '
            + ' conf_create_condition_03, '
            + ' conf_create_condition_04, '
            + ' type_create_num, '
            + ' conf_create_num_01, '
            + ' conf_create_num_02, '
            + ' conf_create_num_03, '
            + ' conf_push_time_01, '
            + ' conf_push_time_02, '
            + ' type_repush_time, '
            + ' conf_repush_time_01, '
            + ' type_input, '
            + ' conf_input_01, '
            + ' conf_input_02, '
            + ' conf_input_03, '
            + ' conf_input_04, '
            + ' conf_input_05, '
            + ' type_stop, '
            + ' conf_stop_01, '
            + ' conf_stop_02, '
            + ' type_del, '
            + ' conf_del_01, '
            + ' conf_del_02) '
            + ' VALUES '
            data.assigns.map((obj)=>{
              let q = "("
              + mysql.escape(result1.insertId) + ' , '
              + mysql.escape(obj.index) + ' , '
              + mysql.escape(obj.title) + ' , '
              + mysql.escape(obj.command) + ' , '
              + mysql.escape(obj.type_create_condition) + ' , '
              + mysql.escape(obj.conf_create_condition_01) + ' , '
              + mysql.escape(obj.conf_create_condition_02) + ' , '
              + mysql.escape(obj.conf_create_condition_03) + ' , '
              + mysql.escape(obj.conf_create_condition_04) + ' , '
              + mysql.escape(obj.type_create_num) + ' , '
              + mysql.escape(obj.conf_create_num_01) + ' , '
              + mysql.escape(obj.conf_create_num_02) + ' , '
              + mysql.escape(obj.conf_create_num_03) + ' , '
              + mysql.escape(obj.conf_push_time_01) + ' , '
              + mysql.escape(obj.conf_push_time_02) + ' , '
              + mysql.escape(obj.type_repush_time) + ' , '
              + mysql.escape(obj.conf_repush_time_01) + ' , '
              + mysql.escape(obj.type_input) + ' , '
              + mysql.escape(obj.conf_input_01) + ' , '
              + mysql.escape(obj.conf_input_02) + ' , '
              + mysql.escape(obj.conf_input_03) + ' , '
              + mysql.escape(obj.conf_input_04) + ' , '
              + mysql.escape(obj.conf_input_05) + ' , '
              + mysql.escape(obj.type_stop) + ' , '
              + mysql.escape(obj.conf_stop_01) + ' , '
              + mysql.escape(obj.conf_stop_02) + ' , '
              + mysql.escape(obj.type_del) + ' , '
              + mysql.escape(obj.conf_del_01) + ' , '
              + mysql.escape(obj.conf_del_02) + ' ),'
              Q2 += q;
            })

            Q2 = Q2.substring(0, Q2.length-1)
            Q2 = Q2 + ' ON DUPLICATE KEY UPDATE '
            + ' title=VALUES(title), '
            + ' command=VALUES(command), '
            + ' type_create_condition=VALUES(type_create_condition), '
            + ' conf_create_condition_01=VALUES(conf_create_condition_01), '
            + ' conf_create_condition_02=VALUES(conf_create_condition_02), '
            + ' conf_create_condition_03=VALUES(conf_create_condition_03), '
            + ' conf_create_condition_04=VALUES(conf_create_condition_04), '
            + ' type_create_num=VALUES(type_create_num), '
            + ' conf_create_num_01=VALUES(conf_create_num_01), '
            + ' conf_create_num_02=VALUES(conf_create_num_02), '
            + ' conf_create_num_03=VALUES(conf_create_num_03), '
            + ' conf_push_time_01=VALUES(conf_push_time_01), '
            + ' conf_push_time_02=VALUES(conf_push_time_02), '
            + ' type_repush_time=VALUES(type_repush_time), '
            + ' conf_repush_time_01=VALUES(conf_repush_time_01), '
            + ' type_input=VALUES(type_input), '
            + ' conf_input_01=VALUES(conf_input_01), '
            + ' conf_input_02=VALUES(conf_input_02), '
            + ' conf_input_03=VALUES(conf_input_03), '
            + ' conf_input_04=VALUES(conf_input_04), '
            + ' conf_input_05=VALUES(conf_input_05), '
            + ' type_stop=VALUES(type_stop), '
            + ' conf_stop_01=VALUES(conf_stop_01), '
            + ' conf_stop_02=VALUES(conf_stop_02), '
            + ' type_del=VALUES(type_del), '
            + ' conf_del_01=VALUES(conf_del_01), '
            + ' conf_del_02=VALUES(conf_del_02) '
            app.conn.query(Q2, (err2, result2)=>{
              if (err2) {
                res.status(500).send(err2);
                console.log(Q2);
                console.log(err2);
              } else {
                let Q3 = 'DELETE FROM SB_SBJT_CONF '
                + ' WHERE idSBJT_CONF_ALL = ' + mysql.escape(result1.insertId) + ' AND '
                + ' idx > ' + mysql.escape(data.assigns[data.assigns.length-1].index) + ';'
                app.conn.query(Q3, (err3, result3)=>{
                  if(err3) {
                    res.status(500).send(err3);
                    console.log(Q3);
                    console.log(err3);
                  } else {
                    res.status(200).send(result1);
                  }
                })
              }
            })
          }
        })
      }
    )

    router.get(
      '/assigns/all/:idSBJT_CONF_ALL', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q1 = 'SELECT * '
        + ' FROM SBJT_CONF_ALL RIGHT JOIN '
        + ' SB_SBJT_CONF ON SBJT_CONF_ALL.idSBJT_CONF_ALL =  SB_SBJT_CONF.idSBJT_CONF_ALL '
        + ' WHERE SBJT_CONF_ALL.idSBJT_CONF_ALL = ' + mysql.escape(req.params.idSBJT_CONF_ALL);
        app.conn.query(Q1, (err1, result1)=>{
          if(err1) {
            console.log(Q1)
            console.log(err1)
            res.status(500).send(err1)
          } else {
            console.log(Q1)
            res.status(200).send(result1)
          }
        })
    })

    router.get(
      '/assign/detail/:idSBJT_CONF_ALL', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q1 = 'SELECT '
        + " SBJT_CONF_ALL.idSBJT_CONF_ALL, "
        + " idLECTURE, "
        + " SBJT_CONF_ALL.title,   "
        + " command,   "
        + " status, UPDATE_TIME,"
        + " SB_SBJT_CONF.title AS subTitle,"
        + " type_create_condition,"
        + " conf_create_condition_01,"
        + " conf_create_condition_02,"
        + " conf_create_condition_03,"
        + " conf_create_condition_04,"
        + " type_create_num,"
        + " conf_create_num_01,"
        + " conf_create_num_02,"
        + " conf_create_num_03,"
        + " conf_push_time_01,"
        + " conf_push_time_02,"
        + " type_repush_time,"
        + " conf_repush_time_01,"
        + " type_input,"
        + " conf_input_01,"
        + " conf_input_02,"
        + " conf_input_03,"
        + " conf_input_04,"
        + " conf_input_05,"
        + " type_stop,"
        + " conf_stop_01,"
        + " conf_stop_02,"
        + " type_del,"
        + " conf_del_01,"
        + " conf_del_02,"
        + " idx"
        + ' FROM SBJT_CONF_ALL RIGHT JOIN '
        + ' SB_SBJT_CONF ON SBJT_CONF_ALL.idSBJT_CONF_ALL =  SB_SBJT_CONF.idSBJT_CONF_ALL '
        + ' WHERE SBJT_CONF_ALL.idSBJT_CONF_ALL= ' + mysql.escape(req.params.idSBJT_CONF_ALL);
        app.conn.query(Q1, (err1, result1)=>{
          if(err1) {
            console.log(Q1)
            console.log(err1)
            res.status(500).send(err1)
          } else {
            console.log(Q1)
            res.status(200).send(result1)
          }
        })
    })
    router.delete(
    //Get Registered Jobs
    "/assign/:idSBJT_CONF_ALL",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
      let Q:string = ' DELETE FROM SBJT_CONF_ALL'
      + ' WHERE idSBJT_CONF_ALL = ' + mysql.escape(req.params.idSBJT_CONF_ALL)
        app.conn.query(Q, (err:string, result:object) => {
          if(err) {
            res.status(500).send(err);
            console.log(err);
            console.log(Q);
          } else {
            res.status(200).send(result);
          }
        })
    })

    router.get(
      '/assigns/list/title/:title', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q= ' SELECT * FROM SBJT_CONF_ALL'
        + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER) + ' AND '
        + ' title like ' + mysql.escape('%'+ req.params.title +'%')
        + ' GROUP BY SBJT_CONF_ALL.idSBJT_CONF_ALL '
        + ' ORDER BY idSBJT_CONF_ALL DESC '
        app.conn.query(Q, (err, result)=>{
          if (err) {
            res.status(500).send(err);
            console.log(Q);
            console.log(err);
          } else {
            res.status(200).send(result);
          }
        })
      }
    )

    router.get(
      '/assigns/list/lecture/:lecture', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q= ' SELECT '
        + ' SBJT_CONF_ALL.idSBJT_CONF_ALL, '
        + ' SBJT_CONF_ALL.title, '
        + ' SBJT_CONF_ALL.idLECTURE, '
        + ' SBJT_CONF_ALL.idEXPERT_USER, '
        + ' SBJT_CONF_ALL.status, '
        + ' SBJT_CONF_ALL.ADD_TIME, '
        + ' SBJT_CONF_ALL.UPDATE_TIME '
        + ' FROM SBJT_CONF_ALL '
        + ' LEFT JOIN LECTURE_ALL '
        + ' ON SBJT_CONF_ALL.idLECTURE = LECTURE_ALL.idLECTURE '
        + ' WHERE SBJT_CONF_ALL.idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER) + ' AND '
        + ' LECTURE_ALL.title like ' + mysql.escape('%'+ req.params.lecture+'%')
        + ' GROUP BY SBJT_CONF_ALL.idSBJT_CONF_ALL '
        + ' ORDER BY SBJT_CONF_ALL.idSBJT_CONF_ALL DESC '
        app.conn.query(Q, (err, result)=>{
          if (err) {
            res.status(500).send(err);
            console.log(Q);
            console.log(err);
          } else {
            res.status(200).send(result);
          }
        })
      }
    )

    router.get(
      '/assigns/list/subTitle/:subTitle', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q= ' SELECT '
        + ' SBJT_CONF_ALL.idSBJT_CONF_ALL, '
        + ' SBJT_CONF_ALL.title, '
        + ' SBJT_CONF_ALL.idLECTURE, '
        + ' SBJT_CONF_ALL.idEXPERT_USER, '
        + ' SBJT_CONF_ALL.status, '
        + ' SBJT_CONF_ALL.ADD_TIME, '
        + ' SBJT_CONF_ALL.UPDATE_TIME '
        + ' FROM SBJT_CONF_ALL '
        + ' LEFT JOIN SB_SBJT_CONF '
        + ' ON SBJT_CONF_ALL.idSBJT_CONF_ALL = SB_SBJT_CONF.idSBJT_CONF_ALL'
        + ' WHERE SBJT_CONF_ALL.idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER) + ' AND '
        + ' SB_SBJT_CONF.title like ' + mysql.escape('%'+ req.params.subTitle+'%')
        + ' GROUP BY SBJT_CONF_ALL.idSBJT_CONF_ALL '
        + ' ORDER BY SBJT_CONF_ALL.idSBJT_CONF_ALL DESC '
        app.conn.query(Q, (err, result)=>{
          if (err) {
            res.status(500).send(err);
            console.log(Q);
            console.log(err);
          } else {
            res.status(200).send(result);
          }
        })
      }
    )

    router.get(
      '/assigns/list/command/:command', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q= ' SELECT '
        + ' SBJT_CONF_ALL.idSBJT_CONF_ALL, '
        + ' SBJT_CONF_ALL.title, '
        + ' SBJT_CONF_ALL.idLECTURE, '
        + ' SBJT_CONF_ALL.idEXPERT_USER, '
        + ' SBJT_CONF_ALL.status, '
        + ' SBJT_CONF_ALL.ADD_TIME, '
        + ' SBJT_CONF_ALL.UPDATE_TIME '
        + ' FROM SBJT_CONF_ALL '
        + ' LEFT JOIN SB_SBJT_CONF '
        + ' ON SBJT_CONF_ALL.idSBJT_CONF_ALL = SB_SBJT_CONF.idSBJT_CONF_ALL'
        + ' WHERE SBJT_CONF_ALL.idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER) + ' AND '
        + ' SB_SBJT_CONF.command like ' + mysql.escape('%'+ req.params.command+'%')
        + ' GROUP BY SBJT_CONF_ALL.idSBJT_CONF_ALL '
        + ' ORDER BY SBJT_CONF_ALL.idSBJT_CONF_ALL DESC;'
        app.conn.query(Q, (err, result)=>{
          if (err) {
            res.status(500).send(err);
            console.log(Q);
            console.log(err);
          } else {
            res.status(200).send(result);
          }
        })
      }
    )

    router.get(
      '/patients/unregist/count', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q= ' SELECT (SELECT COUNT(idPATIENT_USER)) as count '
        + ' FROM PATIENT_USER '
        + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER) + ' AND '
        + ' idSBJT_CONF_ALL = ' + mysql.escape(1)
        app.conn.query(Q, (err, result)=>{
          if (err) {
            res.status(500).send(err);
            console.log(Q);
            console.log(err);
          } else {
            res.status(200).send(result);
          }
        })
      }
    )

    router.get(
      '/patients/count', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q= ' SELECT (SELECT COUNT(idPATIENT_USER)) as count '
        + ' FROM PATIENT_USER '
        + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER);
        app.conn.query(Q, (err, result)=>{
          if (err) {
            res.status(500).send(err);
            console.log(Q);
            console.log(err);
          } else {
            res.status(200).send(result);
          }
        })
      }
    )

    router.get(
    //Get Registered Jobs
    "/notices",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
        let Query:string = ' SELECT  * FROM NOTICE '
        + ' ORDER BY NOTICE.idNOTICE DESC;'
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(req.user) {
              if(err){
                console.log(err);
                res.status(500).json({success:false, msg:'Failed to Save'})
              } else {
                res.status(200).json(result)
              }
            } else {
              res.status(401).send('Not authenticated user')
            }
          }
        )
    })

    router.get(
    //Get Registered Jobs
    "/notices/title/:title",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
        let Query:string = ' SELECT  * FROM NOTICE '
        + ' WHERE title like ' + mysql.escape('%'+ req.params.title +'%')
        + ' ORDER BY NOTICE.idNOTICE DESC;'
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(req.user) {
              if(err){
                console.log(err);
                res.status(500).json({success:false, msg:'Failed to Save'})
              } else {
                res.status(200).json(result)
              }
            } else {
              res.status(401).send('Not authenticated user')
            }
          }
        )
    })

    router.get(
    //Get Registered Jobs
    "/notices/detail/:detail",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
        let Query:string = ' SELECT  * FROM NOTICE '
        + ' WHERE text like ' + mysql.escape('%'+ req.params.detail +'%')
        + ' ORDER BY NOTICE.idNOTICE DESC;'
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(req.user) {
              if(err){
                console.log(err);
                res.status(500).json({success:false, msg:'Failed to Save'})
              } else {
                res.status(200).json(result)
              }
            } else {
              res.status(401).send('Not authenticated user')
            }
          }
        )
    })

    router.post(
      '/notice', ensureAdminAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q = ' INSERT INTO NOTICE (title, text, author, UPDATE_TIME) '
        + 'VALUES ('
        + mysql.escape(req.body.title) + ' , '
        + mysql.escape(req.body.text) + ' , '
        + mysql.escape(req.body.author) + ' , '
        + ' NOW() ' + ')'
        + ' ON DUPLICATE KEY UPDATE '
        + ' text = ' + mysql.escape(req.body.text) + ' , '
        + ' author = ' + mysql.escape(req.body.author) + ' , '
        + ' UPDATE_TIME= NOW();'

        app.conn.query(Q, (err, result)=>{
          if (err) {
            console.log(err);
            console.log(Q);
            res.status(500).send(err);
          } else {
            res.status(200).send(result);
          }

        })
      }
    )

    router.delete(
      '/notice/:idNOTICE', ensureAdminAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q = ' DELETE FROM NOTICE '
        + 'WHERE idNOTICE = ' + mysql.escape(req.params.idNOTICE)
        app.conn.query(Q, (err, result)=>{
          if (err) {
            console.log(err);
            console.log(Q);
            res.status(500).send(err);
          } else {
            res.status(200).send(result);
          }

        })
      }
    )

    router.get(
    //Get Registered Jobs
    "/faqs",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
        let Query:string = ' SELECT  * FROM FAQ'
        + ' ORDER BY FAQ.idFAQ DESC;'
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(req.user) {
              if(err){
                console.log(err);
                res.status(500).json({success:false, msg:'Failed to Save'})
              } else {
                res.status(200).json(result)
              }
            } else {
              res.status(401).send('Not authenticated user')
            }
          }
        )
    })

    router.get(
    //Get Registered Jobs
    "/faqs/title/:title",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
        let Query:string = ' SELECT  * FROM FAQ'
        + ' WHERE title like ' + mysql.escape('%'+ req.params.title +'%')
        + ' ORDER BY FAQ.idFAQ DESC;'
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(req.user) {
              if(err){
                console.log(err);
                res.status(500).json({success:false, msg:'Failed to Save'})
              } else {
                res.status(200).json(result)
              }
            } else {
              res.status(401).send('Not authenticated user')
            }
          }
        )
    })

    router.get(
    //Get Registered Jobs
    "/faqs/detail/:detail",  ensureAuthenticated,
    (req:express.Request, res:express.Response) => {
        let Query:string = ' SELECT  * FROM FAQ '
        + ' WHERE text like ' + mysql.escape('%'+ req.params.detail +'%')
        + ' ORDER BY FAQ.idFAQ DESC;'
        app.conn.query(Query, (err:string, result:object) =>
          {
            if(req.user) {
              if(err){
                console.log(err);
                res.status(500).json({success:false, msg:'Failed to Save'})
              } else {
                res.status(200).json(result)
              }
            } else {
              res.status(401).send('Not authenticated user')
            }
          }
        )
    })

    router.post(
      '/faq', ensureAdminAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q = ' INSERT INTO FAQ (title, text, author, UPDATE_TIME) '
        + 'VALUES ('
        + mysql.escape(req.body.title) + ' , '
        + mysql.escape(req.body.text) + ' , '
        + mysql.escape(req.body.author) + ' , '
        + ' NOW() ' + ')'
        + ' ON DUPLICATE KEY UPDATE '
        + ' text = ' + mysql.escape(req.body.text) + ' , '
        + ' author = ' + mysql.escape(req.body.author) + ' , '
        + ' UPDATE_TIME= NOW();'

        app.conn.query(Q, (err, result)=>{
          if (err) {
            console.log(err);
            console.log(Q);
            res.status(500).send(err);
          } else {
            res.status(200).send(result);
          }

        })
      }
    )

    router.delete(
      '/faq/:idFAQ', ensureAdminAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q = ' DELETE FROM FAQ '
        + 'WHERE idFAQ = ' + mysql.escape(req.params.idFAQ)
        app.conn.query(Q, (err, result)=>{
          if (err) {
            console.log(err);
            console.log(Q);
            res.status(500).send(err);
          } else {
            res.status(200).send(result);
          }

        })
      }
    )

    router.get(
      '/survey/result/:idPATIENT_USER/:year', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q = " SELECT "
        + " SURVEY_RESULT.idSURVEY, "
        + " SURVEY_RESULT.POINT, "
        + " SBJTS.PUSH_TIME, "
        + " SURVEY_CONF.title "
        + " FROM DMHC.SURVEY_RESULT "
        + " RIGHT JOIN DMHC.SBJTS  "
        + " ON SURVEY_RESULT.idSBJTS = SBJTS.idSBJTS "
        + " RIGHT JOIN DMHC.SURVEY_CONF "
        + " ON SURVEY_RESULT.idSURVEY = SURVEY_CONF.idSURVEY "
        + " WHERE "
        + " SURVEY_RESULT.idPATIENT_USER = " + mysql.escape(req.params.idPATIENT_USER)
        + " AND SURVEY_CONF.idEXPERT_USER = " + mysql.escape(req.user.idEXPERT_USER)
        + " AND SBJTS.status = " + mysql.escape(1)
        + " AND SBJTS.PUSH_TIME BETWEEN '" + req.params.year
        + "-01-01' AND '" +  req.params.year + "-12-31' "
        + " ORDER BY PUSH_TIME DESC "
        app.conn.query(Q, (err, result)=>{
          if (err) {
            console.log(err);
            console.log(Q);
            res.status(500).send(err);
          } else {
            res.status(200).send(result);
          }

        })
      }
    )
    router.get(
      '/survey/list/:idPATIENT_USER/', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q = " SELECT DISTINCT "
        + " SURVEY_RESULT.idSURVEY, "
        + " SURVEY_CONF.title "
        + " FROM DMHC.SURVEY_RESULT "
        + " RIGHT JOIN DMHC.SURVEY_CONF "
        + " ON SURVEY_RESULT.idSURVEY = SURVEY_CONF.idSURVEY "
        + " WHERE "
        + " SURVEY_RESULT.idPATIENT_USER = " + mysql.escape(req.params.idPATIENT_USER)
        + " AND SURVEY_CONF.idEXPERT_USER = " + mysql.escape(req.user.idEXPERT_USER)
        app.conn.query(Q, (err, result)=>{
          if (err) {
            console.log(err);
            console.log(Q);
            res.status(500).send(err);
          } else {
            res.status(200).send(result);
          }

        })
      }
    )

    router.get(
      '/subjects/:idPATIENT_USER/:year/:month', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q = " SELECT "
        + " SBJTS.idSB_SBJT_CONF, "
        + " SBJT_CONF_ALL.title as groupName, "
        + " SB_SBJT_CONF.title as title, "
        + " SBJTS.command, "
        + " SBJTS.status, "
        + " SBJTS.PUSH_TIME "
        + " FROM DMHC.SBJTS "
        + " JOIN SB_SBJT_CONF "
        + " ON SBJTS.idSB_SBJT_CONF = SB_SBJT_CONF.idSB_SBJT_CONF "
        + " JOIN SBJT_CONF_ALL "
        + " ON SBJT_CONF_ALL.idSBJT_CONF_ALL = SB_SBJT_CONF.idSBJT_CONF_ALL "
        + " WHERE SBJTS.idPATIENT_USER = " + mysql.escape(req.params.idPATIENT_USER)
        + " AND SBJT_CONF_ALL.idEXPERT_USER = "  + mysql.escape(req.user.idEXPERT_USER)
        + " AND SBJTS.PUSH_TIME BETWEEN '"
        + req.params.year + "-" + req.params.month + "-01' AND '"
        + req.params.year + "-" + req.params.month + "-31'"
app.conn.query(Q, (err, result)=>{
          if (err) {
            console.log(err);
            console.log(Q);
            res.status(500).send(err);
          } else {
            res.status(200).send(result);
          }

        })
      }
    )

    router.put(
      '/assign/manage/:idPATIENT_USER/:idSBJT_CONF_ALL', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q = " UPDATE PATIENT_USER "
        + " SET idSBJT_CONF_ALL = " + mysql.escape(req.params.idSBJT_CONF_ALL)
        + " WHERE idPATIENT_USER = " + mysql.escape(req.params.idPATIENT_USER)
        app.conn.query(Q, (err, result)=>{
          if (err) {
            console.log(err);
            console.log(Q);
            res.status(500).send(err);
          } else {
            let url = config.domain + '/mobile/api/data/assign/now/' + req.params.idPATIENT_USER
            request(url, (err, Response, body) => {
              if(err) {res.status(500).send(err)}
              else {
                res.status(200).send(result);
              }
            })
          }
        })
      }
    )

    router.get(
      '/patients/list', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q = ' SELECT '
        + ' PATIENT_USER.idPATIENT_USER, '
        + ' PATIENT_USER.idSBJT_CONF_ALL, '
        + ' (SELECT title from SBJT_CONF_ALL WHERE idSBJT_CONF_ALL=PATIENT_USER.idSBJT_CONF_ALL) as assign, '
        + ' PATIENT_USER.name, '
        + ' PATIENT_USER.email, '
        + ' PATIENT_USER.phone, '
        + ' PATIENT_USER.birth, '
        + ' PATIENT_USER.gender, '
        + ' PATIENT_USER.LAST_LOGIN_DATE, '
        + ' PATIENT_USER.JOIN_DATE, '
        + ' (SELECT count(idSBJTS) FROM SBJTS WHERE idPATIENT_USER=PATIENT_USER.idPATIENT_USER) as all_sbjt, '
        + ' (SELECT count(status) FROM SBJTS WHERE idPATIENT_USER=PATIENT_USER.idPATIENT_USER and status=1) as fin_sbjt '
        + ' FROM DMHC.PATIENT_USER '
        + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER)
        app.conn.query(Q, (err, result)=>{
          if (err) {
            console.log(err);
            console.log(Q);
            res.status(500).send(err);
          } else {
            res.status(200).send(result);
          }

        })
      }
    )

    router.get(
      '/patients/list/name/:name', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q = ' SELECT '
        + ' PATIENT_USER.idPATIENT_USER, '
        + ' PATIENT_USER.idSBJT_CONF_ALL, '
        + ' (SELECT title from SBJT_CONF_ALL WHERE idSBJT_CONF_ALL=PATIENT_USER.idSBJT_CONF_ALL) as assign, '
        + ' PATIENT_USER.name, '
        + ' PATIENT_USER.email, '
        + ' PATIENT_USER.phone, '
        + ' PATIENT_USER.birth, '
        + ' PATIENT_USER.gender, '
        + ' PATIENT_USER.LAST_LOGIN_DATE, '
        + ' PATIENT_USER.JOIN_DATE, '
        + ' (SELECT count(idSBJTS) FROM SBJTS WHERE idPATIENT_USER=PATIENT_USER.idPATIENT_USER) as all_sbjt, '
        + ' (SELECT count(result) FROM SBJTS WHERE idPATIENT_USER=PATIENT_USER.idPATIENT_USER and result=1) as fin_sbjt '
        + ' FROM DMHC.PATIENT_USER '
        + ' WHERE idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER)
        + ' AND name like ' + mysql.escape('%' + req.params.name+ '%')
        app.conn.query(Q, (err, result)=>{
          if (err) {
            console.log(err);
            console.log(Q);
            res.status(500).send(err);
          } else {
            res.status(200).send(result);
          }

        })
      }
    )

    router.get(
      '/patients/list/assign/:title', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let Q = ' SELECT '
        + ' PATIENT_USER.idPATIENT_USER, '
        + ' PATIENT_USER.idSBJT_CONF_ALL, '
        + ' SBJT_CONF_ALL.title AS assign, '
        + ' PATIENT_USER.name, '
        + ' PATIENT_USER.email, '
        + ' PATIENT_USER.phone, '
        + ' PATIENT_USER.birth, '
        + ' PATIENT_USER.gender, '
        + ' PATIENT_USER.LAST_LOGIN_DATE, '
        + ' PATIENT_USER.JOIN_DATE, '
        + ' (SELECT count(idSBJTS) FROM SBJTS WHERE idPATIENT_USER=PATIENT_USER.idPATIENT_USER) as all_sbjt, '
        + ' (SELECT count(result) FROM SBJTS WHERE idPATIENT_USER=PATIENT_USER.idPATIENT_USER and result=1) as fin_sbjt '
        + ' FROM DMHC.PATIENT_USER '
        + ' JOIN SBJT_CONF_ALL ON SBJT_CONF_ALL.idSBJT_CONF_ALL = PATIENT_USER.idSBJT_CONF_ALL '
        + ' WHERE PATIENT_USER.idEXPERT_USER = ' + mysql.escape(req.user.idEXPERT_USER)
        + ' AND SBJT_CONF_ALL.title like ' + mysql.escape('%' + req.params.title+ '%')
        app.conn.query(Q, (err, result)=>{
          if (err) {
            console.log(err);
            console.log(Q);
            res.status(500).send(err);
          } else {
            res.status(200).send(result);
          }

        })
      }
    )



    router.post(
      '/qna', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        console.log(req.body);
        let Q = ' INSERT INTO QNA '
        + ' (title, author, text) '
        + ' VAlUES ( '
        + mysql.escape(req.body.title) + ' , '
        + mysql.escape(req.user.email) + ' , '
        + mysql.escape(req.body.text) + ' ) '
        app.conn.query(Q, (err, result)=>{
          if (err) {
            console.log(err);
            console.log(Q);
            res.status(500).send(err);
          } else {
            let mail = new MailService();
            mail.sendMail(mail.setMailOptions(req.body.title, req.body.text, true));
            res.status(200).send(result);
          }
        })
      }
    )

    router.post(
      '/qna/img', ensureAuthenticated,
      (req:express.Request, res:express.Response) => {
        let fileName = new Date().getTime().toString() + Math.floor(Math.random()*1000)
        let imgpath = path.join(config.assetPath, 'img', 'tmp', fileName)
        let imgBase64 = req.body.img.replace(/^data:([A-Za-z-+/]+);base64,/, '');
        fs.writeFile(imgpath, imgBase64, 'base64', (err)=>{
          if(err) {
            console.log(err);
          } else {
            res.status(200).send(fileName);
          }
        })
      }
    )



    function ensureAuthenticated(req, res, next) {
        // 로그인이 되어 있으면, 다음 파이프라인으로 진행
        if (req.isAuthenticated()) { return next(); }
        // 로그인이 안되어 있으면, login 페이지로 진행
        res.redirect(config.perpose + '/auth/fail');
    }

    function ensureAdminAuthenticated(req, res, next) {
        // 로그인이 되어 있으면, 다음 파이프라인으로 진행
        if (!req.isAuthenticated()) {
          return res.redirect(config.perpose + '/auth/fail');
        }
        let Q = 'SELECT * FROM ADMIN WHERE idEXPERT_USER = '
        + mysql.escape(req.user.idEXPERT_USER);
        app.conn.query(Q, (err, result)=>{
          if (result.length !== 0) {
            console.log(result.length);
            return next();
          } else {
            res.redirect(config.perpose + '/auth/fail');
          }
        })
        // 로그인이 안되어 있으면, login 페이지로 진행
    }
    return router;
    // res.json({success:true, msg:'Successfully saved'})
}
