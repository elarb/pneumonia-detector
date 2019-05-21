import {addPredictionList, removePredictionList} from "./predictions.js";

export const REQUEST_PREDICTION = 'REQUEST_PREDICTION';
export const RECEIVE_PREDICTION = 'RECEIVE_PREDICTION';
export const FAIL_PREDICTION = 'FAIL_PREDICTION';
export const REMOVE_PREDICTION = 'REMOVE_PREDICTION';

const _fetchPrediction = (id, listen = false) => (dispatch, getState) => {
  if (!id) {
    return;
  }

  // clear result
  dispatch(receivePrediction(id, {}));
  dispatch(requestPrediction(id));

  const state = getState();
  const prediction = state.predictions && state.predictions.items && state.predictions.items[id];
  if (prediction) {
    // prediction found in state.predictions.items
    dispatch(receivePrediction(id));
    // let the calling code know there's nothing to wait for.
    return Promise.resolve();
  }

  const dbDoc = firebase.firestore().collection('predictions').doc(id);

  // Listen for changes (e.g. after an upload)
  if (listen) {
    console.log('listening for changes');
    let found = false;
    let unsubscribe = dbDoc
      .onSnapshot(doc => {
        if (!doc.exists) {
          return;
        }
        // found = true;

        let predData = doc.data();
        if (predData.predictionErr) {
          dispatch(failPrediction(id, predData.predictionErr));
        } else {
          dispatch(receivePrediction(id, predData));
          // dispatch(addPredictionList(predData));
        }
        // Stop listening for changes
        unsubscribe();
      }, err => {
        dispatch(failPrediction(id, err));
      });

    setTimeout(() => {
      if (found) {
        unsubscribe();
        dispatch(failPrediction(id, 'TIMEOUT'));
      }
    }, 10000);
  }
  // Try to fetch immediately (e.g. page load)
  else {
    dbDoc.get().then(doc => {
      if (!doc.exists) {
        dispatch(failPrediction(id));
        return Promise.resolve();
      }

      let predData = doc.data();
      if (predData.predictionErr) {
        dispatch(failPrediction(id, predData.predictionErr));
      } else {
        dispatch(receivePrediction(id, predData));
        // dispatch(addPredictionList(predData));
      }
    }).catch(err => {
      dispatch(failPrediction(id, err));
    });
  }
};

export const fetchPrediction = (id) => _fetchPrediction(id, false);
export const listenPrediction = (id) => _fetchPrediction(id, true);

export const removePrediction = (id) => (dispatch, getState) => {
  if (!id) {
    return;
  }
  dispatch(removePredictionList(id));
  firebase.firestore().collection('predictions').doc(id).delete().then(() => {
    return {
      type: REMOVE_PREDICTION,
      id
    };
  }).catch(error => {
    console.error("Error removing document: ", error);
  });
};

const requestPrediction = (id) => {
  return {
    type: REQUEST_PREDICTION,
    id
  };
};

const receivePrediction = (id, item) => {
  return {
    type: RECEIVE_PREDICTION,
    id,
    item
  };
};

const failPrediction = (id, error) => {
  return {
    type: FAIL_PREDICTION,
    id,
    error
  };
};
