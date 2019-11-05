import axios from "axios";

import { GET_ERRORS, UPDATE_USER_PROFILE } from "./types";

export const updateUserSuccessAction = user => ({
  type: UPDATE_USER_PROFILE,
  payload: {
      user,
  },
});

// Update User
export const updateUser = (userId, userData, history) => dispatch => {
  axios
    .post("/api/users/" + userId, {
        id: userId,
        update: userData
    })
    .then(res => history.push("/dashboard"))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};
