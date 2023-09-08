export default class Player {
    /**
     * 
     * @param {string} type the type of player, human or bot
     * @param {string} triangle related triangle to the player
     */
    constructor({
        name = "guest",
        type = "human",
        color = null,
        picture = "",
        triangle = null
    }) {
        this.name = name;
        this.type = type;
        this.rank = null;
        this.color = color;        
        this.picture = picture;
        this.triangle = triangle;        
        this.pegInHand = null;
    }

    /**
     * selects a peg in the spot to move it.
     * @param {Spot} spot 
     */
    select(peg) {
        this.pegInHand = peg;
        return this;
    }

    /**
     * the sign of the player's pegs, is the same as
     * player triangle name (A, B, C, D, E or F).
     */
    getPegName() {
        return this.triangle;
    }
}