import React, { useEffect, useState } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';

import useOnMount from 'helpers/useOnMount';
import { clearSelectedNumbers, addToSelectedNumbers, changeGameState, skipVotingDec } from 'redux/actions/gameActions';
import checkForEnd from 'helpers/checkForEnd';
import { useCustomRef } from 'helpers/useCustomRef';

import EndOfVoting from './EndOfVoting';
import CarCrash from './CarCrash';
import ResetButton from './ResetButton';
import StandartVoting from './StandartVoting';

export default () => {
  const dispatch = useDispatch();
  const {
    players,
    game: {
      selectedNumbers,
      skipVoting,
      gameState: { dayNumber },
    },
  } = useSelector(store => store);

  const [initialSelectedNumbers] = useCustomRef(selectedNumbers);
  const initialVotesPerPlayer = Array(selectedNumbers.length).fill(0);

  const [votesPerPlayer, setVotesPerPlayer] = useState(initialVotesPerPlayer); // Кол-во проголосовавших за каждого игрока
  const [carCrash, setCarCrash] = useState(false); // Стадия автокатастрофы. 0 - нет. 1 - переголосовка. 2 - Повторная ничья. НУЖНО ПРОВЕРИТЬ, ИСПОЛЬЗУЕТСЯ ЛИ 2 УРОВЕНЬ.
  const [carCrashClosed, setCarCrashClosed] = useState(false); // true, после первой автокатастрофы
  const [endOfVoting, setEndOfVoting] = useState(false);
  const [lastMinuteFor, setLastMinuteFor] = useState([]); // Игрок(и), которых выводят из города

  const resetState = replaceState => {
    setVotesPerPlayer(initialVotesPerPlayer);
    setCarCrash(false);
    setCarCrashClosed(replaceState?.carCrashClosed ?? false);
    setEndOfVoting(false);
    setLastMinuteFor([]);
  };

  useEffect(() => {
    // При обновлении компонента, при необходимых условиях, завершаем игру
    checkForEnd(players).status && dispatch(changeGameState({ phase: 'EndOfGame' }));
  });

  useEffect(() => {
    return () => dispatch(clearSelectedNumbers()); // Это нужно, чтобы не показывать кого убили, если конец игры, т.к это голосование.
  }, [dispatch]);

  const getNewVotingList = () => {
    const largestNumber = Math.max(...votesPerPlayer); // Вычисляем максимальное кол-во проголосовавших в одного игрока
    const newVotingList = [];
    votesPerPlayer.filter((el, i) => el === largestNumber && newVotingList.push(selectedNumbers[i]));
    // Если макс. число одно, то в новом списке будет 1 игрок, которого и выгонят. Если будет больше, то в массив будут добавлятся игроки с одинаковым кол-вом голосов

    return newVotingList;
  };

  const votingFinishedClicked = killAll => {
    const newVotingList = getNewVotingList();

    if (newVotingList.length === 1) {
      // Если остался 1 игрок, то он умирает
      setEndOfVoting(true);
      setLastMinuteFor(lastMinuteFor.concat(newVotingList[0]));
    }

    // УБИЙСТВО ВСЕХ ПОСЛЕ АВТОКАТАСТРОФЫ
    if (killAll === true) {
      setEndOfVoting(true);
      setLastMinuteFor(lastMinuteFor.concat(selectedNumbers));
    }

    // УБИЙСТВО НИКОГО ПОСЛЕ АВТОКАТАСТРОФЫ
    if (killAll === false) {
      setEndOfVoting(true);
      setLastMinuteFor([]);
      return;
    }

    // ВКЛЮЧЕНИЕ АВТОКАТАСТРОФЫ
    if (newVotingList.length > 1) {
      // Если выставлено больше 2 игроков
      if (!carCrashClosed) {
        batch(() => {
          // Первый раз одинаковое кол-во голосов
          dispatch(clearSelectedNumbers());
          newVotingList.map(num => dispatch(addToSelectedNumbers(num)));
        });
      }
      setCarCrash(true);
    }
  };

  useOnMount(() => {
    // Если не 1-ый день и выставлен только 1 игрок и не пропускается голосование, заканчиваем голосование убивая единственного выставленного игрока
    if (dayNumber > 1 && selectedNumbers.length === 1 && !skipVoting) votingFinishedClicked();

    if ((dayNumber === 1 && selectedNumbers.length === 1) || skipVoting) setEndOfVoting(true);
  });

  useEffect(() => {
    return () => {
      const numberOfVotedOutPlayersWithFourthFoul = lastMinuteFor.filter(plNum => !players[plNum].isAlive).length;

      if (skipVoting && lastMinuteFor.length !== 0) {
        for (let i = 0; i < numberOfVotedOutPlayersWithFourthFoul; i++) dispatch(skipVotingDec());
      }
    };
  });

  const resetVoting = () => {
    if (window.confirm('Сбросить голосование?')) {
      resetState();

      batch(() => {
        dispatch(clearSelectedNumbers());
        initialSelectedNumbers.forEach(num => dispatch(addToSelectedNumbers(num)));
      });
    }
  };

  if (endOfVoting || skipVoting)
    return (
      <EndOfVoting
        resetFn={resetVoting}
        votingSkipped={(skipVoting && lastMinuteFor.length === 0) || (dayNumber === 1 && selectedNumbers.length === 1)}
        lastMinuteFor={lastMinuteFor}
      />
    );

  if (carCrash)
    return (
      <>
        <ResetButton onClick={resetVoting} />

        <CarCrash
          closeCarCrash={() => resetState({ carCrashClosed: true })}
          secondTime={carCrashClosed}
          votingFinishedClicked={votingFinishedClicked}
        />
      </>
    );

  return (
    <StandartVoting
      votesPerPlayer={votesPerPlayer}
      setVotesPerPlayer={setVotesPerPlayer}
      votingFinishedClicked={votingFinishedClicked}
      resetVoting={resetVoting}
      carCrashClosed={carCrashClosed}
    />
  );
};
