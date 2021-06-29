import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { Layer, Popper } from '@dhis2/ui'
import Button from '../ButtonWithTooltip'
import { ArrowDown, ArrowUp } from './assets/Arrow'

import styles from './DropdownButton.module.css'

const DropdownButton = ({ children, open, onClick, component, ...rest }) => {
    const anchorRef = useRef()

    const ArrowIconComponent = open ? ArrowUp : ArrowDown
    return (
        <div ref={anchorRef}>
            <Button onClick={onClick} {...rest}>
                {children}
                <ArrowIconComponent className={styles.arrow} />
            </Button>
            {open && (
                <Layer onClick={onClick} transparent>
                    <Popper placement="bottom-start" reference={anchorRef}>
                        {component}
                    </Popper>
                </Layer>
            )}
        </div>
    )
}

DropdownButton.propTypes = {
    children: PropTypes.node.isRequired,
    component: PropTypes.element.isRequired,
    open: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
}

export default DropdownButton
