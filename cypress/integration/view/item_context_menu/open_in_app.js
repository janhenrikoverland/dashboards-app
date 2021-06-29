import { When, Then } from 'cypress-cucumber-preprocessor/steps'
import { clickMenuButton } from '../../../elements/dashboardItem'
import { dashboards } from '../../../assets/backends'

// these tests being run on the "Delivery" dashboard
const chartName = dashboards.Delivery.items.chart.name
const chartItemVisUrl = `dhis-web-data-visualizer/#/${dashboards.Delivery.items.chart.visUid}`

/*
Scenario: Open chart in Data Visualizer app
*/

When('I click Open in Data Visualizer app on a chart dashboard item', () => {
    clickMenuButton(chartName)

    cy.contains('Open in Data Visualizer app')
        .should('have.attr', 'href')
        .and('include', chartItemVisUrl)

    /**
     * Since Cypress cannot work with multiple tabs and more
     * than one domain in a single test, modify the link to:
     *  1) open in the current Cypress tab instead of new tab
     *  2) open on the test domain instead of the api domain
     */
    cy.contains('Open in Data Visualizer app')
        .invoke('removeAttr', 'target')
        .invoke(
            'attr',
            'href',
            `${Cypress.config().baseUrl}/${chartItemVisUrl}`
        )
        .click()
})

Then('the chart is opened in the Data Visualizer app', () => {
    // This url is a 404, but the goal is to confirm that
    // clicking on the link actually navigates to another url.
    cy.url().should('include', chartItemVisUrl)
})
