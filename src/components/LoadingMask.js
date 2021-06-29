import React from 'react'
import { Layer, CenteredContent, CircularLoader } from '@dhis2/ui'

const LoadingMask = () => (
    <Layer translucent>
        <CenteredContent>
            <CircularLoader />
        </CenteredContent>
    </Layer>
)

export default LoadingMask
