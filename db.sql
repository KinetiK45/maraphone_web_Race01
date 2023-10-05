DROP DATABASE IF EXISTS u_card_game;

CREATE DATABASE IF NOT EXISTS u_card_game;
CREATE USER IF NOT EXISTS 'dljubyvyj'@'localhost' IDENTIFIED BY 'securepass';
GRANT ALL PRIVILEGES ON u_card_game.* TO 'dljubyvyj'@'localhost';
FLUSH PRIVILEGES;

USE u_card_game;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(255) NOT NULL UNIQUE,
    pass VARCHAR(255) NOT NULL,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    avatar VARCHAR(255) NOT NULL DEFAULT 'default.png',
    status VARCHAR(255) NOT NULL DEFAULT 'User'
);

CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attack INT NOT NULL,
    defence INT NOT NULL,
    cost INT NOT NULL,
	description VARCHAR(255) NOT NULL DEFAULT 'No Data',
    image VARCHAR(255) NOT NULL
);

INSERT INTO cards (attack, defence, cost, description, image) VALUES
    (5, 3, 8, 'Black Panther', 'BlackPanther.svg'),
    (8, 2, 10, 'Altron', 'Altron.svg'),
    (6, 4, 10, 'Green Goblin', 'GreenGoblin.svg'),
    (4, 5, 9, 'Rocket Raccoon', 'RocketRaccoon.svg'),
    (3, 6, 9, 'Ant-Man', 'Ant-Man.svg'),
    (7, 2, 9, 'Groot', 'Groot.svg'),
    (4, 3, 7, 'Scarlet Witch', 'Scarlet Witch.svg'),
    (3, 7, 10, 'Hawkeye', 'Hawkeye.svg'),
    (6, 4, 10, 'Spider-Man', 'Spider-Man.svg'),
    (5, 4, 9, 'Captain America', 'CaptainAmerica.svg'),
    (7, 5, 12, 'Hela', 'Hela.svg'),
    (8, 6, 14, 'Surtur', 'Surtur.svg'),
    (6, 6, 12, 'Captain Marvel', 'CaptainMarvel.svg'),
    (7, 7, 14, 'Hulk', 'Hulk.svg'),
    (8, 8, 16, 'Thanos', 'Thanos.svg'),
    (6, 7, 13, 'Deadpool', 'Deadpool.svg'),
    (7, 8, 15, 'Iron Man', 'IronMan.svg'),
    (5, 5, 10, 'Venom', 'Venom.svg'),
    (6, 6, 12, 'Doctor Strange', 'DoctorStrange.svg'),
    (5, 8, 13, 'Odin', 'Odin.svg');




