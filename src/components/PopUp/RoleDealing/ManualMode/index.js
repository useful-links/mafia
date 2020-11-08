import React from 'react';
import { useSelector, useDispatch, batch } from 'react-redux';
import { countBy } from 'lodash';

import { addRole } from 'redux/actions/playersActions';
import { numbersPanelClickable, addToSelectedNumbers } from 'redux/actions/gameActions';
import colors from 'style/colors';
import { ThumbDownIcon, DonRingIcon, ThumbUpIcon, SheriffOkIcon } from 'icons/svgIcons';
import { PopUpButton } from 'components/PopUp/styled-components';
import useOnMount from 'helpers/useOnMount';
import { gameSelector, playersSelector } from 'redux/selectors';

import { Notification, RoleCard, RoleSelection, RoleSelectionWrapper } from './style';
import useResetMode from '../useResetMode';
import startGame from '../startGame';

const { popupIconLight, popupIcon } = colors.RoleDealing;

export default ({ resetMode }) => {
  const dispatch = useDispatch();
  const players = useSelector(playersSelector);
  const { selectedNumbers } = useSelector(gameSelector);

  useResetMode(resetMode);

  useOnMount(() => {
    batch(() => {
      dispatch(addToSelectedNumbers(0));
      dispatch(numbersPanelClickable());
    });
  });

  const [playerNumber] = selectedNumbers;

  const changeSelection = (role, disabled) => {
    if (disabled) return;

    dispatch(addRole({ playerNumber, role }));
  };

  const currentPlayerRole = players[playerNumber]?.role || null;

  const { МАФИЯ, ШЕРИФ, ДОН } = countBy(players.map(({ role }) => role));
  const isButtonDisabled = МАФИЯ !== 2 || ШЕРИФ !== 1 || ДОН !== 1;
  const isDonDisabled = ДОН === 1 && currentPlayerRole !== 'ДОН';
  const isMafiaDisabled = МАФИЯ === 2 && currentPlayerRole !== 'МАФИЯ';
  const isSherifDisabled = ШЕРИФ === 1 && currentPlayerRole !== 'ШЕРИФ';

  return (
    <>
      <RoleSelectionWrapper className='role-selection-wrapper'>
        <RoleSelection>
          <RoleCard mirnij onClick={() => changeSelection('МИРНЫЙ')} selected={currentPlayerRole === 'МИРНЫЙ'}>
            <ThumbUpIcon size='60%' fill={popupIconLight} />
          </RoleCard>

          <RoleCard
            disabled={isDonDisabled}
            don
            onClick={() => changeSelection('ДОН', isDonDisabled)}
            selected={currentPlayerRole === 'ДОН'}
          >
            <DonRingIcon size='60%' fill={popupIcon} />
          </RoleCard>

          <RoleCard
            disabled={isMafiaDisabled}
            mafia
            onClick={() => changeSelection('МАФИЯ', isMafiaDisabled)}
            selected={currentPlayerRole === 'МАФИЯ'}
          >
            <ThumbDownIcon size='60%' fill={popupIcon} />
          </RoleCard>

          <RoleCard
            disabled={isSherifDisabled}
            sherif
            onClick={() => changeSelection('ШЕРИФ', isSherifDisabled)}
            selected={currentPlayerRole === 'ШЕРИФ'}
          >
            <SheriffOkIcon size='60%' fill={isSherifDisabled ? popupIcon : popupIconLight} />
          </RoleCard>
        </RoleSelection>
      </RoleSelectionWrapper>

      <Notification disabled={isButtonDisabled}>Выберите все функциональные роли (2 Мафии, Дон и Шериф)</Notification>

      <div className='flex-grow-1 d-flex align-items-center'>
        <PopUpButton onClick={() => startGame(dispatch)} color='RoleDealing' disabled={isButtonDisabled}>
          Играть
        </PopUpButton>
      </div>
    </>
  );
};
