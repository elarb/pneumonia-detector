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
  const page = parts[0] || 'home';
  // prediction id is in the path: /prediction/{predictionId}
  const predId = parts[1];
  // model is extracted from the search string: /explore?q={query}
  const match = RegExp('[?&]model=([^&]*)').exec(location.search);
  const model = match && decodeURIComponent(match[1].replace(/\+/g, ' '));

  dispatch(loadPage(page, model, predId));

  // Close the drawer - in case the *path* change came from a link in the drawer.
  dispatch(updateDrawerState(false));
};

const loadPage = (page, model, predId) => async (dispatch, getState) => {
  let module;
  switch (page) {
    case 'home':
      await import('../components/classifier-home.js');
      break;
    case 'explore':
      module = await import('../components/classifier-explore.js');

      dispatch(module.fetchPredictions(model));
      // TODO: What if model doesn't exist?
      break;
    case 'about':
      await import('../components/classifier-about.js');
      break;
    case 'prediction':
      module = await import('../components/classifier-prediction.js');

      // Fetch the prediction from the given prediction id.
      dispatch(module.fetchPrediction(predId));

      if (isFetchPredictionFailed(getState().prediction)) {
        page = 'view404';
      }
      break;
    default:
      page = 'view404';
  }

  if (page === 'view404') {
    import('../components/classifier-view404.js');
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
