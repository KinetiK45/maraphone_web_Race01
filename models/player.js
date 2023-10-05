class Player {
    constructor(player_socket_id) {
        this.activeCards = [];
        this.cards = [];
        this.hp = 20;
        this.money = 15;
        this.player_socket = player_socket_id;
        this.ready = false;
    }

    async initialize_fight_new(opponent, sockets){
        if (this.activeCards.length === 0 && opponent.activeCards.length === 0)
            return;
        let que = [];
        for (let i = 0; i < (this.activeCards.length > opponent.activeCards.length ?
            this.activeCards.length : opponent.activeCards.length); i++) {
            if (this.activeCards[i])
                que.push(this.activeCards[i]);
            if (opponent.activeCards[i])
                que.push(opponent.activeCards[i]);
        }
        for (let queElement of que) {
            await this.fight_with_cards(queElement.id, opponent, sockets);
        }
    }

    async fight_with_cards(cardId, opponent, sockets){
        let index, card_attack;
        if ((index = this.activeCards.findIndex(card => card.id === cardId)) !== -1){
            card_attack = opponent.getDamage(this.activeCards[index]);
        }
        else if ((index = opponent.activeCards.findIndex(card => card.id === cardId)) !== -1){
            card_attack = this.getDamage(opponent.activeCards[index]);
        }
        else
            return;
        sockets[0].emit('card_attack', card_attack);
        sockets[1].emit('card_attack', card_attack);
        opponent.removeCardsWithLowDefence();
        this.removeCardsWithLowDefence();
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return card_attack;
    }
    getDamage(card){
        if (this.activeCards.length === 0){
            this.hp -= card.attack;
            return {attack: card, defence: null};
        }
        else {
            const random_index = Math.floor(Math.random() * this.activeCards.length);
            const random_card = this.activeCards[random_index];
            card.fight(random_card);
            return {attack: card, defence: random_card};
        }
    }

    addCard(card){
        this.cards.push(card);
    }

    moveCardToActiveCards(cardId) {
        const cardIndex = this.cards.findIndex(card => card.id === cardId);
        let cost = 0;
        if (cardIndex !== -1) {
            const cardToMove = this.cards.splice(cardIndex, 1)[0];
            cost = cardToMove.cost;
            this.activeCards.push(cardToMove);
        }
        return cost;
    }

    removeCardsWithLowDefence() {
        let new_arr = [];
        this.activeCards.forEach((card) => {
            if (!card.is_dead())
                new_arr.push(card);
        });
        this.activeCards = new_arr;
    }
}

module.exports = Player;
