import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import * as styles from './App.module.sass'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Auth from './pages/Authentication'
import Session from './pages/Lobby'
import Room from './pages/Room'

function App() {
  return (
    <div className={styles.app}>
      <Router>
        <Navbar />
        <Switch>
          <Route exact path="/" component={Login} />
          <Route exact path="/auth" component={Auth} />
          <PrivateRoute exact path="/session" component={Session} />
          <PrivateRoute exact path="/room/:id" component={Room} />
        </Switch>
      </Router>
    </div>
  )
}

export default App
