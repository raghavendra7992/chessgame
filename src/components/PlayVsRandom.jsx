import { useRef, useState } from 'react';
import {Chess} from 'chess.js';

import { Chessboard } from 'react-chessboard';

export default function PlayVsRandom({ boardWidth }) {
  const chessboardRef = useRef();
  const [game, setGame] = useState(new Chess());
  const [arrows, setArrows] = useState([]);
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [currentTimeout, setCurrentTimeout] = useState(undefined);

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  function makeRandomMove() {
    const possibleMoves = game.moves();

    // exit if the game is over
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0) return;

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    safeGameMutate((game) => {
      game.move(possibleMoves[randomIndex]);
    });
  }

  function onDrop(sourceSquare, targetSquare) {
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to a queen for example simplicity
    });
    setGame(gameCopy);

    // illegal move
    if (move === null) return false;

    // store timeout so it can be cleared on undo/reset so computer doesn't execute move
    const newTimeout = setTimeout(makeRandomMove, 200);
    setCurrentTimeout(newTimeout);
    return true;
  }

  return (
    <div>
      <Chessboard
        id="PlayVsRandom"
        animationDuration={200}
        boardOrientation={boardOrientation}
        boardWidth={boardWidth}
        customArrows={arrows}
        position={game.fen()}
        onPieceDrop={onDrop}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
        }}
        ref={chessboardRef}
      />
      <button
        className="rc-button"
        onClick={() => {
          safeGameMutate((game) => {
            game.reset();
          });
          // stop any current timeouts
          clearTimeout(currentTimeout);
        }}
      >
        reset
      </button>
      <button
        className="rc-button"
        onClick={() => {
          setBoardOrientation((currentOrientation) => (currentOrientation === 'white' ? 'black' : 'white'));
        }}
      >
        flip board
      </button>
      <button
        className="rc-button"
        onClick={() => {
          safeGameMutate((game) => {
            game.undo();
          });
          // stop any current timeouts
          clearTimeout(currentTimeout);
        }}
      >
        undo
      </button>
      <button
        className="rc-button"
        onClick={() => {
          setArrows([
            ['a3', 'a5'],
            ['g1', 'f3']
          ]);
        }}
      >
        Set Custom Arrows
      </button>
    </div>
  );
}