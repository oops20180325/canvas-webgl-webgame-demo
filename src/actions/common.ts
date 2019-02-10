import actionTypes from '@constant/actionTypes'

export default {
  changeBreadcrumb: (breadcrumbs: any[]) => {
    return {
      type: actionTypes.UPDATE_BREADCRUMB,
      payload: breadcrumbs
    }
  },
  onResize: size => {
    return {
      type: actionTypes.ON_RESIZE,
      payload: size
    }
  },
  toggleCollapse: () => {
    return {
      type: actionTypes.TOGGLE_COLLAPSE
    }
  },
  toggleOpenKeys: (keys: any[]) => {
    return {
      type: actionTypes.TOGGLE_OPENKEYS,
      payload: keys
    }
  },
  setLoading: isLoading => {
    return {
      type: actionTypes.SET_LOADING,
      payload: isLoading
    }
  }
}
