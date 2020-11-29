/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import user from '@testing-library/user-event';

import { render, screen } from 'helpers/test-utils';

import VictimSelector from '..';

const onNumberSelected = jest.fn();

const props = { votesLeft: 9, onNumberSelected };

describe('<VictimSelector />', () => {
  it('should change clicked button classNames and call callback function onClick', () => {
    render(<VictimSelector {...props} />);

    const buttonNumber = 4;
    const secondButton = screen.getByRole('button', { name: buttonNumber.toString() });
    const buttonNotClickedClassName = secondButton.className;
    user.click(secondButton);
    const buttonClickedClassName = secondButton.className;
    expect(onNumberSelected).toHaveBeenCalledTimes(1);
    expect(onNumberSelected).toHaveBeenCalledWith(buttonNumber - 1);
    expect(buttonNotClickedClassName).not.toBe(buttonClickedClassName);
    user.click(secondButton);
    expect(secondButton.className).toBe(buttonNotClickedClassName);
  });

  it('should render 10 buttons with player numbers', () => {
    render(<VictimSelector {...props} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(10);
  });

  it('should render 5 disabled (not clickable) buttons if votesLeft=4', () => {
    render(<VictimSelector {...props} votesLeft={4} />);

    const buttons = screen.getAllByRole('button');
    [1, 2, 3, 4, 5].forEach(button => expect(buttons[button - 1]).not.toBeDisabled());
    [6, 7, 8, 9, 10].forEach(button => expect(buttons[button - 1]).toBeDisabled());
  });

  it('should render 2 disabled buttons at Night if players are dead', () => {
    const initialPlayersState = [
      { isAlive: true },
      { isAlive: false },
      { isAlive: true },
      { isAlive: true },
      { isAlive: true },
      { isAlive: false },
      { isAlive: true },
      { isAlive: true },
      { isAlive: true },
      { isAlive: true },
    ];
    render(<VictimSelector onNumberSelected={onNumberSelected} shooting />, { initialPlayersState });
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => user.click(button));
    [1, 3, 4, 5, 7, 8, 9, 10].forEach(button => expect(buttons[button - 1]).not.toBeDisabled());
    [2, 6].forEach(button => expect(buttons[button - 1]).toBeDisabled());
  });

  it('should render 2 disabled buttons at Day if players are dead', () => {
    render(<VictimSelector onNumberSelected={onNumberSelected} votesLeft={7} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => user.click(button));
    expect(onNumberSelected).toHaveBeenCalledTimes(8);
  });

  it('should render all disabled buttons with one button not clickable if last player is voting', () => {
    render(<VictimSelector onNumberSelected={onNumberSelected} votesLeft={7} lastPlayer />);
    const buttons = screen.getAllByRole('button');
    const activeButton = screen.getByRole('button', { name: /8/i });
    const disabledButton = screen.getByRole('button', { name: /7/i });
    expect(activeButton.selected).toBeTruthy();
    expect(disabledButton.selected).toBeFalsy();
    buttons.forEach(button => user.click(button));
    expect(onNumberSelected).toHaveBeenCalledTimes(0);
  });

  it('should render passed activeNumber as active button', () => {
    render(<VictimSelector {...props} selectedNumber={3} />);

    const activeButton = screen.getByRole('button', { name: /4/i });
    const disabledButton = screen.getByRole('button', { name: /3/i });
    expect(activeButton.selected).toBeTruthy();
    expect(disabledButton.selected).toBeFalsy();
    // Использовать expect по стилям
  });
});
