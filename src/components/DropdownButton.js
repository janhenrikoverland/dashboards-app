import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { Button, Layer, Popper } from '@dhis2/ui'
import { ArrowDown, ArrowUp } from '@dhis2/ui-core/build/es/Icons/Arrow'

import styles from './DropdownButton.module.css'

const DropdownButton = ({
    children,
    className,
    icon,
    open,
    onClick,
    component,
    small,
}) => {
    const anchorRef = useRef()

    const ArrowIconComponent = open ? ArrowUp : ArrowDown
    return (
        <div ref={anchorRef}>
            <Button
                className={className}
                onClick={onClick}
                type="button"
                small={small}
                icon={icon}
            >
                {children}
                <ArrowIconComponent className={styles.arrow} />
            </Button>
            {open && (
                <Layer onClick={onClick} transparent>
                    <Popper placement="bottom-end" reference={anchorRef}>
                        {component}
                    </Popper>
                </Layer>
            )}
        </div>
    )
}

DropdownButton.propTypes = {
    component: PropTypes.element.isRequired,
    open: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
    icon: PropTypes.element,
    small: PropTypes.bool,
}

export default DropdownButton
