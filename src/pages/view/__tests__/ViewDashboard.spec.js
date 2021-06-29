import React from 'react'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import ViewDashboard from '../ViewDashboard'
import { apiPostDataStatistics } from '../../../api/dataStatistics'
import { apiFetchDashboard } from '../../../api/fetchDashboard'

jest.mock('../../../modules/useOnlineStatus', () => ({
    useOnlineStatus: jest.fn(() => ({ isOnline: true })),
}))

jest.mock('../../../api/fetchDashboard')

jest.mock(
    '../DashboardsBar/DashboardsBar',
    () =>
        function MockDashboardsBar() {
            return <div>DashboardsBar</div>
        }
)

jest.mock('../TitleBar', () => {
    return {
        TitleBar: function MockTitleBar() {
            return <div>TitleBar</div>
        },
    }
})

jest.mock(
    '../FilterBar/FilterBar',
    () =>
        function MockFilterBar() {
            return <div>MockFilterBar</div>
        }
)

jest.mock(
    '../ItemGrid',
    () =>
        function MockItemGrid() {
            return <div>MockItemGrid</div>
        }
)

jest.mock('../../../api/dataStatistics', () => ({
    apiPostDataStatistics: jest.fn(() => {
        return new Promise(resolve => resolve(true))
    }),
}))

const dashboardId = 'rainbowdash'
const store = {
    dashboards: {
        [dashboardId]: {
            id: dashboardId,
            displayName: 'Rainbow Dash',
            starred: true,
        },
    },

    selected: {
        id: dashboardId,
    },
    passiveViewRegistered: false,
}

window.HTMLElement.prototype.scroll = function () {}

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

test('ViewDashboard renders dashboard', async () => {
    const promise = Promise.resolve({
        id: dashboardId,
        dashboardItems: [],
    })
    apiFetchDashboard.mockResolvedValue(promise)

    const { container } = render(
        <>
            <header />
            <Provider store={mockStore(store)}>
                <ViewDashboard id={dashboardId} />
            </Provider>
        </>
    )

    await act(() => promise)
    expect(container).toMatchSnapshot()
    jest.clearAllMocks()
})

test('ViewDashboard does not post passive view to api if passive view has been registered', async () => {
    store.passiveViewRegistered = true
    const promise = Promise.resolve({
        id: dashboardId,
        dashboardItems: [],
    })
    apiFetchDashboard.mockResolvedValue(promise)

    render(
        <>
            <header />
            <Provider store={mockStore(store)}>
                <ViewDashboard id={dashboardId} />
            </Provider>
        </>
    )

    await act(() => promise)
    expect(apiPostDataStatistics).not.toHaveBeenCalled()
    jest.clearAllMocks()
})

test('ViewDashboard posts passive view to api if passive view has not been registered', async () => {
    store.passiveViewRegistered = false
    const promise = Promise.resolve({
        id: dashboardId,
        dashboardItems: [],
    })
    apiFetchDashboard.mockResolvedValue(promise)

    render(
        <>
            <header />
            <Provider store={mockStore(store)}>
                <ViewDashboard id={dashboardId} />
            </Provider>
        </>
    )

    await act(() => promise)

    expect(apiPostDataStatistics).toHaveBeenCalled()
    jest.clearAllMocks()
})
