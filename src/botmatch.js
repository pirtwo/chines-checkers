import { utils } from "pixi.js";

export default class BotMatch {
    constructor(board) {
        this.board = board;
        this.tween = window.tweenManager;
        this.onWinCallback = null;
        this.onLoseCallback = null;
    }

    start(player, bots) {
        let players = [],
            winners = [],
            gameOver = false;

        // sort player based on their triangle
        // player with index 0 starts the game
        players = [player, ...bots]
            .sort((a, b) => a.triangle < b.triangle ? -1 : 1);

        // hook board manager too bots
        bots.forEach(bot => {
            bot.boardManager = this.board;
        });

        this.board
            .setPlayers(players)
            .setPlayer(player)
            .setTurn(players[0])
            .newGame();

        // highlight first player avatar
        players[0].avatar.setHighlight(true);

        // bot match logic
        this.board.onMoveExecuted = (currPlayer) => {
            if (gameOver || this.board.players.length === 0)
                return;

            let nextPlayer = this.board.nextTurn();

            // turn off all highlight
            this.board
                .players
                .forEach(p => p.avatar.setHighlight(false));

            // highlight current player
            nextPlayer.avatar.setHighlight(true);

            // check for winner
            if (currPlayer === player) {
                if (this.board.checkWin(player) || this.board.players.length === 1) {
                    gameOver = true;
                    winners.push(player);
                    player.rank = winners.length;

                    if (player.rank === 1) {
                        // player won with rank 1
                        this.onWinCallback();
                    } else {
                        // player won with rank less than 1
                        this.onLoseCallback(winners);
                    }
                }
            } else {
                if (this.board.checkWin(currPlayer)) {
                    winners.push(currPlayer);
                    currPlayer.rank = winners.length;
                    currPlayer.avatar.showRank(currPlayer.rank);
                    this.board.players.splice(
                        this.board.players.indexOf(currPlayer), 1);
                }
            }

            if (nextPlayer.type === "bot")
                this.tween.wait(1000).then(() => nextPlayer.play());
        }

        // vibrate device
        this.board.onTurnChanged = (currPlayer) => {
            if (currPlayer === player && utils.isMobile.any) {
                window.navigator.vibrate(100);
            }
        }

        // start the bot match        
        if (players[0].type === "bot")
            players[0].play();
    }
}