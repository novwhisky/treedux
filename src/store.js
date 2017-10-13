import { createStore, compose } from 'redux';

import { createReducerTree } from './reducer';
import {scaffold, mergeDeep, selectorFromKeyPath, shiftKeyPath} from './util';


let _key = new WeakMap();
let _reducer = new WeakMap();
let _children = new WeakMap();
let _hasUpdate = new WeakMap();

class ReducerLeaf {
  constructor(reducer=_=>{}) { //
    // if(!reducer) {
    //   throw new Error('Fail');
    // }

    // _key.set(this, key);
    _children.set(this, {});
    // _reducer.set(this, _=>_);
    _reducer.set(this, reducer); //
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

  childReducer() {
  }

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
    console.log(keyPath);
    const kp = shiftKeyPath(keyPath);
    const [key, path] = kp;



    // if(path && path.length > 0) {
    //   console.log('##', kp);
    //   const leaf = new ReducerLeaf();
    //   leaf.mount(path, reducer);
    //
    //
    //   _children.set(this, { ...this.children(), [key]: { leaf }  });
    //
    // }
    // else {
    // _key.set(this, key);
    // _reducer.set(this, reducer);
    // }
    // console.log('#', this.key(), keyPath, reducer);

    // console.log(key, path, reducer);
    // return;

    if(key) {
      // console.log(key, path);
      if(path && path.length > 0) {

      }
      else {
        // _key.set(this, key);
        // _reducer.set(this, reducer);

        const leaf = new ReducerLeaf(reducer);
        _children.set(this, { ...this.children(), [key]: leaf });
      }
    }

    // console.log(this.children())

    // this.makeReducerTree();
  }

  debug() {
    // console.log(this.children())
  }

  makeReducerTree() {

    console.log(this.children(), this.reducer())

    const forceOnly = false;
    if(!forceOnly && this.hasChildren()) {
      const children = this.children();
      let childMap = {};

      for(const key in children) {
        childMap[key] = children[key].reducer();
      }

      return createReducerTree(childMap, this.reducer());
    }
    else {
      return this.reducer();
    }
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




  // store.replaceReducer();

  // Buggy when 2D+
  // store.replaceReducer(createReducerTree(store.reducerMap, init));



  // const tree = scaffold(keyPath, store.reducerMap, reducer);
  // console.log(tree);
  // store.reducerMap = mergeDeep(store.reducerMap, tree);
  // console.log(keyPath, store.reducerMap);
  // const rt = createReducerTree(store.reducerMap, init);
  // console.log(rt(undefined, { type: ''}));
  // store.replaceReducer(rt);

  // store.reducerMap[keyPath] = reducer;
  // const rootReducer = buildReducer(store.reducerMap);
  // store.replaceReducer(rootReducer);


  // WORKS!!! (if no initialState set)
  // store.reducerMap[keyPath] = reducer;
  // store.replaceReducer(createReducerTree(store.reducerMap, init));

  // Works
  // console.log(reducer(undefined, { type: '' }))

  // Works
  //store.replaceReducer(createReducerTree({}, state => ({hurr: true})))

  // Works
  // store.replaceReducer(state => ({hurr: true}))
}

export function configureStore(initialState) {
  // For devtools debug, because this is very much in development
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const store = createStore(
    init,
    //initialState //,
    composeEnhancers(
      /* applyMiddleware(...middleware) */
    )
  );

  store.reducerLib = new ReducerLeaf(_=>({})); // _=>_ //_=>({})
  store.reducerMap = {};
  store.mount = mount.bind(store, store);
  return store;
}