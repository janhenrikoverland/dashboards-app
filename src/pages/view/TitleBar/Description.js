import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import i18n from '@dhis2/d2-i18n'

import classes from './styles/Description.module.css'

const Description = ({ description, showDescription }) => {
    const descriptionClasses = cx(
        classes.descContainer,
        description ? classes.desc : classes.noDesc
    )
    return showDescription ? (
        <div className={descriptionClasses} data-test="dashboard-description">
            {description || i18n.t('No description')}
        </div>
    ) : null
}

Description.propTypes = {
    description: PropTypes.string,
    showDescription: PropTypes.bool,
}

export default Description
