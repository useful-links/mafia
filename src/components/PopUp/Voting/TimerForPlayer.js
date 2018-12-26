import React from 'react';
import { connect } from 'react-redux';
import PopUpButton from '../style/PopUpButton';
import Circle from './style/Circle';
import Timer from './../../Timer';

const TimerForPlayer = props => {
  const { lastMinuteFor, currentPlayer } = props.state;

  return (
    <>
      <Circle>{lastMinuteFor.length > 1 ? lastMinuteFor[currentPlayer] + 1 : lastMinuteFor[0] + 1}</Circle>

      <Timer key={currentPlayer} />

      <PopUpButton color="Voting" onClick={props.lastPlayer ? props.votingFinishedClicked : props.nextButtonClicked}>
        {props.lastPlayer ? 'Ночь' : 'Далее'}
      </PopUpButton>
    </>
  );
};

const mapStateToProps = ({ game }) => ({ game });

export default connect(mapStateToProps)(TimerForPlayer);
