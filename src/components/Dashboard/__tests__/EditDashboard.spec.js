import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import WindowDimensionsProvider from '../../WindowDimensionsProvider'
import EditDashboard from '../EditDashboard'

jest.mock(
    '../../TitleBar/TitleBar',
    () =>
        function MockTitleBar() {
            return <div>TitleBar</div>
        }
)
jest.mock(
    '../../ItemGrid/ItemGrid',
    () =>
        function MockItemGrid() {
            return <div>ItemGrid</div>
        }
)

jest.mock(
    '../PrintLayoutDashboard',
    () =>
        function MockLayoutPrintPreview() {
            return <div>LayoutPrintPreview</div>
        }
)

const mockStore = configureMockStore()

const store = {
    dashboards: {
        byId: {
            rainbowdash: {
                id: 'rainbowdash',
                access: {
                    update: true,
                    delete: true,
                },
            },
        },
        items: [],
    },
    selected: {
        id: 'rainbowdash',
    },
    windowHeight: 900,
    editDashboard: {
        id: 'rainbowdash',
        access: {
            update: true,
            delete: true,
        },
    },
}

const props = {
    setEditDashboard: jest.fn(),
}

test('EditDashboard renders dashboard', () => {
    const { container } = render(
        <Provider store={mockStore(store)}>
            <WindowDimensionsProvider>
                <EditDashboard {...props} />
            </WindowDimensionsProvider>
        </Provider>
    )

    expect(container).toMatchSnapshot()
})

test('EditDashboard renders print preview', () => {
    store.editDashboard.printPreviewView = true

    const { container } = render(
        <Provider store={mockStore(store)}>
            <WindowDimensionsProvider>
                <EditDashboard {...props} />
            </WindowDimensionsProvider>
        </Provider>
    )
    expect(container).toMatchSnapshot()
})

test('EditDashboard renders message when not enough access', () => {
    store.dashboards.byId.rainbowdash.access.update = false
    store.dashboards.byId.rainbowdash.access.delete = false
    store.editDashboard.access.update = false
    store.editDashboard.access.delete = false

    const { container } = render(
        <Provider store={mockStore(store)}>
            <WindowDimensionsProvider>
                <EditDashboard {...props} />
            </WindowDimensionsProvider>
        </Provider>
    )
    expect(container).toMatchSnapshot()
})
