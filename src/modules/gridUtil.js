// Dimensions for the react-grid-layout
import sortBy from 'lodash/sortBy'
import { isVisualizationType } from './itemTypes'
import { isSmallScreen } from './smallScreen'

export const GRID_COMPACT_TYPE = 'vertical' // vertical | horizonal | null
export const GRID_ROW_HEIGHT_PX = 10
export const MARGIN_PX = [10, 10]

const SM_SCREEN_MIN_ITEM_GRID_HEIGHT = 13 // minimum of ~320px
export const SM_SCREEN_GRID_COLUMNS = 1
export const MARGIN_SM_PX = [0, 16]
export const GRID_PADDING_PX = [0, 0]
// sum of left+right padding of dashboard-wrapper (App.css)
export const DASHBOARD_WRAPPER_LR_MARGIN_PX = 32
// make an assumption about the original item w/h ratio
// assumes grid width of ~1200px at time dashboard was created
const GRID_COL_WIDTH_PX = 10
export const GRID_COLUMNS = 60

// Dimensions for getShape
export const NEW_ITEM_SHAPE = { x: 0, y: 0, w: 20, h: 29 }
const NUMBER_OF_ITEM_COLS = 2

const MAX_ITEM_GRID_WIDTH = GRID_COLUMNS - 1

export const MAX_ITEM_GRID_HEIGHT = 34
export const MAX_ITEM_GRID_HEIGHT_OIPP = 35
export const MAX_ITEM_GRID_WIDTH_OIPP = 56

const MIN_ITEM_GRID_HEIGHT = 4

// isNonNegativeInteger

const isNonNegativeInteger = x => Number.isInteger(x) && x >= 0

// Does the item have all the shape properties?

export const hasShape = item =>
    isNonNegativeInteger(item.x) &&
    isNonNegativeInteger(item.y) &&
    isNonNegativeInteger(item.w) &&
    isNonNegativeInteger(item.h)

// returns a rectangular grid block dimensioned with x, y, w, h in grid units.
// based on a grid with 3 items across
const getShape = i => {
    const col = i % NUMBER_OF_ITEM_COLS
    const row = Math.floor(i / NUMBER_OF_ITEM_COLS)
    const itemWidth = Math.floor(MAX_ITEM_GRID_WIDTH / NUMBER_OF_ITEM_COLS)
    const itemHeight = GRID_ROW_HEIGHT_PX * 2

    return {
        x: col * itemWidth,
        y: row * itemHeight,
        w: itemWidth,
        h: itemHeight,
    }
}

/**
 * Returns an array of items containing the x, y, w, h dimensions
 * and the item's originalheight in pixels
 * and dimensions to create the small layout (x, y, w, h)
 * @function
 * @param {Array} items
 * @returns {Array}
 */

export const withShape = (items = []) => {
    const itemsWithShape = items.map((item, i) =>
        hasShape(item) ? item : Object.assign({}, item, getShape(i))
    )

    return itemsWithShape.map(item =>
        Object.assign({}, item, { originalH: item.h })
    )
}

export const getGridWidth = windowWidthPx =>
    windowWidthPx - DASHBOARD_WRAPPER_LR_MARGIN_PX

const getGridUnitsForSmFromPx = hPx => {
    const gridUnitHeightPx = GRID_ROW_HEIGHT_PX + MARGIN_SM_PX[1]
    return Math.round((hPx + MARGIN_SM_PX[1]) / gridUnitHeightPx)
}

export const getProportionalHeight = (item, windowWidthPx) => {
    // get w/h ratio of the original item
    const wPx = getItemWHPx(item.w, GRID_COL_WIDTH_PX, MARGIN_PX[0])
    const hPx = getItemWHPx(item.h, GRID_ROW_HEIGHT_PX, MARGIN_PX[1])
    const ratioWH = wPx / hPx

    if (!isVisualizationType(item)) {
        return getGridUnitsForSmFromPx(hPx)
    }

    const gridWidthPx = getGridWidth(windowWidthPx)

    // get new height in px based on the ratio
    const newColWidthPx =
        (gridWidthPx -
            MARGIN_SM_PX[0] * (SM_SCREEN_GRID_COLUMNS - 1) -
            GRID_PADDING_PX[0] * 2) /
        SM_SCREEN_GRID_COLUMNS
    const newWPx = newColWidthPx * SM_SCREEN_GRID_COLUMNS
    const newHPx = Math.round(newWPx / ratioWH)

    //convert height in px back to grid units
    const h = getGridUnitsForSmFromPx(newHPx)

    // item must be at least the set minimum
    return h < SM_SCREEN_MIN_ITEM_GRID_HEIGHT
        ? SM_SCREEN_MIN_ITEM_GRID_HEIGHT
        : h
}

