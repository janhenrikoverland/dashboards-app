import { Then } from 'cypress-cucumber-preprocessor/steps'
import {
    getDashboardItem,
    itemMenuButtonSel,
    clickMenuButton,
} from '../../../elements/dashboardItem'
import { dashboards } from '../../../assets/backends'

Then('the text item does not have a context menu', () => {
    getDashboardItem(dashboards['Antenatal Care'].items.text.itemUid)
        .find(itemMenuButtonSel)
        .should('not.exist')
})

Then('the chart item has a fullscreen option in the context menu', () => {
    clickMenuButton(dashboards['Antenatal Care'].items.chart.name)
    cy.contains('View fullscreen').should('be.visible')
})
