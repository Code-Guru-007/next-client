import {
  initializeSnackbar,
  openSnackbar,
  closeSnackbar,
  setSnackbarData,
} from "./actions";
import { snackbars as reducer } from "./snackbars";

const name = "globalSnackbar";

describe("snackbar reducers", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, { type: "", payload: {} })).toEqual({});
  });

  it("should handle INITIALIZE_SNACKBAR", () => {
    const state = {};
    const initializeState = {
      [name]: {
        isOpen: false,
      },
    };
    expect(reducer(state, initializeSnackbar(name))).toEqual(initializeState);
    expect(reducer(state, initializeSnackbar())).toEqual(state);
    expect(reducer(initializeState, initializeSnackbar(name))).toEqual(
      initializeState
    );
  });

  it("should handle OPEN_SNACKBAR", () => {
    const state = {
      [name]: {
        isOpen: false,
      },
    };
    expect(reducer(state, openSnackbar(name))).toEqual({
      [name]: {
        isOpen: true,
      },
    });
    expect(reducer(state, openSnackbar())).toEqual(state);
    expect(reducer({}, openSnackbar(name))).toEqual({});
  });

  it("should handle CLOSE_SNACKBAR", () => {
    const state = {
      [name]: {
        isOpen: true,
      },
    };
    expect(reducer(state, closeSnackbar(name))).toEqual({
      [name]: {
        isOpen: false,
      },
    });
    expect(reducer(state, closeSnackbar())).toEqual(state);
    expect(reducer({}, closeSnackbar(name))).toEqual({});
  });

  it("should handle SET_SNACKBAR_DATA", () => {
    const state = {
      [name]: {
        isOpen: false,
      },
    };
    expect(
      reducer(
        state,
        setSnackbarData({
          name,
          message: "message",
          title: "title",
        })
      )
    ).toEqual({
      [name]: {
        isOpen: false,
        message: "message",
        title: "title",
      },
    });
    expect(reducer(state, setSnackbarData({ name }))).toEqual(state);
    expect(
      reducer(
        { [name]: {} },
        setSnackbarData({
          name,
        })
      )
    ).toEqual({ [name]: {} });
  });
});
