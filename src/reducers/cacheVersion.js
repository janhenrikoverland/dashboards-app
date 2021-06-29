export const INCREMENT_CACHE_VERSION = 'INCREMENT_CACHE_VERSION'

export default (state = 0, action) => {
    switch (action.type) {
        case INCREMENT_CACHE_VERSION: {
            return ++state
        }
        default:
            return state
    }
}

export const sGetCacheVersion = state => state.cacheVersion
