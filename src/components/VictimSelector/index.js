/* 
КОМПОНЕНТ ПРИНИМАЕТ:

1. Кол-во оставшихся голосов
2. Информацию о том, за последниго ли игрока голосуют

КОМПОНЕНТ ВОЗВРАЩАЕТ: значение нажатой кнопки
*/

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { range } from 'lodash';

import { playersSelector } from 'redux/selectors';

import { VotingSingleElement, VotingBlock } from './style';

export default ({ lastPlayer, votesLeft, shooting, onNumberSelected }) => {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const players = useSelector(playersSelector);

  const selectNumber = num => {
    if (lastPlayer) return; // Отключает возможность снять голос с последнего игрока

    onNumberSelected(num);
    setSelectedNumber(num === selectedNumber ? null : num);
  };

  return (
    <VotingBlock className='col-10 col-md-8 col-lg-6'>
      {range(0, 10).map(num => (
        <VotingSingleElement
          shooting={shooting}
          selected={lastPlayer ? num === votesLeft : selectedNumber === num}
          disabled={shooting ? !players[num].isAlive : lastPlayer ? num !== votesLeft : num > votesLeft}
          onClick={() => selectNumber(num)}
          key={num}
        >
          <div className='number'>{num + 1}</div>
        </VotingSingleElement>
      ))}
    </VotingBlock>
  );
};
