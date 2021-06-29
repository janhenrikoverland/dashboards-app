import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useD2 } from '@dhis2/app-runtime-adapter-d2'
import { useConfig } from '@dhis2/app-runtime'
import { load, unmount } from './plugin'
import getVisualizationContainerDomId from '../getVisualizationContainerDomId'

const DefaultPlugin = ({
    item,
    activeType,
    filterVersion,
    visualization,
    options,
    style,
    isRecording,
}) => {
    const { d2 } = useD2()
    const { baseUrl } = useConfig()
    const credentials = {
        baseUrl,
        auth: d2.Api.getApi().defaultHeaders.Authorization,
    }

    const prevItem = useRef()
    const prevActiveType = useRef()
    const prevFilterVersion = useRef()

    useEffect(() => {
        load(item, visualization, {
            credentials,
            activeType,
            options,
        })

        prevItem.current = item
        prevActiveType.current = activeType
        prevFilterVersion.current = filterVersion
    }, [])

    useEffect(() => {
        if (isRecording) {
            unmount(item, activeType)
            load(item, visualization, {
                credentials,
                activeType,
                isRecording,
            })
        }
    }, [isRecording])

    useEffect(() => {
        if (
            prevItem.current === item &&
            (prevActiveType.current !== activeType ||
                prevFilterVersion.current !== filterVersion)
        ) {
            /* Item is the same but type or filters has changed
             * so necessary to reload
             */
            load(item, visualization, {
                credentials,
                activeType,
                options,
            })
        }

        prevItem.current = item
        prevActiveType.current = activeType
        prevFilterVersion.current = filterVersion
    }, [item, visualization, activeType, filterVersion])

    return <div id={getVisualizationContainerDomId(item.id)} style={style} />
}

DefaultPlugin.propTypes = {
    activeType: PropTypes.string,
    filterVersion: PropTypes.string,
    isRecording: PropTypes.bool,
    item: PropTypes.object,
    options: PropTypes.object,
    style: PropTypes.object,
    visualization: PropTypes.object,
}

DefaultPlugin.defaultProps = {
    style: {},
    isRecording: false,
    item: {},
    options: {},
    visualization: {},
}

export default DefaultPlugin
