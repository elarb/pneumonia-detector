export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_OFFLINE = 'UPDATE_OFFLINE';
export const UPDATE_DRAWER_STATE = 'UPDATE_DRAWER_STATE';
export const OPEN_SNACKBAR = 'OPEN_SNACKBAR';
export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR';
export const OPEN_ERROR_DIALOG = 'OPEN_ERROR_DIALOG';

export const navigate = (location) => (dispatch) => {
  // Extract the page name from path.
  // Any other info you might want to extract from the path (like page type), you can do here.
  const pathname = location.pathname;
  const parts = pathname.slice(1).split('/');
  const page = parts[0] || 'predict';
  // prediction id is in the path: /prediction/{predictionId}
  const predId = parts[1];
  // model is extracted from the search string: /predictions?model={model}
  const match = RegExp('[?&]model=([^&]*)').exec(location.search);
  const model = match && decodeURIComponent(match[1].replace(/\+/g, ' '));

  dispatch(loadPage(page, predId));

  // Close the drawer - in case the *path* change came from a link in the drawer.
  dispatch(updateDrawerState(false));
};

const loadPage = (page, predId) => async (dispatch, getState) => {
  let module;
  switch (page) {
    case 'predict':
      await import('../components/chexify-predict.js');
      break;
    case 'predictions':
      module = await import('../components/chexify-predictions.js');
      dispatch(module.fetchPredictions());
      break;
    case 'prediction':
      if (!predId) {
        page = 'view404';
        break;
      }
      module = await import('../components/chexify-prediction.js');

      // Fetch the prediction from the given prediction id.
      let pred = getState().prediction;
      if (pred && pred.isFetching) {
        break;
      }

      dispatch(module.fetchPrediction(predId));
      if (isFetchPredictionFailed(getState().prediction)) {
        page = 'view404';
      }

      break;
    case 'train':
      await import('../components/chexify-train.js');
      break;
    case 'feedback':
      await import('../components/chexify-feedback.js');
      break;
    default:
      page = 'view404';
  }

  if (page === 'view404') {
    import('../components/chexify-view404.js');
  }

  dispatch(updatePage(page));
};

const updatePage = (page) => {
  return {
    type: UPDATE_PAGE,
    page
  };
};

const isFetchPredictionFailed = (prediction) => {
  return !prediction.isFetching && prediction.failure;
};

let snackbarTimer;

export const showSnackbar = () => (dispatch) => {
  dispatch({
    type: OPEN_SNACKBAR
  });
  window.clearTimeout(snackbarTimer);
  snackbarTimer = window.setTimeout(() =>
    dispatch({type: CLOSE_SNACKBAR}), 3000);
};

export const updateOffline = (offline) => (dispatch, getState) => {
  // Show the snackbar only if offline status changes.
  if (offline !== getState().app.offline) {
    dispatch(showSnackbar());
  }
  dispatch({
    type: UPDATE_OFFLINE,
    offline
  });
};

export const updateDrawerState = (opened) => {
  return {
    type: UPDATE_DRAWER_STATE,
    opened
  };
};

export const showErrorDialog = (error) => (dispatch) => {
  dispatch({
    type: OPEN_ERROR_DIALOG,
    error
  });
};

export const updateLocationURL = (url) => (dispatch) => {
  window.history.pushState({}, '', url);
  dispatch(navigate(window.location));
};
