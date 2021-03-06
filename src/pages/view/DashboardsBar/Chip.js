import { Chip as UiChip, colors, IconStarFilled24 } from '@dhis2/ui'
import debounce from 'lodash/debounce'
import PropTypes from 'prop-types'
import React from 'react'
import { Link } from 'react-router-dom'
import { apiPostDataStatistics } from '../../../api/dataStatistics'
import classes from './styles/Chip.module.css'

const Chip = ({ starred, selected, label, dashboardId, onClick }) => {
    const chipProps = {
        selected,
    }

    if (starred) {
        chipProps.icon = (
            <IconStarFilled24
                color={selected ? colors.white : colors.grey600}
            />
        )
    }
    const debouncedPostStatistics = debounce(
        () => apiPostDataStatistics('DASHBOARD_VIEW', dashboardId),
        500
    )

    const handleClick = () => {
        debouncedPostStatistics()
        onClick()
    }

    return (
        <Link
            className={classes.link}
            to={`/${dashboardId}`}
            onClick={handleClick}
            data-test="dashboard-chip"
        >
            <UiChip {...chipProps}>{label}</UiChip>
        </Link>
    )
}

Chip.propTypes = {
    dashboardId: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    selected: PropTypes.bool.isRequired,
    starred: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
}

export default Chip
