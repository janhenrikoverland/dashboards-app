import sortBy from 'lodash/sortBy'
import { orArray } from './util'
import { itemTypeMap } from './itemTypes'

export const getTransformYPx = elStyle => {
    if (!elStyle || !elStyle.transform) {
        return null
    }

    // find valid transforms - those with y pixels
    // the code is expecting the transform prop to
    // look like:  translate(10px, 300px)
    const transformY = elStyle.transform.split(' ')[1]?.match(/(\d+)px/)
    if (transformY) {
        return parseInt(transformY[1])
    } else {
        return null
    }
}

export const getDomGridItemsSortedByYPos = elements => {
    const types = Object.keys(itemTypeMap)
    const elementsWithBoundingRect = orArray(elements).map(el => {
        const type = Array.from(el.classList).find(
            className => types.indexOf(className) > -1
        )

        const rect = el.getBoundingClientRect()
        const y = getTransformYPx(el.style) || parseInt(rect.y)

        return {
            type,
            classList: el.classList,
            bottomY: y + parseInt(rect.height),
            el,
        }
    })
    return sortBy(elementsWithBoundingRect, ['bottomY'])
}

const isLeapPage = n => {
    // pages 5,9,13,17,21,25,29... are leap pages
    let x = 0
    const startPage = 1
    const getMultiple = factor => startPage + 4 * factor
    let multiple = getMultiple(0)
    let isLeapPage = false
    while (multiple < n) {
        multiple = getMultiple(x)
        ++x
        if (multiple === n) {
            isLeapPage = true
            break
        }
    }
    return isLeapPage
}

export const getPageBreakPositions = items => {
    // add enough page breaks so that each item could
    // be put on its own page. Due to the react-grid-layout
    // unit system, we have to estimate roughly the size of each
    // page. At regular intervals add a unit, like a leap year
    const yPosList = []
    let yPos = 0
    for (let pageNum = 1; pageNum <= items.length; ++pageNum) {
        if (pageNum === 1) {
            yPos += 35
        } else if (isLeapPage(pageNum)) {
            yPos += 40
        } else {
            yPos += 39
        }
        yPosList.push(yPos)
    }

    return yPosList
}
