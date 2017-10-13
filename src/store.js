import { createStore, compose } from 'redux';

import { createReducerTree } from './reducer';
import {scaffold, mergeDeep, selectorFromKeyPath, shiftKeyPath} from './util';


let _key = new WeakMap();
let _reducer = new WeakMap();
let _children = new WeakMap();
let _hasUpdate = new WeakMap();

class ReducerLeaf {
  constructor(key, reducer=(_=>({}))) { //_=>{}
    // if(!reducer) {
    //   throw new Error('Fail');
    // }

    _key.set(this, key);
    _children.set(this, {});
    // _reducer.set(this, _=>_);
    _reducer.set(this, reducer);
    _hasUpdate.set(this, false);
  }

  key() { return _key.get(this) }
  reducer() {
    return _reducer.get(this);
    // return _=>{};
  }

  children() {
    return _children.get(this);
  }

  getLeaf(keyPath) {
    const kp = shiftKeyPath(keyPath);
    const [key, path] = kp;

    // console.log(key, path);
    return this.children()[key];
  }

  childReducer() {
  }

  key() { return _key.get(this) }

  getReducer(key) {
    return _children.get(this)[key];
  }

  hasChildren() {
    return (Object.keys(this.children()).length > 0)
  }

  hasUpdate() {
    return this._hasUpdate;
  }

  mount(keyPath, reducer) {

    const kp = shiftKeyPath(keyPath);
    const [key, path] = kp;

    if(key) {
      if(path && path.length > 0) {
        const child = this.getLeaf(keyPath);
        // console.log('[CHILD]', path);
        child.mount(path, reducer);
      }
      else {
        // console.log('[MOUNT]', key, reducer);

        const leaf = new ReducerLeaf(key, reducer);
        _children.set(this, { ...this.children(), [key]: leaf });
      }
    }


  }

  debug() {
    // console.log(this.children())
  }

  getSliceReducer() {
    const __ignoreme = _=>_;

    // console.log('!', this.key());
    // console.log('#', this.childReducerMap());
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

    // console.log('##', this.children(), this.reducer())

    return this.getSliceReducer();
  }
}



const init = (state={}, action) => {
  switch(action.type) {
    // case '@@redux/INIT':
    //   state.app.time = new Date().getTime();
    //   return Object.assign({}, state);
    default: return state;
  }
};

function mount(store, keyPath, reducer) {
  // console.log(keyPath);
  store.reducerMap[keyPath] = reducer;

  // Handled in ContextConnect
  // store.reducerLib.mount(keyPath, reducer);

  // console.log(store.reducerLib.makeReducerTree());

  store.reducerLib.mount(keyPath, reducer);

  if(true /*store.reducerLib.hasUpdate()*/) {
    const root = store.reducerLib.makeReducerTree();
    if(root) {
      store.replaceReducer(root);
    }
  }

}

export function configureStore(initialState) {
  // For devtools debug, because this is very much in development
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const store = createStore(
    init,
    initialState,
    composeEnhancers(
      /* applyMiddleware(...middleware) */
    )
  );

  store.reducerLib = new ReducerLeaf(); // _=>_ //_=>({})
  store.reducerMap = {};
  store.mount = mount.bind(store, store);
  return store;
}