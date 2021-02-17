import React from 'react'
import { mount } from 'enzyme'
import toJson from 'enzyme-to-json'
import { ViewDashboard } from '../ViewDashboard'

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useEffect: f => f(),
}))

jest.mock(
    '../../ControlBar/ViewControlBar/DashboardsBar',
    () =>
        function MockDashboardsBar() {
            return <div>MockDashboardsBar</div>
        }
)
jest.mock(
    '../../TitleBar/ViewTitleBar',
    () =>
        function MockViewTitleBar() {
            return <div>MockViewTitleBar</div>
        }
)
jest.mock(
    '../../FilterBar/FilterBar',
    () =>
        function MockFilterBar() {
            return <div>MockFilterBar</div>
        }
)

jest.mock(
    '../../ItemGrid/ViewItemGrid',
    () =>
        function MockViewItemGrid() {
            return <div>MockViewItemGrid</div>
        }
)

describe('ViewDashboard', () => {
    let props

    beforeEach(() => {
        props = {
            clearEditDashboard: jest.fn(),
            clearPrintDashboard: jest.fn(),
            dashboardIsEditing: false,
            dashboardIsPrinting: false,
        }
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders correctly default', () => {
        const tree = mount(<ViewDashboard {...props} />)
        expect(toJson(tree)).toMatchSnapshot()
    })

    it('clears edit dashboard after redirecting from Edit mode', () => {
        props.dashboardIsEditing = true
        mount(<ViewDashboard {...props} />)
        expect(props.clearEditDashboard).toHaveBeenCalled()
        expect(props.clearPrintDashboard).not.toHaveBeenCalled()
    })

    it('clears print dashboard after redirecting from Print mode', () => {
        props.dashboardIsPrinting = true
        mount(<ViewDashboard {...props} />)
        expect(props.clearEditDashboard).not.toHaveBeenCalled()
        expect(props.clearPrintDashboard).toHaveBeenCalled()
    })
})
