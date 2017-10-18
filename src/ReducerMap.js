import { makeReducerTree } from './reducer';
import shallowEqual from './utils/shallowEqual';

function get(keyPath, obj) {
  const [key, ...path] = keyPath.split('.');
  const ctx = obj[key];
  if (path.length === 0) return ctx;
  else return get(path.join('.'), ctx);
}

function set(keyPath, obj, value) {
  const [key, ...path] = keyPath.split('.');
  const ctx = obj[key];
  if (path.length === 0) return obj[key] = value;
  else return set(path.join('.'), ctx, value);
}


const wm = new WeakMap();

export default class ReducerMap {
  constructor() {

    function root(state = {}, action) {


      const nextState = makeReducerTree(root, state, action);


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