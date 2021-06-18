import {
    hasShape,
    withShape,
    getSmallLayout,
    getProportionalHeight,
    SM_SCREEN_GRID_COLUMNS,
    getAutoItemShapes,
} from '../gridUtil'

describe('withShape', () => {
    it('returns objects with new properties (x, y, w, h)', () => {
        const items = withShape([{}])
        expect(items).toMatchObject([{ x: 0, y: 0, w: 29, h: 20 }])
    })

    it('returns same objects', () => {
        const items = withShape([
            { x: 0, y: 0, w: 29, h: 20 },
            { x: 10, y: 0, w: 10, h: 10 },
        ])
        expect(items).toMatchObject([
            { x: 0, y: 0, w: 29, h: 20 },
            { x: 10, y: 0, w: 10, h: 10 },
        ])
    })

    it('returns empty array', () => {
        const items = withShape([])
        expect(items).toEqual([])
    })
})

describe('hasShape', () => {
    it('should return true if grid block object has correct properties', () => {
        expect(hasShape({ x: 9, y: 20, w: 9, h: 10 })).toBeTruthy()
    })

    it('should return false if grid block object is missing properties', () => {
        expect(hasShape({ x: 9, y: 20, w: 9 })).toBeFalsy()
    })

    it('should return false if grid block object has invalid properties', () => {
        expect(hasShape({ x: 9, y: 20, w: 9, h: 'octopus' })).toBeFalsy()
    })
})

describe('getProportionalHeight', () => {
    it('returns the proportional height in grid units for 480px', () => {
        const item = { w: 20, h: 20, type: 'CHART' }
        expect(getProportionalHeight(item, 480)).toEqual(18)
    })

    it('returns the proportional height in grid units for 360px', () => {
        const item = { w: 20, h: 20, type: 'CHART' }
        expect(getProportionalHeight(item, 360)).toEqual(13)
    })

    it('returns the initial height for non vis type', () => {
        const item = { w: 20, h: 10, type: 'TEXT' }
        expect(getProportionalHeight(item, 360)).toEqual(8)
    })
})

describe('getSmallLayout', () => {
    it('returns layout for small screen', () => {
        const items = [
            { x: 0, y: 0, w: 33, h: 15, type: 'CHART', i: 'A' },
            { x: 33, y: 15, w: 14, h: 30, type: 'CHART', i: 'B' },
            { x: 15, y: 7, w: 7, h: 4, type: 'CHART', i: 'C' },
            { x: 20, y: 25, w: 9, h: 16, type: 'CHART', i: 'D' },
            { x: 7, y: 25, w: 8, h: 16, type: 'CHART', i: 'E' },
            { x: 0, y: 30, w: 10, h: 10, type: 'TEXT', i: 'F' },
        ]

        const expectedLayout = [
            {
                x: 0,
                y: 0,
                w: SM_SCREEN_GRID_COLUMNS,
                h: 13,
                type: 'CHART',
                i: 'A',
            },
            {
                x: 0,
                y: 1,
                w: SM_SCREEN_GRID_COLUMNS,
                h: 13,
                type: 'CHART',
                i: 'C',
            },
            {
                x: 0,
                y: 2,
                w: SM_SCREEN_GRID_COLUMNS,
                h: 38,
                type: 'CHART',
                i: 'B',
            },
            {
                x: 0,
                y: 3,
                w: SM_SCREEN_GRID_COLUMNS,
                h: 36,
                type: 'CHART',
                i: 'E',
            },
            {
                x: 0,
                y: 4,
                w: SM_SCREEN_GRID_COLUMNS,
                h: 32,
                type: 'CHART',
                i: 'D',
            },
            {
                x: 0,
                y: 5,
                w: SM_SCREEN_GRID_COLUMNS,
                h: 8,
                type: 'TEXT',
                i: 'F',
            },
        ]

        expect(getSmallLayout(items, 480)).toMatchObject(expectedLayout)
    })
})

