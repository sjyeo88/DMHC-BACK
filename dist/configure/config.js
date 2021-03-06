"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passwords_1 = require("./passwords");
class ServerConfig {
    constructor() {
        this.jwt_password = passwords_1.security.jwt_password;
        this.assetPath = 'assets';
        this.fileStoragePath = './assets';
        this.domain = 'http://localhost:3000';
        this.frontDomain = 'http://localhost:4200';
        this.perpose = '/api';
        this.fullDomain = this.domain + this.perpose;
        this.adminMailPassword = passwords_1.security.adminMailPassword;
        this.dbSetting = {
            host: passwords_1.security.sqlHost,
            user: 'root',
            password: passwords_1.security.sqlPassword,
            port: 3306,
            database: passwords_1.security.sqlDB,
        };
    }
}
exports.ServerConfig = ServerConfig;
