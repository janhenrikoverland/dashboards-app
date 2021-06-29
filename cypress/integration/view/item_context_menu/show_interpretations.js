import { When, Then } from 'cypress-cucumber-preprocessor/steps'
import {
    itemDetailsSel,
    clickMenuButton,
    getDashboardItem,
} from '../../../elements/dashboardItem'
import { dashboards } from '../../../assets/backends'

// these tests being run on the "Delivery" dashboard
const chartName = dashboards.Delivery.items.chart.name

/*
Scenario: Open the interpretations panel
*/

When(
    'I click Show details and interpretations on a chart dashboard item',
    () => {
        clickMenuButton(chartName)
        cy.contains('Show details and interpretations').click()
    }
)
Then('the interpretations panel is displayed', () => {
    getDashboardItem(chartName)
        .find(itemDetailsSel)
        .contains('Chart details')
        .scrollIntoView()
        .should('be.visible')

    getDashboardItem(chartName)
        .find(itemDetailsSel)
        .contains('Interpretations')
        .scrollIntoView()
        .should('be.visible')
})
