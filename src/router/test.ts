import * as express from "express";
let router = express.Router();
import  path  = require('path');
import  fs = require('fs');
import { ServerConfig } from "../configure/config";


module.exports = function(app):express.Router{
router.get(
//Get Registered Jobs
"/",
(req:express.Request, res:express.Response) => {
  let result = 'Result'
  let getConfirmEmailString2 = (file, opt?:string[]):string => {
    let result:string
    fs.readFile(file, 'utf-8', (err, data)=>{
      if(err) console.log(err);
      else {
        // console.log(data);
        if(opt) {
          for (let i=0; i < opt.length; i++) {
            let re =new RegExp('<#' + i.toString() + '\\s.*\\s=>');
            data = data.replace(re, opt[i]);
          }
        }
          result = data
      }
    })
    return result
  }
  let a = ['AAA', 'BBB', 'CCC'];
  let opt = {}
  getConfirmEmailString2('assets/welcome.html', a);
  res.status(300).send(result);

})



  return router;
}; //end of module
