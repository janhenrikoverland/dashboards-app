import {
    REPORT_TABLE,
    CHART,
    MAP,
    EVENT_REPORT,
    EVENT_CHART,
} from '../../../../modules/itemTypes'
import getVisualizationContainerDomId from '../getVisualizationContainerDomId'
import { loadExternalScript } from './loadExternalScript'

//external plugins
const itemTypeToGlobalVariable = {
    [MAP]: 'mapPlugin',
    [EVENT_REPORT]: 'eventReportPlugin',
    [EVENT_CHART]: 'eventChartPlugin',
}

const itemTypeToScriptPath = {
    [MAP]: '/dhis-web-maps/map.js',
    [EVENT_REPORT]: '/dhis-web-event-reports/eventreport.js',
    [EVENT_CHART]: '/dhis-web-event-visualizer/eventchart.js',
}

const hasIntegratedPlugin = type => [CHART, REPORT_TABLE].includes(type)

export const getPlugin = async type => {
    if (hasIntegratedPlugin(type)) {
        return true
    }
    const pluginName = itemTypeToGlobalVariable[type]

    return await global[pluginName]
}

const fetchPlugin = async (type, baseUrl, isRecording) => {
    const globalName = itemTypeToGlobalVariable[type]
    if (global[globalName] && !isRecording) {
        return global[globalName] // Will be a promise if fetch is in progress
    }

    const scripts = []

    if (type === EVENT_REPORT || type === EVENT_CHART) {
        if (process.env.NODE_ENV === 'production') {
            scripts.push('./vendor/babel-polyfill-6.26.0.min.js')
            scripts.push('./vendor/jquery-3.3.1.min.js')
            scripts.push('./vendor/jquery-migrate-3.0.1.min.js')
        } else {
            scripts.push('./vendor/babel-polyfill-6.26.0.js')
            scripts.push('./vendor/jquery-3.3.1.js')
            scripts.push('./vendor/jquery-migrate-3.0.1.js')
        }
    }

    scripts.push(baseUrl + itemTypeToScriptPath[type])

    const curriedLoadExternalScript = loadExternalScript(isRecording)

    const scriptsPromise = Promise.all(
        scripts.map(curriedLoadExternalScript)
    ).then(
        () => global[globalName] // At this point, has been replaced with the real thing
    )

    global[globalName] = scriptsPromise
    return await scriptsPromise
}

export const pluginIsAvailable = type =>
    hasIntegratedPlugin(type) || itemTypeToGlobalVariable[type]

export const load = async (
    item,
    visualization,
    { credentials, activeType, options = {}, isRecording = false }
) => {
    const type = activeType || item.type
    if (!pluginIsAvailable(type)) {
        return
    }

    const plugin = await fetchPlugin(type, credentials.baseUrl, isRecording)

    if (!plugin?.load) {
        return
    }

    plugin.url = credentials.baseUrl
    plugin.loadingIndicator = true
    plugin.dashboard = true
    if (credentials.auth) {
        plugin.auth = credentials.auth
    }

    plugin.load({
        ...visualization,
        ...options,
        el: getVisualizationContainerDomId(item.id),
    })
}

export const unmount = async (item, activeType) => {
    const plugin = await getPlugin(activeType)

    plugin?.unmount && plugin.unmount(getVisualizationContainerDomId(item.id))
}
