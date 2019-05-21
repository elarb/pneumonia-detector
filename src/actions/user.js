export const SET_USER = 'SET_USER';

export const setUser = (user) => {
  return {
    type: SET_USER,
    user
  };
};

export const fetchStoredUser = () => (dispatch) => {
  let rememberedAccounts = localStorage.getItem('firebaseui::rememberedAccounts');
  if (rememberedAccounts) {
    dispatch(setUser(JSON.parse(rememberedAccounts)[0]));
  }
};

