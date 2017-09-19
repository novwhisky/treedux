/* global describe, it, beforeEach */

import { expect } from 'chai';

import { createStore } from 'redux';
import { createReducerTree, struct } from '../index';

describe('treedux', function() {
  let initialReducer = (state, action) => state;
  let store;

  function replaceAndDispatch(rootReducer, action={type: '@@whatevz'}) {
    store.replaceReducer(rootReducer);
    store.dispatch(action);
  }

  beforeEach(function() {
    store = createStore(initialReducer);
  });

  describe('#createReducerTree()', function() {
    it('mounts a reducerTree', function() {
      const reducerTree = createReducerTree({}, (state, action) => {
        state.isReducerTree = true;
        return state;
      });

      replaceAndDispatch(reducerTree);

      expect(store.getState()).to.have.property('isReducerTree', true);
    });

    describe('children', function() {
      it('creates a nested structure', function() {
        const leafReducer = (state={}, action) => {
          state.leafReduced = true;
          return state;
        };
        const rootReducer = createReducerTree({ leafReducer }, (state, action) => {
          state.rootReduced = true;
          return state;
        });

        replaceAndDispatch(rootReducer);

        expect(store.getState()).to.deep.equal({
          leafReducer: { leafReduced: true },
          rootReduced: true
        })
      });

      it('creates multiple nested structures', function() {
        const children = {
          leafA: initialReducer,
          leafB: initialReducer,
          leafC: initialReducer,
          leafD: initialReducer
        };

        const rootReducer = createReducerTree(children, (state, action) => {
          state.rootReduced = true;
          return state;
        });

        replaceAndDispatch(rootReducer);

        expect(store.getState()).to.deep.equal({
          leafA: {},
          leafB: {},
          leafC: {},
          leafD: {},
          rootReduced: true
        })
      });

      it('scaffolds child reducer\'s initial states', function() {
        const children = {
          leafWithoutInitialState: initialReducer,
          leafWithInitialState: (state={hasInitial: true}) => state
        };

        const rootReducer = createReducerTree(children, (state, action) => {
          state.rootReduced = true;
          return state;
        });

        replaceAndDispatch(rootReducer);

        expect(store.getState()).to.deep.equal({
          leafWithoutInitialState: {},
          leafWithInitialState: { hasInitial: true },
          rootReduced: true
        })
      });
    });

    describe('dispatching', function() {
      let leafReducer, rootReducer;

      beforeEach(function() {
        leafReducer = (state, action) => {
          switch(action.type) {
            case 'LOCAL_ACTION':
              state.reducedLocalState = true;
              return state;
            default: return state;
          }
        };

        rootReducer = createReducerTree({ leafReducer }, (state, action) => {
          return state;
        });
      });

      it('goes from bare scaffold to having populated data on dispatch', function() {
        store.replaceReducer(rootReducer);

        const keyPath = 'leafReducer.LOCAL_ACTION';

        expect(store.getState()).to.deep.equal({ leafReducer: {} });
        store.dispatch({ type: keyPath });
        expect(store.getState()).to.deep.equal({
          leafReducer: {
            reducedLocalState: true
          }
        });
      });

      it('doesn\'t mutate state without valid keyPath', function() {
        store.replaceReducer(rootReducer);

        const keyPath = 'leafReducer.LOCAL_ACTION';

        const initialState = store.getState();
        store.dispatch({ type: 'LOCAL_ACTION'});
        const unmutatedState = store.getState();
        store.dispatch({ type: keyPath });
        const mutatedState = store.getState();

        expect(unmutatedState).to.deep.equal(initialState);
        expect(mutatedState).to.have.nested.property('leafReducer.reducedLocalState', true);
      });

      it('correctly merges ownState on top of childState', function() {
        const grandchildReducer = (state, action) => {
          switch (action.type) {
            case 'LOCAL_ACTION':
              state.grandchildReduced = true;
              return state;
            default:
              return state;
          }
        };

        const childReducer = createReducerTree({ grandchildReducer }, (state, action) => {
          switch(action.type) {
            case 'LOCAL_ACTION':
              state.childReduced = true;
              return state;
            default: return state;
          }
        });

        const rootReducer = createReducerTree({ childReducer }, (state, action) => {
          switch(action.type) {
            case 'LOCAL_ACTION':
              state.rootReduced = true;
              return state;
            default: return state;
          }
        });

        replaceAndDispatch(rootReducer);

        store.dispatch({ type: 'childReducer.grandchildReducer.LOCAL_ACTION' });
        store.dispatch({ type: 'childReducer.LOCAL_ACTION' });
        store.dispatch({ type: 'LOCAL_ACTION' });

        expect(store.getState()).to.deep.equal({
          childReducer: {
            childReduced: true,
            grandchildReducer: {grandchildReduced: true}
          },
          rootReduced: true
        });
      });
    })
  });

  describe('#struct()', function() {
    let reducerMap;

    it('scaffolds state object, mirroring keys from reducerMap', function() {
      reducerMap = {
        foo: state => state,
        bar: (state={reduced: true}) => state
      };

      const state = struct(reducerMap);

      expect(state).to.deep.equal({
        foo: {},
        bar: { reduced: true }
      });
    });

    it('scaffolds with recursion', function() {
      const buzz = (state={recursed: true}) => state;

      reducerMap = {
        foo: state => state,
        bar: (state=struct({buzz})) => state
      };

      const state = struct(reducerMap);

      expect(state).to.deep.equal({
        foo: {},
        bar: {
          buzz: { recursed: true }
        }
      })
    });
  });
});