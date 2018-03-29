import * as passport from "passport"
import * as pbkdf2Password from "pbkdf2-password"
import * as moment from "moment"
import { UserDATA } from "./interfaces/userdata.interface"

let LocalStrategy  = require("passport-local").Strategy;
let hasher:pbkdf2Password  = pbkdf2Password();
let mysql = require('mysql')



export class AuthStrategy {
    constructor(app){
    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser((id, done) => {
      let sql = 'SELECT * FROM EXPERT_USER WHERE idEXPERT_USER=' +
      mysql.escape(id);
      app.conn.query(sql, [id], (err, results)=>{
        if(err){
          done(null, null);
        } else {
          done(null, results[0]);
        }
      });
    });

    passport.use(new LocalStrategy(
      {
         usernameField:"email",
         passwordField:"password",
      },
      function(email:string, password:string, done:any){
        let mail:string = email;
        let pwd:string = password;
        let sql = 'SELECT * FROM EXPERT_USER WHERE email= ' + mysql.escape(email);

        app.conn.query(sql, email, (err, results) => {
          if(err){
            return done(err);
          }
          let user:UserDATA = results[0];
          if(!results.length) {
            return done(null, null);
          }
          // console.log(user);
          hasher({password:pwd, salt:user.salt},

            function(err, pass, salt, hash){
              console.log('salt', salt);
              console.log('password', password);
            if(hash === user.password){
              return done(null, user.idEXPERT_USER);
            } else {
              return done(null, null);
            }
            }
          );
        });
      }
    ));
  }

}
