const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const http = require('http');
const socket = require('socket.io');
const game = require('./models/game');

const User = require("./models/user");
const Db = require("./db");
const card = require('./models/card');
const {response} = require("express");

const app = express();

const server = http.createServer(app);
const io = new socket.Server(server);

const PORT = process.env.PORT || 3000;

app.use(
    session({
        secret: 'session secret',
        resave: false,
        saveUninitialized: true
    })
);

let ses;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/loginCheck", (req, res) => {
    ses = req.session;
    const { login, password } = req.body;
    const user = new User(login, password);
    user.login_check(res, ses);
});

app.post("/logout", (req, res) => {
    ses = req.session;
    ses.is_authorized = false;
    ses.status = null;
    res.json({state: 1});
});

app.post("/getAccData", (req, res) => {
    ses = req.session;
    let accountId = ses.accid;
    if (req.body.userid)
        accountId = req.body.userid
    Db.getAccData(res, accountId);
});

app.post("/changeNickname", (req, res) => {
    ses = req.session;
    let accountId = ses.accid;
    if (accountId && req.body.new_nickname)
        Db.change_nickname(accountId, req.body.new_nickname);
});

app.get('/login', function (request, response) {
    ses = request.session;
    if (ses.is_authorized)
        response.redirect('/profile');
    else
        response.sendFile(__dirname + '/views/login.html');
});

app.get('/profile', function (request, response) {
    ses = request.session;
    if (ses.is_authorized)
        response.sendFile(__dirname + '/views/profile.html');
    else
        response.redirect('/login');
});

app.post("/updateAvatar", (req, res) => {
    ses = req.session;
    let accountId = ses.accid;
    Db.change_avatar(res, accountId, req.body.new_avatar);
});

app.get('/avatarChange', function (request, response) {
    ses = request.session;
    if (ses.is_authorized)
        response.sendFile(__dirname + '/views/avatar_selector.html');
    else
        response.redirect('/login');
});

app.get('/game', function (request, response) {
    ses = request.session;
    if (ses.is_authorized)
        response.sendFile(__dirname + '/views/game.html');
    else
        response.redirect('/registration');
});

app.get('/style.css', function (request, response) {
    response.sendFile(__dirname + '/public/style.css')
});

app.get('/game.css', function (request, response) {
    response.sendFile(__dirname + '/public/game.css')
});

app.get('/', function (request, response) {
    response.redirect('/registration');
});

app.post("/register", (req, res) => {
    const { login, password, full_name, email } = req.body;
    const user = new User(login, password, full_name, email);
    user.register_new(res);
});

app.get('/registration', function (request, response) {
    response.sendFile(__dirname + '/views/registration.html');
});

app.post("/remindPass", (req, res) => {
    Db.check_email(res, req.body.email);
});

app.get('/recovery', function (request, response) {
    response.sendFile(__dirname + '/views/remindPass.html');
});

app.get('/rules', function (request, response) {
    response.sendFile(__dirname + '/views/rules.html');
});

app.post("/getCardById", (req, res) => {
    card.getCardById(req.body.cardid, (card) => {res.json(card)})
});

app.get('/get-image/:imgName', (req, res) => {
    const imageName = req.params.imgName;
    const imagePath = __dirname + '/images/' + imageName;
    res.sendFile(imagePath);
});

app.get('/get-card/:cardName', (req, res) => {
    const cardName = req.params.cardName;
    const cardPath = __dirname + '/images/svg_cards/' + cardName;
    res.sendFile(cardPath);
});

let matches = [];

io.on('connection', (socket) => {
    let match = matches[matches.length-1];
    if (match && match.game_started === false){
        match.start_game(socket);
    }
    else {
        match = new game.Game(socket, matches.length);
        matches.push(match);
    }

    socket.on('my_data', (enemy_data) => {
        match.redirect_enemy_data(socket.id, enemy_data);
    });

    socket.on('game_change', (changes) => {
        if (match){
            match.gameChange(socket, changes);
        }
    });
    socket.on('disconnect', () => {
        if (match){
            match.finish_game();
        }
    });
});

server.listen(3000, () => {
    console.log(`Сервер запущен http://localhost:${PORT}`);
});

