import { createStore, compose } from 'redux';

import { createReducerTree } from './reducer';
import { shiftKeyPath} from './util';


let _key = new WeakMap();
let _reducer = new WeakMap();
let _children = new WeakMap();

class ReducerLeaf {
  constructor(key, reducer= _=>({}) ) {
    _key.set(this, key);
    _children.set(this, {});
    _reducer.set(this, reducer);
  }

  reducer() {
    return _reducer.get(this);
  }

  children() {
    return _children.get(this);
  }

  getLeaf(keyPath) {
    const kp = shiftKeyPath(keyPath);
    const [key, path] = kp;

    return this.children()[key];
  }

  getReducer(key) {
    return _children.get(this)[key];
  }

  hasChildren() {
    return (Object.keys(this.children()).length > 0)
  }

  mount(keyPath, reducer) {
    const kp = shiftKeyPath(keyPath);
    const [key, path] = kp;

    if(key) {
      if(path && path.length > 0) {
        const child = this.getLeaf(keyPath);
        child.mount(path, reducer);
      }
      else {
        const leaf = new ReducerLeaf(key, reducer);
        _children.set(this, { ...this.children(), [key]: leaf });
      }
    }
  }

  getSliceReducer() {
    return createReducerTree(this.childReducerMap(), this.reducer());
  }

  childReducerMap() {
    const children = this.children();
    let childMap = {};

    for(const key in children) {
      childMap[key] = children[key].getSliceReducer();
    }
    return childMap;
  }

  makeReducerTree() {
    return this.getSliceReducer();
  }
}



const init = (state={}, action) => {
  switch(action.type) {
    default: return state;
  }
};

function mount(store, keyPath, reducer) {
  store.reducerLib.mount(keyPath, reducer);

  const root = store.reducerLib.makeReducerTree();
  if(root) {
    store.replaceReducer(root);
  }
}

export function configureStore(initialState) {
  let composeEnhancers = function() {};
  if(window) {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  }

  const store = createStore(
    init,
    initialState,
    composeEnhancers(
      /* applyMiddleware(...middleware) */
    )
  );

  store.reducerLib = new ReducerLeaf();
  store.mount = mount.bind(store, store);
  return store;
}