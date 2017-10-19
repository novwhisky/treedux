import { reduceTree } from './reducer';
import shallowEqual from './utils/shallowEqual';
import { set } from './util';

const wm = new WeakMap();

export default class ReducerMap {
  constructor() {
    function root(state = {}, action) {
      const nextState = reduceTree(root, state, action);

      return shallowEqual(state, nextState) ? state: nextState;
    }

    wm.set(this, root);
  }

  mount(keyPath, reducer) {
    const reducerMap = wm.get(this);
    set(keyPath, reducerMap, reducer);
  }

  reducer() {
    return wm.get(this);
  }
}