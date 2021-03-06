//Remove 0 on file names
import { security } from './passwords'

export interface setInputInterface {
  host:string,
  user:string,
  password:string,
  port:number,
  database:string
}

export class ServerConfig {
  public jwt_password:string = security.jwt_password;
  public assetPath:string = 'assets'
  public fileStoragePath:string = './assets'
  public domain:string = 'https://dailydmhc.com'
  public frontDomain:string = 'https://dailydmhc:4200'
  public perpose:string = '/api' //When Upload server make to ''
  public fullDomain = this.domain + this.perpose;
  public adminMailPassword:string = security.adminMailPassword;

  dbSetting:setInputInterface = {
    host:  security.sqlHost,
    user: 'root',
    password: security.sqlPassword,
    port: 3306,
    database: security.sqlDB,
  }
  constructor() {}
}
