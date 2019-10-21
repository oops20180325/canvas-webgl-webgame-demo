import menus from '@constant/menus'
import Utils from '@utils'
import React from 'react'
import loadable from '@loadable/component'
import { RouteComponentProps } from 'react-router'
import { Redirect, Route, Switch, withRouter } from 'react-router-dom'

const load = c => loadable(
  () => import(`../pages/${c}`),
  {
    fallback: (
      <div className='loading-center'>
        <div className='loader'/>
      </div>
    )
  }
)

const NotFound = load('NotFound')

const renderRouter = (menu, i) => (
  <Route
    key={i}
    path={`/${menu.route}`}
    exact={true}
    component={load(Utils.toCamelCase(menu.route))}
  />
)

const redirectToHome = () => <Redirect to='/home'/>

const allMenus: any[] = []

const initRoute = (currMenus: any[]) => {
  currMenus.forEach(menu => {
    menu.childs
      ? initRoute(menu.childs)
      : allMenus.push(menu)
  })
}

initRoute(menus)

class Router extends React.Component<RouteComponentProps<any>> {
  shouldComponentUpdate (props) {
    return false
  }
  render () {
    return (
      <Switch>
        {/* index */}
        <Route path='/' exact={true} render={redirectToHome} />

        {/* menus */}
        { allMenus.map(renderRouter) }

        {/* 404 */}
        <Route component={NotFound} />
      </Switch>
    )
  }
}

export default withRouter(Router)
