import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'
import { EXTENDED_TIMEOUT } from '../../../support/utils' //, goOffline, goOnline
import {
    newButtonSel,
    getViewActionButton,
    clickViewActionButton,
    dashboardTitleSel,
    dashboardChipSel,
} from '../../../elements/viewDashboard'
import { getSharingDialogUserSearch } from '../../../elements/sharingDialog'
import {
    titleInputSel,
    confirmActionDialogSel,
    // getEditActionButton,
    clickEditActionButton,
    itemSearchSel,
} from '../../../elements/editDashboard'
import { clickMenuButton } from '../../../elements/dashboardItem'

// beforeEach(() => {
//     goOnline()
// })

// afterEach(() => {
//     goOnline()
// })

Given('I delete the cached and uncached dashboard', () => {
    //delete the uncached and cached dashboard
    cy.get(dashboardChipSel).contains(UNCACHED_DASHBOARD_TITLE).click()
    cy.get(dashboardTitleSel)
        .contains(UNCACHED_DASHBOARD_TITLE)
        .should('be.visible')
    clickViewActionButton('Edit')
    cy.get(titleInputSel, EXTENDED_TIMEOUT).should('be.visible')
    clickEditActionButton('Delete')
    cy.get(confirmActionDialogSel).find('button').contains('Delete').click()
    cy.get(dashboardTitleSel).should('be.visible')

    cy.get(dashboardChipSel).contains(CACHED_DASHBOARD_TITLE).click()
    cy.get(dashboardTitleSel)
        .contains(CACHED_DASHBOARD_TITLE)
        .should('be.visible')
    clickViewActionButton('Edit')
    cy.get(titleInputSel, EXTENDED_TIMEOUT).should('be.visible')
    clickEditActionButton('Delete')
    cy.get(confirmActionDialogSel).find('button').contains('Delete').click()
    cy.get(dashboardTitleSel).should('be.visible')
})

Given('I create a cached and uncached dashboard', () => {
    createDashboard(true)
    createDashboard(false)

    // check the cached db
    cy.get(dashboardChipSel).contains(CACHED_DASHBOARD_TITLE).click()
    cy.get(dashboardTitleSel)
        .contains(CACHED_DASHBOARD_TITLE)
        .should('be.visible')

    // check that there is a "Last updated" tag
    //TODO possibly need to wait to make sure db is completely loaded?
    cy.contains('Offline data last updated').should('be.visible')
})

const DASHBOARD_ITEM_NAME = 'ANC: 1 and 3 coverage Yearly'

const UNCACHED_DASHBOARD_TITLE =
    'aa un' + new Date().toUTCString().slice(-12, -4)
const CACHED_DASHBOARD_TITLE = 'aa ca' + new Date().toUTCString().slice(-12, -4)

const createDashboard = cache => {
    cy.get(newButtonSel).click()
    cy.get(titleInputSel, EXTENDED_TIMEOUT).should('be.visible')

    const title = cache ? CACHED_DASHBOARD_TITLE : UNCACHED_DASHBOARD_TITLE

    cy.get(titleInputSel, EXTENDED_TIMEOUT).type(title)
    cy.get('[data-test="item-search"]').click()
    cy.get(`[data-test="menu-item-${DASHBOARD_ITEM_NAME}"]`).click()
    cy.get('[data-test="dhis2-uicore-layer"]').click('topLeft')
    clickEditActionButton('Save changes')
    cy.get(dashboardTitleSel, EXTENDED_TIMEOUT).should('be.visible')
    if (cache) {
        makeDashboardOffline()
    }
}

const makeDashboardOffline = () => {
    clickViewActionButton('More')
    cy.contains('Make available offline').click()
    cy.contains('Offline data last updated').should('be.visible')
}

// Scenario: I am online with an uncached dashboard when I lose connectivity

Given('I open an uncached dashboard', () => {
    //first cache the uncached dashboard - TODO remove when real
    //caching is in place
    cy.get(dashboardChipSel).contains(CACHED_DASHBOARD_TITLE).click()
    cy.get(dashboardTitleSel)
        .contains(CACHED_DASHBOARD_TITLE)
        .should('be.visible')

    makeDashboardOffline()

    // open the uncached dashboard
    cy.get(dashboardChipSel).contains(UNCACHED_DASHBOARD_TITLE).click()
    cy.get(dashboardTitleSel)
        .contains(UNCACHED_DASHBOARD_TITLE)
        .should('be.visible')

    // check that there is no "Last updated" tag
    //TODO possibly need to wait to make sure db is completely loaded?
    cy.contains('Offline data last updated').should('not.exist')

    // check that the correct options under "More" are available
    clickViewActionButton('More')
    cy.contains('Remove from offline storage').should('not.exist')
    cy.contains('Sync offline data now').should('not.exist')
    cy.contains('Make available offline').should('be.visible')
    //close the More menu
    cy.get('[data-test="dhis2-uicore-layer"]').click('topLeft')
})

When('connectivity is turned off', () => {
    cy.get('[data-test="go-offline"]').click({ force: true })
    // goOffline()
})

When('connectivity is turned on', () => {
    cy.get('[data-test="go-online"]').click({ force: true })
    // goOnline()
})

Then('all actions requiring connectivity are disabled', () => {
    // new button
    cy.get(newButtonSel).should('be.disabled')
    // edit, sharing, starring, filtering, all options under more
    getViewActionButton('Edit').should('be.disabled')
    getViewActionButton('Share').should('be.disabled')
    getViewActionButton('Add filter').should('be.disabled')
    getViewActionButton('More').should('be.enabled')

    // item context menu (everything except view fullscreen)
    clickMenuButton(DASHBOARD_ITEM_NAME)

    cy.contains('li', 'View as').should('have.class', 'disabled')
    cy.contains('li', 'Open in Data Visualizer app').should(
        'have.class',
        'disabled'
    )
    cy.contains('li', 'Show details and interpretations').should(
        'have.class',
        'disabled'
    )
    cy.contains('li', 'View fullscreen').should('not.have.class', 'disabled')
})

