import { beforeEach, describe, expect, it } from 'vitest';
import { SCREENS, useNavigationStore } from './navigation.store';

describe('navigation.store', () => {
  beforeEach(() => {
    useNavigationStore.setState({ activeScreen: SCREENS.MAIN });
  });

  it('should initialize with MAIN screen', () => {
    expect(useNavigationStore.getState().activeScreen).toBe(SCREENS.MAIN);
  });

  it('should set active screen to SEND', () => {
    useNavigationStore.getState().setScreen(SCREENS.SEND);
    expect(useNavigationStore.getState().activeScreen).toBe(SCREENS.SEND);
  });

  it('should set active screen back to MAIN', () => {
    useNavigationStore.setState({ activeScreen: SCREENS.SEND });
    useNavigationStore.getState().setScreen(SCREENS.MAIN);
    expect(useNavigationStore.getState().activeScreen).toBe(SCREENS.MAIN);
  });
});
