import { getApiBaseUrl } from '../../support/server/utils'
import { newDashboardBody } from '../../assets/backends/sierraLeone_236'
import { dashboardQuery } from '../../../src/api/dashboards'
import {
    REPORT_TABLE,
    CHART,
    MAP,
    EVENT_REPORT,
    EVENT_CHART,
    APP,
    REPORTS,
    RESOURCES,
    // USERS,
    MESSAGES,
    TEXT,
} from '../../../src/modules/itemTypes'

const baseUrl = getApiBaseUrl()

const dashboardPropertyMap = {
    id: 'string',
    name: 'string',
    displayName: 'string',
    favorite: 'boolean',
    user: 'object',
    created: 'string',
    lastUpdated: 'string',
    access: 'object',
    href: 'string',
    dashboardItems: 'array',
}

const dashboardItemPropertyMap = {
    REPORT_TABLE: {
        propName: 'reportTable',
        propType: 'object',
        propValue: ['id', 'name'],
    },
    CHART: {
        propName: 'chart',
        propType: 'object',
        propValue: ['id', 'name', 'type'],
    },
    MAP: {
        propName: 'map',
        propType: 'object',
        propValue: ['id', 'name'],
    },
    EVENT_REPORT: {
        propName: 'eventReport',
        propType: 'object',
        propValue: ['id', 'name'],
    },
    EVENT_CHART: {
        propName: 'eventChart',
        propType: 'object',
        propValue: ['id', 'name'],
    },
    APP: {
        propName: 'appKey',
        propType: 'string',
        propValue: null,
    },
    REPORTS: {
        propName: 'reports',
        propType: 'array',
        propValue: ['id', 'name', 'type'],
    },
    RESOURCES: {
        propName: 'resources',
        propType: 'array',
        propValue: ['id', 'name'],
    },
    // USERS: [{ id: '', name: '' }],
    MESSAGES: {
        propName: 'messages',
        propType: 'boolean',
        propValue: true,
    },
    TEXT: {
        propName: 'text',
        propType: 'string',
        propValue: null,
    },
}

let dashboardId

before(() => {
    // add the scorecard widget
    cy.request(
        'POST',
        `${baseUrl}/api/appHub/3f642d6f-43d7-47bb-8c70-5d9895e33e11
        `
    ).then(() => {
        //create a dashboard with one item of every type
        cy.request({
            method: 'POST',
            url: `${baseUrl}/api/dashboards`,
            body: newDashboardBody(new Date().toUTCString()),
        }).as('dashboard')
    })
})

it('Creates a dashboard', () => {
    cy.get('@dashboard').then(response => {
        expect(response.status).to.equal(201)
        expect(response.body.response).to.be.a('object')
        dashboardId = response.body.response.uid
    })
})

it('Has correct dashboard properties', () => {
    // user[id,displayName~rename(name)],
    cy.request(
        `${baseUrl}/api/${dashboardQuery.resource}/${dashboardId}?fields=${dashboardQuery.params.fields}`
    ).then(response => {
        const dashboard = response.body
        expect(dashboard).to.be.a('object')

        // check the basic properties
        Object.entries(dashboardPropertyMap).forEach(([key, value]) => {
            expect(dashboard, `has ${key} as ${value}`)
                .to.have.property(key)
                .and.be.a(value)
        })
    })
})

it('Has correct dashboard item properties', () => {
    const checkCoreProps = (obj, props) => {
        const corePropTypes = {
            id: 'string',
            name: 'string',
            type: 'string',
            x: 'number',
            y: 'number',
            w: 'number',
            h: 'number',
        }
        props.forEach(prop => {
            expect(obj).to.have.property(prop).and.be.a(corePropTypes[prop])
        })
    }

    cy.request(
        `${baseUrl}/api/${dashboardQuery.resource}/${dashboardId}?fields=${dashboardQuery.params.fields}`
    ).then(response => {
        const dashboard = response.body

        dashboard.dashboardItems.forEach(item => {
            checkCoreProps(item, ['id', 'x', 'y', 'w', 'h'])

            switch (item.type) {
                case CHART:
                    expect(
                        item,
                        `${item.type} item has property "chart" of type object`
                    )
                        .to.have.property('chart')
                        .and.be.a('object')
                    checkCoreProps(item.chart, ['id', 'name', 'type'])
                    break
                case REPORT_TABLE:
                    expect(
                        item,
                        `${item.type} item has property "reportTable" of type object`
                    )
                        .to.have.property('reportTable')
                        .and.be.a('object')

                    checkCoreProps(item.reportTable, ['id', 'name'])

                    break
                case EVENT_CHART:
                    expect(
                        item,
                        `${item.type} item has property "eventChart" of type object`
                    )
                        .to.have.property('eventChart')
                        .and.be.a('object')
                    checkCoreProps(item.eventChart, ['id', 'name'])
                    break
                case EVENT_REPORT:
                    expect(
                        item,
                        `${item.type} item has property "eventReport" of type object`
                    )
                        .to.have.property('eventReport')
                        .and.be.a('object')
                    checkCoreProps(item.eventReport, ['id', 'name'])
                    break
                case MAP:
                    expect(
                        item,
                        `${item.type} item has property "map" of type object`
                    )
                        .to.have.property('map')
                        .and.be.a('object')
                    checkCoreProps(item.map, ['id', 'name'])
                    break
                case REPORTS: {
                    expect(
                        item,
                        `${item.type} item has property "reports" of type array`
                    )
                        .to.have.property('reports')
                        .and.be.a('array')
                    expect(item.reports).to.have.lengthOf(1)
                    const report = item.reports[0]
                    checkCoreProps(report, ['id', 'name', 'type'])
                    break
                }
                case RESOURCES: {
                    expect(
                        item,
                        `${item.type} item has property "resources" of type array`
                    )
                        .to.have.property('resources')
                        .and.be.a('array')
                    expect(item.resources).to.have.lengthOf(1)
                    const resource = item.resources[0]
                    checkCoreProps(resource, ['id', 'name'])
                    break
                }
                case TEXT:
                    expect(
                        item,
                        `${item.type} item has property "text" of type string`
                    )
                        .to.have.property('text')
                        .and.be.a('string')
                    break
                case MESSAGES: {
                    expect(
                        item,
                        `${item.type} item has property "messages" of type boolean`
                    )
                        .to.have.property('messages')
                        .and.be.a('boolean')
                    expect(item.messages).to.equal(true)
                    break
                }
                case APP:
                    expect(
                        item,
                        `${item.type} item has property "appKey" of type string`
                    )
                        .to.have.property('appKey')
                        .and.be.a('string')
                    break
                default:
                    break
            }
        })
    })
})

after(() => {
    //delete the dashboard
    cy.request(
        'DELETE',
        `${baseUrl}/api/dashboards/${dashboardId}`
    ).then(response => expect(response.status).to.equal(200))
})
