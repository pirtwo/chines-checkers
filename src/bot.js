import {
    calcDistance
} from "./lib/utils";
import Player from "./player";

export default class BotPlayer extends Player {
    constructor({
        name = "BOT",
        color,
        picture,
        triangle,
        boardManager
    }) {
        super({
            name: name,
            type: "bot",
            color: color,
            picture: picture,
            triangle: triangle
        });

        this.boardManager = boardManager;
    }

    play() {
        let target = null,
            pegs = [],
            best = null,
            moves = [],
            boardCenter = {
                x: 0,
                y: 9
            };

        pegs = this.boardManager.pegs.children.filter(n => n.name === this.triangle);

        let emptySpots = []; // empty spots in home triangle
        let oppTri = this.boardManager.getHomeTriangle(this.triangle);
        for (let i = 0; i < oppTri.indexes.length; i++) {
            const idx = oppTri.indexes[i];
            if (this.boardManager.state[idx].peg === null)
                emptySpots.push(this.boardManager.state[idx]);
        }

        // we select the most far spot as a target,
        // if all spots is full then select peak of
        // triangle as a target. 
        emptySpots.sort(
            (a, b) => calcDistance(b, boardCenter) - calcDistance(a, boardCenter));
        target = emptySpots.length > 0 ? emptySpots[0] : this.boardManager.state[oppTri.peak];

        // for each peg, calculate the score of possible moves
        for (let i = 0; i < pegs.length; i++) {
            const currPeg = pegs[i];

            this.boardManager.getRoutes(this, currPeg.spot).forEach(dest => {
                let totalDist = calcDistance(dest, target);

                // rule 1: punish moving pegs in home triangle 
                // toward board center. (moving away from target)
                if (currPeg.spot.triangle === oppTri.name &&
                    calcDistance(dest, boardCenter) <= calcDistance(currPeg.spot, boardCenter)) {
                    totalDist = totalDist + 100;
                }

                // rule 2: reward moving pegs into the home triangle.
                if (currPeg.spot.triangle != oppTri.name &&
                    dest.triangle === oppTri.name) {
                    totalDist = totalDist - 100;
                }

                pegs.filter(n => n != currPeg).forEach(peg => {
                    totalDist += calcDistance(peg.spot, target);
                });

                moves.push({
                    peg: currPeg,
                    dest: dest,
                    score: totalDist
                });
            });
        }

        // we select the best move based on minimization
        // of total distance of pegs from target (spots in home triangle).
        best = moves.sort((a, b) => a.score - b.score)[0];

        if (best)
            this.boardManager.move(best.peg, best.dest);
        else
            this.boardManager.nextTurn();
    }
}