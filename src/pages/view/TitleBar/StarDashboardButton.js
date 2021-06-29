import React from 'react'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'
import { Tooltip, IconStar24, IconStarFilled24, colors } from '@dhis2/ui'

import classes from './styles/StarDashboardButton.module.css'

const StarDashboardButton = ({ starred, isOnline, onClick }) => {
    const StarIcon = starred ? IconStarFilled24 : IconStar24

    const handleOnClick = () => {
        isOnline && onClick()
    }

    let tooltipContent
    if (isOnline) {
        if (starred) {
            tooltipContent = i18n.t('Unstar dashboard')
        } else {
            tooltipContent = i18n.t('Star dashboard')
        }
    } else {
        if (starred) {
            tooltipContent = i18n.t(
                'Cannot unstar this dashboard while offline'
            )
        } else {
            tooltipContent = i18n.t('Cannot star this dashboard while offline')
        }
    }

    return (
        <button
            className={classes.star}
            disabled={!isOnline}
            onClick={handleOnClick}
            data-test="button-star-dashboard"
        >
            <Tooltip content={tooltipContent}>
                <span
                    data-test={
                        starred ? 'dashboard-starred' : 'dashboard-unstarred'
                    }
                >
                    <StarIcon color={colors.grey600} />
                </span>
            </Tooltip>
        </button>
    )
}

StarDashboardButton.propTypes = {
    isOnline: PropTypes.bool,
    starred: PropTypes.bool,
    onClick: PropTypes.func,
}

StarDashboardButton.defaultProps = {
    onClick: Function.prototype,
}

export default StarDashboardButton