Then('all edit actions requiring connectivity are disabled', () => {
    cy.contains('Save changes').should('be.disabled')
    cy.contains('Print preview').should('be.disabled')
    cy.contains('Filter settings').should('be.disabled')
    cy.contains('Translate').should('be.disabled')
    cy.contains('Delete').should('be.disabled')
    cy.contains('Exit without saving').should('not.be.disabled')

    // TODO: item selector
    cy.get(itemSearchSel).find('input').should('have.class', 'disabled')
})

// Scenario: I am online with a cached dashboard when I lose connectivity
Given('I open a cached dashboard', () => {
    // open the cached dashboard
    cy.get(dashboardChipSel).contains(CACHED_DASHBOARD_TITLE).click()
    cy.get(dashboardTitleSel)
        .contains(CACHED_DASHBOARD_TITLE)
        .should('be.visible')

    makeDashboardOffline()
    // check that the chip has the icon? (or maybe component test for this)
})

Then('the cached dashboard options are available', () => {
    // check that the correct options under "More" are available
    clickViewActionButton('More')
    cy.contains('Remove from offline storage').should('be.visible')
    cy.contains('Sync offline data now').should('be.visible')
    cy.contains('Make available offline').should('not.exist')
    // close the Menu
    cy.get('[data-test="dhis2-uicore-layer"]').click('topLeft')
})

// Scenario: I am offline and switch to an uncached dashboard
When('I click to open an uncached dashboard', () => {
    cy.get(dashboardChipSel).contains(UNCACHED_DASHBOARD_TITLE).click()
    cy.get(dashboardTitleSel)
        .contains(UNCACHED_DASHBOARD_TITLE)
        .should('be.visible')

    cy.contains('Offline data last updated').should('not.exist')
})

When('I click to open an uncached dashboard when offline', () => {
    cy.get(dashboardChipSel).contains(UNCACHED_DASHBOARD_TITLE).click()
})

When('I click to open a cached dashboard when offline', () => {
    cy.get(dashboardChipSel).contains(CACHED_DASHBOARD_TITLE).click()
})

// Scenario: I am offline and switch to a cached dashboard
Then('the cached dashboard is loaded and displayed in view mode', () => {
    cy.get(dashboardTitleSel)
        .contains(CACHED_DASHBOARD_TITLE)
        .should('be.visible')

    cy.contains('Offline data last updated').should('be.visible')
    cy.contains(DASHBOARD_ITEM_NAME).should('be.visible')
})

Then('the uncached dashboard is loaded and displayed in view mode', () => {
    cy.get(dashboardTitleSel)
        .contains(UNCACHED_DASHBOARD_TITLE)
        .should('be.visible')

    cy.contains('Offline data last updated').should('not.exist')
    cy.contains(DASHBOARD_ITEM_NAME).should('be.visible')
})

// Scenario: I am offline and switch to an uncached dashboard and then connectivity is restored

// Scenario: I am in edit mode on an uncached dashboard when I lose connectivity and then I exit without saving and then connectivity is restored
Given('I open an uncached dashboard in edit mode', () => {
    cy.get(dashboardChipSel).contains(UNCACHED_DASHBOARD_TITLE).click()
    cy.get(dashboardTitleSel)
        .contains(UNCACHED_DASHBOARD_TITLE)
        .should('be.visible')

    clickViewActionButton('Edit')
    cy.get(titleInputSel, EXTENDED_TIMEOUT).should('be.visible')
})

Then(
    'the dashboard is not available while offline message is displayed',
    () => {
        // title not shown
        cy.get(dashboardTitleSel).should('not.exist')

        //offline message is shown
        cy.contains('This dashboard cannot be loaded while offline').should(
            'be.visible'
        )
    }
)
Then('the uncached dashboard is loaded and displayed in view mode', () => {
    //title is shown
    cy.get(dashboardTitleSel)
        .should('be.visible')
        .and('contain', UNCACHED_DASHBOARD_TITLE)
})

// Scenario: I am in edit mode on a cached dashboard when I lose connectivity and then I exit without saving
Given('I open a cached dashboard in edit mode', () => {
    cy.get(dashboardChipSel).contains(CACHED_DASHBOARD_TITLE).click()
    cy.get(dashboardTitleSel)
        .contains(CACHED_DASHBOARD_TITLE)
        .should('be.visible')

    makeDashboardOffline()

    clickViewActionButton('Edit')
    cy.get(titleInputSel, EXTENDED_TIMEOUT).should('be.visible')
})

When('I open sharing settings', () => {
    clickViewActionButton('Share')
    cy.get('h2').contains(CACHED_DASHBOARD_TITLE).should('be.visible')
    getSharingDialogUserSearch().should('be.visible')
})

Then('it is not possible to change sharing settings', () => {
    cy.contains('Not available offline').should('be.visible')

    // getSharingDialogUserSearch().should('not.be.visible')

    cy.get('button').contains('Close').click()
})

// Scenario: The interpretations panel is open when connectivity is lost
When('I open the interpretations panel', () => {
    clickMenuButton(DASHBOARD_ITEM_NAME)
    cy.contains('Show details and interpretations').click()
    cy.get('[placeholder="Write an interpretation"]')
        .scrollIntoView()
        .should('be.visible')
})

Then('it is not possible to interact with interpretations', () => {
    cy.contains('Not available offline').should('be.visible')

    // cy.get('[placeholder="Write an interpretation"]')
    //     .scrollIntoView()
    //     .should('not.be.visible')
})