describe('getAutoItemShapes', () => {
    const items = [
        { x: 16, y: 20, w: 18, h: 20, id: 'e' },
        { x: 0, y: 0, w: 10, h: 20, id: 'a' },
        { x: 0, y: 40, w: 29, h: 20, id: 'g' },
        { x: 10, y: 0, w: 24, h: 20, id: 'b' },
        { x: 0, y: 20, w: 16, h: 20, id: 'd' },
        { x: 34, y: 0, w: 24, h: 20, id: 'c' },
        { x: 29, y: 40, w: 29, h: 20, id: 'h' },
        { x: 29, y: 60, w: 29, h: 20, id: 'k' },
        { x: 0, y: 60, w: 14, h: 20, id: 'i' },
        { x: 34, y: 20, w: 24, h: 20, id: 'f' },
        { x: 14, y: 60, w: 15, h: 20, id: 'j' },
    ]

    it('should handle 2 columns', () => {
        const expectedItems = [
            { x: 0, y: 0, w: 30, h: 29, id: 'a' },
            { x: 30, y: 0, w: 30, h: 29, id: 'b' },
            { x: 0, y: 29, w: 30, h: 29, id: 'c' },
            { x: 30, y: 29, w: 30, h: 29, id: 'd' },
            { x: 0, y: 58, w: 30, h: 29, id: 'e' },
            { x: 30, y: 58, w: 30, h: 29, id: 'f' },
            { x: 0, y: 87, w: 30, h: 29, id: 'g' },
            { x: 30, y: 87, w: 30, h: 29, id: 'h' },
            { x: 0, y: 116, w: 30, h: 29, id: 'i' },
            { x: 30, y: 116, w: 30, h: 29, id: 'j' },
            { x: 0, y: 145, w: 30, h: 29, id: 'k' },
        ]

        expect(getAutoItemShapes(items, 2, 60)).toEqual(expectedItems)
    })

    it('should handle 3 columns', () => {
        const expectedItems = [
            { x: 0, y: 0, w: 20, h: 29, id: 'a' },
            { x: 20, y: 0, w: 20, h: 29, id: 'b' },
            { x: 40, y: 0, w: 20, h: 29, id: 'c' },
            { x: 0, y: 29, w: 20, h: 29, id: 'd' },
            { x: 20, y: 29, w: 20, h: 29, id: 'e' },
            { x: 40, y: 29, w: 20, h: 29, id: 'f' },
            { x: 0, y: 58, w: 20, h: 29, id: 'g' },
            { x: 20, y: 58, w: 20, h: 29, id: 'h' },
            { x: 40, y: 58, w: 20, h: 29, id: 'i' },
            { x: 0, y: 87, w: 20, h: 29, id: 'j' },
            { x: 20, y: 87, w: 20, h: 29, id: 'k' },
        ]

        expect(getAutoItemShapes(items, 3, 60)).toEqual(expectedItems)
    })

    it('should handle 4 columns', () => {
        const expectedItems = [
            { x: 0, y: 0, w: 15, h: 29, id: 'a' },
            { x: 15, y: 0, w: 15, h: 29, id: 'b' },
            { x: 30, y: 0, w: 15, h: 29, id: 'c' },
            { x: 45, y: 0, w: 15, h: 29, id: 'd' },
            { x: 0, y: 29, w: 15, h: 29, id: 'e' },
            { x: 15, y: 29, w: 15, h: 29, id: 'f' },
            { x: 30, y: 29, w: 15, h: 29, id: 'g' },
            { x: 45, y: 29, w: 15, h: 29, id: 'h' },
            { x: 0, y: 58, w: 15, h: 29, id: 'i' },
            { x: 15, y: 58, w: 15, h: 29, id: 'j' },
            { x: 30, y: 58, w: 15, h: 29, id: 'k' },
        ]

        expect(getAutoItemShapes(items, 4, 60)).toEqual(expectedItems)
    })

    it('should handle 5 columns', () => {
        const expectedItems = [
            { x: 0, y: 0, w: 12, h: 29, id: 'a' },
            { x: 12, y: 0, w: 12, h: 29, id: 'b' },
            { x: 24, y: 0, w: 12, h: 29, id: 'c' },
            { x: 36, y: 0, w: 12, h: 29, id: 'd' },
            { x: 48, y: 0, w: 12, h: 29, id: 'e' },
            { x: 0, y: 29, w: 12, h: 29, id: 'f' },
            { x: 12, y: 29, w: 12, h: 29, id: 'g' },
            { x: 24, y: 29, w: 12, h: 29, id: 'h' },
            { x: 36, y: 29, w: 12, h: 29, id: 'i' },
            { x: 48, y: 29, w: 12, h: 29, id: 'j' },
            { x: 0, y: 58, w: 12, h: 29, id: 'k' },
        ]

        expect(getAutoItemShapes(items, 5, 60)).toEqual(expectedItems)
    })

    it('should handle 6 columns', () => {
        const expectedItems = [
            { x: 0, y: 0, w: 10, h: 29, id: 'a' },
            { x: 10, y: 0, w: 10, h: 29, id: 'b' },
            { x: 20, y: 0, w: 10, h: 29, id: 'c' },
            { x: 30, y: 0, w: 10, h: 29, id: 'd' },
            { x: 40, y: 0, w: 10, h: 29, id: 'e' },
            { x: 50, y: 0, w: 10, h: 29, id: 'f' },
            { x: 0, y: 29, w: 10, h: 29, id: 'g' },
            { x: 10, y: 29, w: 10, h: 29, id: 'h' },
            { x: 20, y: 29, w: 10, h: 29, id: 'i' },
            { x: 30, y: 29, w: 10, h: 29, id: 'j' },
            { x: 40, y: 29, w: 10, h: 29, id: 'k' },
        ]

        expect(getAutoItemShapes(items, 6, 60)).toEqual(expectedItems)
    })
})
