import { createStore, compose } from 'redux';

import ReducerMap from './ReducerMap';

const init = (state, action) => state;

function mount(store, keyPath, reducer) {
  store.reducerLib.mount(keyPath, reducer);

  const root = store.reducerLib.reducer();
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

  store.reducerLib = new ReducerMap();
  store.mount = mount.bind(store, store);
  return store;
}