import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import PrivateRoute from './util/PrivateRoute'
import Auth from './pages/auth'
import Session from './pages/Session'
import Room from './pages/Room'

function App() {
  return (
    <div className="App">
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
