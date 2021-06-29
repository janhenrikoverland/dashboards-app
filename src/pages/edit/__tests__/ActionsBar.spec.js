import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { useD2 } from '@dhis2/app-runtime-adapter-d2'
import { useDataEngine } from '@dhis2/app-runtime'
import ActionsBar from '../ActionsBar'
import { NEW_DASHBOARD_STATE } from '../../../reducers/editDashboard'

const mockStore = configureMockStore()

jest.mock('@dhis2/app-runtime-adapter-d2')
jest.mock('@dhis2/app-runtime')

jest.mock(
    '../FilterSettingsDialog',
    () =>
        function MockFilterSettingsDialog() {
            return <div className="mock-filter-settings-dialog" />
        }
)

jest.mock(
    '@dhis2/d2-ui-translation-dialog',
    () =>
        function MockTranslationDialog() {
            return <div className="mock-translation-dialog" />
        }
)

/* eslint-disable react/prop-types */
jest.mock(
    '../ConfirmActionDialog',
    () =>
        function MockConfirmActionDialog({ open }) {
            return open ? <div className="mock-confirm-action-dialog" /> : null
        }
)
/* eslint-enable react/prop-types */

useD2.mockReturnValue({
    d2: {
        currentUser: 'rainbowDash',
    },
})

useDataEngine.mockReturnValue({
    dataEngine: {},
})

test('renders the ActionsBar without Delete when no delete access', async () => {
    const store = {
        editDashboard: {
            id: 'rainbowDash',
            name: 'Rainbow Dash',
            access: {
                update: true,
                delete: false,
            },
            printPreviewView: false,
            isDirty: false,
        },
    }

    const { container } = render(
        <Provider store={mockStore(store)}>
            <ActionsBar />
        </Provider>
    )

    expect(container).toMatchSnapshot()
})

test('renders only the Go to Dashboards button when no update access', async () => {
    const store = {
        editDashboard: {
            id: 'rainbowDash',
            name: 'Rainbow Dash',
            access: {
                update: false,
                delete: false,
            },
            printPreviewView: false,
            isDirty: false,
        },
    }

    const { container } = render(
        <Provider store={mockStore(store)}>
            <ActionsBar />
        </Provider>
    )

    expect(container).toMatchSnapshot()
})

test('renders Save and Discard buttons but not translation dialog when new dashboard (no dashboard id)', async () => {
    const store = {
        editDashboard: NEW_DASHBOARD_STATE,
    }

    const { container } = render(
        <Provider store={mockStore(store)}>
            <ActionsBar />
        </Provider>
    )

    expect(container).toMatchSnapshot()
})

test('renders Translate, Delete, and Discard buttons when delete access', async () => {
    const store = {
        editDashboard: {
            id: 'rainbowDash',
            name: 'Rainbow Dash',
            access: {
                update: true,
                delete: true,
            },
            printPreviewView: false,
            isDirty: false,
        },
    }

    const { container } = render(
        <Provider store={mockStore(store)}>
            <ActionsBar />
        </Provider>
    )

    expect(container).toMatchSnapshot()
})
