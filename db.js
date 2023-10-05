const fs = require('fs');
const mysql = require("mysql2");
const nodemailer = require("nodemailer");

const config_db = JSON.parse(fs.readFileSync('./config.json', 'UTF-8'));
const connection = mysql.createConnection({
    host : config_db.host,
    user : config_db.user,
    database : config_db.database,
    password : config_db.password
});

const transporter = nodemailer.createTransport({
    host: 'smtp.rambler.ru',
    port: 465,
    secure: true,
    auth: {
        user: 'mangala.shroff@rambler.ru',
        pass: '6kxcTs8rgr'
    }
});
function registration(response, user) {
    const sql = 'INSERT INTO users SET ?';
    try {
        connection.query(sql, user, function (err, rows) {
            if (err) {
                let err_msg = err.message;
                if (err.message.includes('Duplicate entry')){
                    err_msg = 'User with these credentials already exists.';
                }
                response.json({state: 0, msg: err_msg});
            }
            else
                response.json({state: 1, msg: 'Registration success'});
        })
    } catch (e){
        response.json({state: 0, msg: e.toString()});
    }

}
function check_user(response, user, session) {
    const sql = 'SELECT * FROM users WHERE login = ?';

    connection.query(sql, user.login, function (err, rows) {
        if (err) {
            response.json({ state: 0, msg: err.message });
        }
        else if (rows.length === 1 && rows[0].pass === user.pass) {
            session.is_authorized = true;
            session.accid = rows[0].id;
            session.status = rows[0].status;
            response.json({ state: 1, msg: 'Success' });
        }
        else if (rows.length === 1){
            response.json({ state: 0, msg: 'Incorrect password' });
        }
        else {
            response.json({ state: 0, msg: 'User not found' });
        }
    });
}
function check_email(response, email) {
    const sql = 'SELECT * FROM users WHERE email = ?';

    connection.query(sql, email, function (err, rows) {
        if (err) {
            response.json({ state: 0, msg: err.message });
        }
        else if (rows.length === 1) {
            let password = rows[0].pass;

            const mailOptions = {
                from: 'mangala.shroff@rambler.ru',
                to: rows[0].email,
                subject: 'Password recovery',
                html: `<p>Dear user.</p>
                       <p>Your password is: ${password}</p>
                       <p>If you didn't do this, please ignore this message.</p>`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    response.json({ state: 0, msg: error.toString() });
                } else {
                    response.json({ state: 1, msg: 'Password was successfully send to your email' });
                }
            });
        }
        else {
            response.json({ state: 0, msg: 'User with this email not found' });
        }
    });
}

function getAccData(response, userid) {
    const sql = 'SELECT * FROM users WHERE id = ?';

    connection.query(sql, userid, function (err, rows) {
        if (err) {
            response.json({ state: 0, msg: err.message });
        }
        else if (rows.length === 1 && rows[0].id === userid) {
            response.json({ state: 1, msg: 'Success', userdata: rows[0] });
        }
        else if (rows.length === 1){
            response.json({ state: 0, msg: 'Incorrect password' });
        }
        else {
            response.json({ state: 0, msg: 'User not found' });
        }
    });
}

function change_avatar(response, userId, newAvatar) {
    const checkUserQuery = 'SELECT * FROM users WHERE id = ?';
    connection.query(checkUserQuery, [userId], (error, results) => {
        if (error) {
            console.error('Ошибка при проверке пользователя:', error);
            response.status(500).json({ error: 'Ошибка на сервере' });
        } else {
            if (results.length === 0) {
                response.status(404).json({ error: 'Пользователь не найден' });
            } else {
                const updateUserQuery = 'UPDATE users SET avatar = ? WHERE id = ?';
                connection.query(updateUserQuery, [newAvatar, userId], (error) => {
                    if (error) {
                        console.error('Ошибка при обновлении аватара:', error);
                        response.status(500).json({ error: 'Ошибка на сервере' });
                    } else {
                        response.json({ state: 1, msg: 'success' });
                    }
                });
            }
        }
    });
}

function change_nickname(accid, newNickname) {
    connection.query(
        'UPDATE users SET fullName = ? WHERE id = ?',
        [newNickname, accid],
        (err, results) => {
            if (err) {
                console.error('Ошибка при обновлении псевдонима:', err);
            }
        }
    );
}


module.exports = {
    connection: connection,
    login: check_user,
    registration: registration,
    check_email: check_email,
    getAccData: getAccData,
    change_avatar: change_avatar,
    change_nickname: change_nickname
}