import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import * as styles from './App.module.sass'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Auth from './pages/Authentication'
import Lobby from './pages/Lobby'
import Room from './pages/Room'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#1DB954',
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className={styles.app}>
        <Router basename="/frontend">
          <Navbar />
          <Switch>
            <Route exact path="/" component={Login} />
            <Route exact path="/auth" component={Auth} />
            <PrivateRoute exact path="/lobby" component={Lobby} />
            <PrivateRoute exact path="/room/:id" component={Room} />
          </Switch>
        </Router>
      </div>
    </ThemeProvider>
  )
}

export default App
