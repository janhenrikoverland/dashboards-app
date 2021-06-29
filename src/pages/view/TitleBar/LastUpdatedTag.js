import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Tag, Tooltip } from '@dhis2/ui'
import { useCacheableSection } from '@dhis2/app-service-offline'

import classes from './styles/LastUpdatedTag.module.css'

const LastUpdatedTag = ({ id }) => {
    const { lastUpdated } = useCacheableSection(id)

    return lastUpdated ? (
        <Tooltip content={lastUpdated} openDelay={200} closeDelay={100}>
            <Tag
                className={classes.lastUpdatedTag}
            >{`Offline data last updated ${moment(
                lastUpdated
            ).fromNow()}`}</Tag>
        </Tooltip>
    ) : null
}
LastUpdatedTag.propTypes = {
    id: PropTypes.string,
}

export default LastUpdatedTag
