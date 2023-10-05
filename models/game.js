const card = require('./card');
const Player = require('./player');

const moneyTickStep = 15;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

class Game {
    constructor(player1_sock) {
        this.sockets = [player1_sock];
        this.player1 = new Player(player1_sock.id);
        this.deck = [];
        this.game_started = false;
    }

    redirect_enemy_data(socket_id, enemy_data){
        if (this.player1.player_socket === socket_id)
            this.sockets[1].emit('set_enemy_data', enemy_data);
        else
            this.sockets[0].emit('set_enemy_data', enemy_data);
    }

    start_game(player2_sock){
        this.game_started = true;
        this.sockets.push(player2_sock);
        this.player2 = new Player(player2_sock.id);

        this.sockets[0].emit('get_your_data');
        this.sockets[1].emit('get_your_data');

        card.getAllCards((cards) => {
            this.deck = cards;
            shuffleArray(this.deck);
            this.player1.addCard(this.deck.pop());
            this.player1.addCard(this.deck.pop());
            this.player1.addCard(this.deck.pop());
            this.player2.addCard(this.deck.pop());
            this.player2.addCard(this.deck.pop());
            this.player2.addCard(this.deck.pop());
            this.sockets[0].emit('update_game', this.to_usergame(0), true);
            this.sockets[1].emit('update_game', this.to_usergame(1), true);
        });
    }

    gameChange(player_socket, cardsUsed){
        let player = this.player2;
        if (this.player1.player_socket === player_socket.id)
            player = this.player1;
        cardsUsed.forEach((cardId) => {
            let cost = player.moveCardToActiveCards(cardId);
            player.money -= cost;
        });
        player.ready = true;
        if (this.player1.ready === true && this.player2.ready === true){
            this.update_clients();
            setTimeout(() => {
                this.gameTick();
            }, 1000);
        }
    }

    async gameTick(){
        await this.player1.initialize_fight_new(this.player2, this.sockets);
        this.player1.money += moneyTickStep;
        this.player2.money += moneyTickStep;
        while (this.deck.length !== 0){
            if (this.player1.cards.length < 3 && this.deck.length !== 0)
                this.player1.addCard(this.deck.pop());
            if (this.player2.cards.length < 3 && this.deck.length !== 0)
                this.player2.addCard(this.deck.pop());
            if (this.player1.cards.length === 3 && this.player2.cards.length === 3)
                break;
        }
        this.is_game_end();
        this.update_clients(true);
    }

    is_game_end(){
        if (this.player1.hp <= 0){
            this.sockets[0].emit('endGame', 'You lose!');
            this.sockets[1].emit('endGame', 'You win!');
        }
        if (this.player2.hp <= 0){
            this.sockets[1].emit('endGame', 'You lose!');
            this.sockets[0].emit('endGame', 'You win!');
        }
    }

    finish_game(){
        this.sockets.forEach((socket) => {
            socket.emit('endGame', 'Your opponent is out!');
        });
    }

    update_clients(need_move){
        this.sockets[0].emit('update_game', this.to_usergame(0), need_move);
        this.sockets[1].emit('update_game', this.to_usergame(1), need_move);
        this.player1.ready = false;
        this.player2.ready = false;
    }

    to_usergame(side){
        let player1;
        let player2;
        let deck = this.deck;
        if (side === 1){
            player1 = this.player2;
            player2 = this.player1;
        }
        else {
            player1 = this.player1;
            player2 = this.player2;
            deck = this.deck;
        }
        return {player1, player2, deck};
    }
}

module.exports = { Game };