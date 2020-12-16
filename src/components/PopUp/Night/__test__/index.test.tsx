import { clickButton, clickByTestId, getRenderer, screen } from 'helpers/testingHelpers/test-utils';
import { killPlayer } from 'redux/actions/playersActions';
import TestStore from 'test/TestStore';

import Night from '..';

let store: TestStore;

beforeEach(() => {
  store = new TestStore();
});

const render = getRenderer(Night);

describe('<Night />', () => {
  it('should render shooting stage. Next button should navigate to don and sheriff stage. Back button goes back', () => {
    render();

    expect(screen.getByText(/в кого стреляет мафия/i)).toBeInTheDocument();

    clickButton(/далее/i);
    expect(screen.getByText(/дон ищет шерифа/i)).toBeInTheDocument();

    clickButton(/далее/i);
    expect(screen.getByText(/шериф ищет черных игроков/i)).toBeInTheDocument();

    clickByTestId(/backToDonTimeButton/i);
    expect(screen.getByText(/дон ищет шерифа/i)).toBeInTheDocument();

    clickByTestId(/backToShootingButton/i);
    expect(screen.getByText(/в кого стреляет мафия/i)).toBeInTheDocument();
  });

  it('should kill "playerToKill" after "День" is pressed if checkForEnd.status is true', () => {
    render();

    clickButton([/2/i, /далее/i, /далее/i, /день/i]);

    expect(store.dispatchSpy).toHaveBeenCalledWith(killPlayer(1));
  });
});
