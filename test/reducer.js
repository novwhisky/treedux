/* global describe, it, beforeEach, afterEach */

import {expect} from 'chai';

import {configureStore} from '../src/store';

describe.only('reducer', () => {
  const SOME_ACTION = 'SOME_ACTION';

  let store;
  let someReducer = (context = {someActionReduced: false}, action) => {
    switch (action.type) {
      case SOME_ACTION:
        return {...context, someActionReduced: true};
      default:
        return context;
    }
  };

  beforeEach(() => {
    store = configureStore();
    store.mount('someReducer', someReducer);
  });

  afterEach(() => {
    store.replaceReducer(nope => nope);
  });

  describe('#reduceTree()', (() => {
    it('mounts someReducer into state tree with default context', () => {
      const state = store.getState();
      expect(state).to.nested.include({'someReducer.someActionReduced': false});
    });

    it('properly reduces context for a given action', () => {
      store.dispatch({type: `someReducer.${SOME_ACTION}`});
      const state = store.getState();
      expect(state).to.nested.include({'someReducer.someActionReduced': true});
    })
  }));
});