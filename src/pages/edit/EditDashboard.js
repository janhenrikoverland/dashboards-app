import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { Redirect } from 'react-router-dom'
import { useDataEngine } from '@dhis2/app-runtime'
import { Layer, CenteredContent, CircularLoader } from '@dhis2/ui'

import DashboardContainer from '../../components/DashboardContainer'
import { apiFetchDashboard } from '../../api/fetchDashboard'
import TitleBar from './TitleBar'
import ItemGrid from './ItemGrid'
import ActionsBar from './ActionsBar'
import Notice from '../../components/Notice'
import LayoutPrintPreview from '../print/PrintLayoutDashboard'
import NoContentMessage from '../../components/NoContentMessage'
import { acSetEditDashboard } from '../../actions/editDashboard'
import { EDIT } from '../../modules/dashboardModes'

import { sGetIsPrintPreviewView } from '../../reducers/editDashboard'
import { setHeaderbarVisible } from '../../modules/setHeaderbarVisible'

import { useWindowDimensions } from '../../components/WindowDimensionsProvider'
import { isSmallScreen } from '../../modules/smallScreen'

import classes from './styles/EditDashboard.module.css'

const EditDashboard = props => {
    const dataEngine = useDataEngine()
    const { width } = useWindowDimensions()
    const [redirectUrl, setRedirectUrl] = useState(null)
    const [hasUpdateAccess, setHasUpdateAccess] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const dashboard = await apiFetchDashboard(
                    dataEngine,
                    props.id,
                    { mode: EDIT }
                )
                props.setEditDashboard(dashboard)
                setHasUpdateAccess(dashboard.access?.update || false)
                setIsLoading(false)
            } catch (error) {
                setRedirectUrl(props.id ? `/${props.id}` : '/')
                setIsLoading(false)
            }
        }

        if (isSmallScreen(width)) {
            setRedirectUrl(props.id ? `/${props.id}` : '/')
            return
        }
        setHeaderbarVisible(true)

        loadDashboard()
    }, [props.id])

    if (redirectUrl) {
        return <Redirect to={redirectUrl} />
    }

    if (isLoading) {
        return (
            <Layer translucent>
                <CenteredContent>
                    <CircularLoader />
                </CenteredContent>
            </Layer>
        )
    }

    const renderGrid = () => {
        if (props.isPrintPreviewView) {
            return <LayoutPrintPreview fromEdit={true} />
        }
        return (
            <DashboardContainer>
                <TitleBar />
                <ItemGrid />
            </DashboardContainer>
        )
    }

    return (
        <>
            <div
                className={cx(classes.container, 'dashboard-scroll-container')}
                data-test="outer-scroll-container"
            >
                <ActionsBar />
                {hasUpdateAccess ? (
                    renderGrid()
                ) : (
                    <NoContentMessage text={i18n.t('No access')} />
                )}
            </div>
            <div className={classes.notice}>
                <Notice
                    title={i18n.t('Not supported')}
                    message={i18n.t(
                        'Editing dashboards on small screens is not supported. Resize your screen to return to edit mode.'
                    )}
                />
            </div>
        </>
    )
}

EditDashboard.propTypes = {
    id: PropTypes.string,
    isPrintPreviewView: PropTypes.bool,
    setEditDashboard: PropTypes.func,
}

const mapStateToProps = (state, ownProps) => ({
    id: ownProps.match?.params?.dashboardId || null,
    isPrintPreviewView: sGetIsPrintPreviewView(state),
})

export default connect(mapStateToProps, {
    setEditDashboard: acSetEditDashboard,
})(EditDashboard)
