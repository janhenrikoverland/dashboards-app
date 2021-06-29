import React from 'react'
import { render } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import Chip from '../Chip'
import { useCacheableSectionStatus } from '../../../../modules/useCacheableSectionStatus'

jest.mock('../../../../modules/useCacheableSectionStatus', () => ({
    useCacheableSectionStatus: jest.fn(),
}))

const mockOfflineDashboard = {
    lastUpdated: 'Jan 10',
    recording: false,
}

const mockNonOfflineDashboard = {
    lastUpdated: null,
    recording: false,
}

const defaultProps = {
    starred: false,
    selected: false,
    onClick: jest.fn(),
    label: 'Rainbow Dash',
    dashboardId: 'rainbowdash',
    classes: {
        icon: 'iconClass',
        selected: 'selectedClass',
        unselected: 'unselectedClass',
    },
}

test('renders an unstarred chip for an non-offline dashboard', () => {
    useCacheableSectionStatus.mockImplementationOnce(
        () => mockNonOfflineDashboard
    )
    const { container } = render(
        <Router history={createMemoryHistory()}>
            <Chip {...defaultProps} />
        </Router>
    )

    expect(container).toMatchSnapshot()
})

test('renders an unstarred chip for an offline dashboard', () => {
    useCacheableSectionStatus.mockImplementationOnce(() => mockOfflineDashboard)
    const { container } = render(
        <Router history={createMemoryHistory()}>
            <Chip {...defaultProps} />
        </Router>
    )

    expect(container).toMatchSnapshot()
})

test('renders a starred chip for a non-offline dashboard', () => {
    useCacheableSectionStatus.mockImplementationOnce(
        () => mockNonOfflineDashboard
    )
    const props = Object.assign({}, defaultProps, { starred: true })
    const { container } = render(
        <Router history={createMemoryHistory()}>
            <Chip {...props} />
        </Router>
    )

    expect(container).toMatchSnapshot()
})

test('renders a starred chip for an offline dashboard', () => {
    useCacheableSectionStatus.mockImplementationOnce(() => mockOfflineDashboard)
    const props = Object.assign({}, defaultProps, { starred: true })
    const { container } = render(
        <Router history={createMemoryHistory()}>
            <Chip {...props} />
        </Router>
    )

    expect(container).toMatchSnapshot()
})

test('renders a starred, selected chip for non-offline dashboard', () => {
    useCacheableSectionStatus.mockImplementationOnce(
        () => mockNonOfflineDashboard
    )
    const props = Object.assign({}, defaultProps, {
        starred: true,
        selected: true,
    })
    const { container } = render(
        <Router history={createMemoryHistory()}>
            <Chip {...props} />
        </Router>
    )

    expect(container).toMatchSnapshot()
})

test('renders a starred, selected chip for offline dashboard', () => {
    useCacheableSectionStatus.mockImplementationOnce(() => mockOfflineDashboard)
    const props = Object.assign({}, defaultProps, {
        starred: true,
        selected: true,
    })
    const { container } = render(
        <Router history={createMemoryHistory()}>
            <Chip {...props} />
        </Router>
    )

    expect(container).toMatchSnapshot()
})

test('renders a starred, selected chip for offline dashboard that is recording', () => {
    useCacheableSectionStatus.mockImplementationOnce(() => ({
        lastUpdated: 'Jan 10',
        recording: true,
    }))
    const props = Object.assign({}, defaultProps, {
        starred: true,
        selected: true,
    })
    const { container } = render(
        <Router history={createMemoryHistory()}>
            <Chip {...props} />
        </Router>
    )

    expect(container).toMatchSnapshot()
})
