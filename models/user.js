const mysql = require('../db.js');
class User {
    constructor(login, pass, fullName, email) {
        this.login = login;
        this.pass = pass;
        this.fullName = fullName;
        this.email = email;
    }
    register_new(response) {
        mysql.registration(response, this);
    }
    login_check(response, session) {
        mysql.login(response, this, session);
    }
}

module.exports = User;