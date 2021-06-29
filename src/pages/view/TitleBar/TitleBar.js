import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import ActionsBar from './ActionsBar'
import LastUpdatedTag from './LastUpdatedTag'
import Description from './Description'

import { sGetSelected } from '../../../reducers/selected'
import { sGetShowDescription } from '../../../reducers/showDescription'

import classes from './styles/TitleBar.module.css'

const ViewTitleBar = ({
    id,
    displayName,
    displayDescription,
    showDescription,
}) => {
    return (
        <div className={classes.container}>
            <div
                className={classes.titleBar}
                style={{ position: 'relative' }}
                data-test="title-bar"
            >
                <span
                    className={classes.title}
                    data-test="view-dashboard-title"
                >
                    {displayName}
                </span>
                <ActionsBar />
            </div>
            <Description
                showDescription={showDescription}
                description={displayDescription}
            />
            {<LastUpdatedTag id={id} />}
        </div>
    )
}

ViewTitleBar.propTypes = {
    displayDescription: PropTypes.string,
    displayName: PropTypes.string,
    id: PropTypes.string,
    showDescription: PropTypes.bool,
}

const mapStateToProps = state => {
    const dashboard = sGetSelected(state)

    return {
        ...dashboard,
        showDescription: sGetShowDescription(state),
    }
}

export default connect(mapStateToProps)(ViewTitleBar)
