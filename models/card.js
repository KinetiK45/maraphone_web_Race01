const connection = require('./../db').connection;

class Card {
    constructor(id, attack, defence, cost, description, image) {
        this.id = id;
        this.attack = attack;
        this.defence = defence;
        this.cost = cost;
        this.description = description;
        this.image = image;
    }

    fight(opponentCard){
        this.defence -= opponentCard.attack;
        if (this.defence > 0)
            opponentCard.defence -= this.attack;
    }

    is_dead(){
        return this.defence <= 0;
    }

    toString(){
        return `${this.attack} ${this.defence}`;
    }

}

function getCardById(id, callback) {
    const sql = 'SELECT * FROM cards WHERE id = ?';
    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Ошибка при запросе карточки по id:', err);
            callback(err, null);
        } else {
            if (results.length > 0) {
                const cardData = results[0];
                const card = new Card(
                    cardData.id,
                    cardData.attack,
                    cardData.defence,
                    cardData.cost,
                    cardData.description,
                    cardData.image
                );
                callback(card);
            } else {
                console.log('Карточка не найдена');
                callback(null);
            }
        }
    });
}

// Функция для получения всех карт из базы данных
function getAllCards(callback) {
    const query = 'SELECT * FROM cards';
    connection.query(query, (err, results) => {
        if (err) {
            callback(null);
            return;
        }

        const cards = results.map((row) => {
            return new Card(row.id, row.attack, row.defence, row.cost, row.description, row.image);
        });

        callback(cards);
    });
}

module.exports = {Card: Card,
    getCardById: getCardById,
    getAllCards: getAllCards
};
