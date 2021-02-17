import { getApiBaseUrl } from '../../support/server/utils'
import { dashboardsQuery } from '../../../src/api/dashboards'

const baseUrl = getApiBaseUrl()

const propertyMap = {
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

describe('Dashboards', () => {
    it('returns an array', () => {
        cy.request(
            `${baseUrl}/api/${dashboardsQuery.resource}?fields=${dashboardsQuery.params.fields}&paging=false`
        ).then(response => {
            expect(response.body)
                .to.have.property('dashboards')
                .and.be.a('array')

            const dashboard = response.body.dashboards[0]
            Object.entries(propertyMap).forEach(([key, value]) => {
                expect(dashboard, `has ${key} as ${value}`)
                    .to.have.property(key)
                    .and.be.a(value)
            })

            // These props are not present if the field has no value
            // Consider making a request to create a dashboard with a description
            // expect(dashboard).to.have.property('description').and.be.a('string')
            // expect(dashboard).to.have.property('displayDescription').and.be.a('string')
        })
    })
})