export const getSmallLayout = (items, windowWidthPx) =>
    sortBy(items, ['y', 'x']).map((item, i) =>
        Object.assign({}, item, {
            x: 0,
            y: i,
            w: SM_SCREEN_GRID_COLUMNS,
            h: getProportionalHeight(item, windowWidthPx),
        })
    )

export const getGridItemProperties = itemId => {
    return {
        i: itemId,
        minH: MIN_ITEM_GRID_HEIGHT,
    }
}

export const getPageBreakItemShape = (yPos, isStatic = true) => {
    return {
        x: 0,
        y: yPos,
        w: MAX_ITEM_GRID_WIDTH,
        h: 5,
        static: !!isStatic,
        minH: 1,
    }
}

export const getPrintTitlePageItemShape = isOneItemPerPage => {
    return {
        x: 0,
        y: 0,
        w: isOneItemPerPage ? MAX_ITEM_GRID_WIDTH_OIPP : MAX_ITEM_GRID_WIDTH,
        h: MAX_ITEM_GRID_HEIGHT,
        static: true,
        minH: 1,
    }
}

/**
 * Calculates the grid item's height in pixels based
 * on the height in grid units. This calculation
 * is copied directly from react-grid-layout
 * calculateUtils.js (calcGridItemWHPx)
 *
 * Each row's px height is the sum of the GRID_ROW_HEIGHT_PX + MARGIN-Y
 * So the calculation is:
 * GRID_ROW_HEIGHT_PX * Number of rows
 * +
 * yMargin * Number of rows-1
 *
 * @param {Object} item item containing shape (x, y, w, h)
 */
export const getItemHeightPx = (item, windowWidthPx) => {
    if (isSmallScreen(windowWidthPx)) {
        const h = item.smallOriginalH
            ? item.smallOriginalH
            : getProportionalHeight(item, windowWidthPx)
        return getItemWHPx(h, GRID_ROW_HEIGHT_PX, MARGIN_SM_PX[1])
    }

    return getItemWHPx(item.originalH, GRID_ROW_HEIGHT_PX, MARGIN_PX[1])
}

const getItemWHPx = (gridUnits, colOrRowSize, marginPx) =>
    Math.round(colOrRowSize * gridUnits + Math.max(0, gridUnits - 1) * marginPx)

// Auto layout

const getNumberOfColGroupCols = (
    numberOfColGroups = 2,
    maxCols = GRID_COLUMNS
) => {
    if (numberOfColGroups < 1 || numberOfColGroups > maxCols) {
        return null
    }

    return Math.floor(maxCols / numberOfColGroups)
}

const sortItems = items =>
    items.slice().sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y))

export const getAutoItemShapes = (
    dashboardItems,
    numberOfColGroups,
    maxCols
) => {
    const numberOfColGroupCols = getNumberOfColGroupCols(
        numberOfColGroups,
        maxCols
    )

    if (!numberOfColGroupCols || !dashboardItems.length) {
        return null
    }

    const items = sortItems(dashboardItems)
    const itemsWithNewShape = []
    const itemHeight = NEW_ITEM_SHAPE.h

    for (let i = 0, colIdx = 0, rowIdx = 0, item; i < items.length; i++) {
        item = items[i]

        itemsWithNewShape.push({
            ...item,
            w: numberOfColGroupCols,
            h: itemHeight,
            x: numberOfColGroupCols * colIdx,
            y: itemHeight * rowIdx,
        })

        colIdx = colIdx + 1

        if (colIdx === numberOfColGroups) {
            colIdx = 0
            rowIdx = rowIdx + 1
        }
    }

    return itemsWithNewShape
}
