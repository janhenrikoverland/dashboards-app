import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import { Redirect } from 'react-router-dom'

import DashboardContainer from '../../components/DashboardContainer'
import ActionsBar from './ActionsBar'
import TitleBar from './TitleBar'
import ItemGrid from './ItemGrid'
import LayoutPrintPreview from '../print/PrintLayoutDashboard'
import Notice from '../../components/Notice'

import { acSetEditNewDashboard } from '../../actions/editDashboard'
import { sGetIsPrintPreviewView } from '../../reducers/editDashboard'

import { useWindowDimensions } from '../../components/WindowDimensionsProvider'
import { isSmallScreen } from '../../modules/smallScreen'
import { setHeaderbarVisible } from '../../modules/setHeaderbarVisible'

import classes from './styles/NewDashboard.module.css'

const NewDashboard = props => {
    const { width } = useWindowDimensions()
    const [redirectUrl, setRedirectUrl] = useState(null)

    useEffect(() => {
        if (isSmallScreen(width)) {
            setRedirectUrl('/')
            return
        }
        setHeaderbarVisible(true)
        props.setNewDashboard()
    }, [])

    if (redirectUrl) {
        return <Redirect to={redirectUrl} />
    }

    return (
        <>
            <div
                className={cx(classes.container, 'dashboard-scroll-container')}
            >
                <ActionsBar />
                {props.isPrintPreviewView ? (
                    <LayoutPrintPreview fromEdit={true} />
                ) : (
                    <DashboardContainer>
                        <TitleBar />
                        <ItemGrid />
                    </DashboardContainer>
                )}
            </div>
            <div className={classes.notice}>
                <Notice
                    title={i18n.t('Not supported')}
                    message={i18n.t(
                        'Creating dashboards on small screens is not supported. Resize your screen to return to create mode.'
                    )}
                />
            </div>
        </>
    )
}

NewDashboard.propTypes = {
    isPrintPreviewView: PropTypes.bool,
    setNewDashboard: PropTypes.func,
}

const mapStateToProps = state => ({
    isPrintPreviewView: sGetIsPrintPreviewView(state),
})

export default connect(mapStateToProps, {
    setNewDashboard: acSetEditNewDashboard,
})(NewDashboard)
