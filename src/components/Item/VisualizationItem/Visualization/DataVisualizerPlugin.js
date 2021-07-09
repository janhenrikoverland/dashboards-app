import PropTypes from 'prop-types'
import React, { Suspense, useState, useEffect, useCallback } from 'react'
import { useUserSettings } from '../../../UserSettingsProvider'
import LoadingMask from './LoadingMask'
import classes from './styles/DataVisualizerPlugin.module.css'
import VisualizationErrorMessage from './VisualizationErrorMessage'

const VisualizationPlugin = React.lazy(() =>
    import(
        /* webpackChunkName: "data-visualizer-plugin" */ /* webpackPrefetch: true */ '@dhis2/data-visualizer-plugin'
    )
)

const DataVisualizerPlugin = ({
    filterVersion,
    item,
    style,
    visualization,
    dashboardMode,
}) => {
    const { userSettings } = useUserSettings()
    const [visualizationLoaded, setVisualizationLoaded] = useState(false)
    const [error, setError] = useState(false)

    const onLoadingComplete = useCallback(
        () => setVisualizationLoaded(true),
        []
    )

    const onError = () => setError(true)

    useEffect(() => {
        setError(false)
    }, [filterVersion, visualization.type])

    if (error) {
        return (
            <div style={style}>
                <VisualizationErrorMessage
                    item={item}
                    dashboardMode={dashboardMode}
                />
            </div>
        )
    }

    return (
        <Suspense fallback={<div />}>
            {!visualizationLoaded && <LoadingMask style={style} />}
            <div className={classes.wrapper}>
                <VisualizationPlugin
                    visualization={visualization}
                    forDashboard={true}
                    userSettings={userSettings}
                    style={style}
                    onLoadingComplete={onLoadingComplete}
                    onError={onError}
                />
            </div>
        </Suspense>
    )
}

DataVisualizerPlugin.propTypes = {
    dashboardMode: PropTypes.string,
    filterVersion: PropTypes.string,
    item: PropTypes.object,
    style: PropTypes.object,
    visualization: PropTypes.object,
}

export default DataVisualizerPlugin
