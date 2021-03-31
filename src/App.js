import React, { useEffect } from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { CssVariables } from '@dhis2/ui'
import { useD2 } from '@dhis2/app-runtime-adapter-d2'

import Dashboard from './Dashboard'
import AlertBar from './components/AlertBar'

import { acSetUsername } from './actions/username'
import { tFetchDashboards } from './actions/dashboards'
import { tSetControlBarRows } from './actions/controlBar'
import { tSetShowDescription } from './actions/selected'

import { EDIT, VIEW, NEW, PRINT, PRINT_LAYOUT } from './modules/dashboardModes'

import './App.css'

const App = props => {
    const { d2 } = useD2()

    useEffect(() => {
        props.setUsername(d2.currentUser)
        props.fetchDashboards()
        props.setControlBarRows()
        props.setShowDescription()

        // store the headerbar height for controlbar height calculations
        const headerbarHeight = document
            .querySelector('header')
            .getBoundingClientRect().height

        document.documentElement.style.setProperty(
            '--headerbar-height',
            `${headerbarHeight}px`
        )
    }, [])

    return (
        <>
            <CssVariables colors spacers />
            <Router>
                <Switch>
                    <Route
                        exact
                        path="/"
                        render={props => <Dashboard {...props} mode={VIEW} />}
                    />
                    <Route
                        exact
                        path="/new"
                        render={props => <Dashboard {...props} mode={NEW} />}
                    />
                    <Route
                        exact
                        path="/:dashboardId"
                        render={props => <Dashboard {...props} mode={VIEW} />}
                    />
                    <Route
                        exact
                        path="/:dashboardId/edit"
                        render={props => <Dashboard {...props} mode={EDIT} />}
                    />
                    <Route
                        exact
                        path="/:dashboardId/printoipp"
                        render={props => <Dashboard {...props} mode={PRINT} />}
                    />
                    <Route
                        exact
                        path="/:dashboardId/printlayout"
                        render={props => (
                            <Dashboard {...props} mode={PRINT_LAYOUT} />
                        )}
                    />
                </Switch>
            </Router>
            <AlertBar />
        </>
    )
}

App.propTypes = {
    fetchDashboards: PropTypes.func.isRequired,
    setControlBarRows: PropTypes.func.isRequired,
    setShowDescription: PropTypes.func.isRequired,
    setUsername: PropTypes.func.isRequired,
}

const mapDispatchToProps = {
    fetchDashboards: tFetchDashboards,
    setControlBarRows: tSetControlBarRows,
    setShowDescription: tSetShowDescription,
    setUsername: acSetUsername,
}

export default connect(null, mapDispatchToProps)(App)
