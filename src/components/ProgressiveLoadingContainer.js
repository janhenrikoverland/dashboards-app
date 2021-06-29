import React, { Component } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'
import pick from 'lodash/pick'

const defaultDebounceMs = 100
const defaultBufferFactor = 0.25
const observerConfig = { attributes: true, childList: false, subtree: false }

class ProgressiveLoadingContainer extends Component {
    static propTypes = {
        children: PropTypes.node.isRequired,
        bufferFactor: PropTypes.number,
        className: PropTypes.string,
        debounceMs: PropTypes.number,
        forceLoad: PropTypes.bool,
        name: PropTypes.string,
        style: PropTypes.object,
    }
    static defaultProps = {
        debounceMs: defaultDebounceMs,
        bufferFactor: defaultBufferFactor,
        forceLoad: false,
    }

    state = {
        shouldLoad: false,
    }
    containerRef = null
    debouncedCheckShouldLoad = null
    handlerOptions = { passive: true }
    observer = null

    checkShouldLoad() {
        if (!this.containerRef) {
            return
        }

        if (this.props.forceLoad && !this.state.shouldLoad) {
            this.setState({ shouldLoad: true })
            this.removeHandler()
            return
        }

        const bufferPx = this.props.bufferFactor * window.innerHeight
        const rect = this.containerRef.getBoundingClientRect()

        if (
            rect.bottom > -bufferPx &&
            rect.top < window.innerHeight + bufferPx
        ) {
            this.setState({ shouldLoad: true })
            this.removeHandler()
        }
    }

    registerHandler() {
        this.debouncedCheckShouldLoad = debounce(
            () => this.checkShouldLoad(),
            this.props.debounceMs
        )

        Array.from(
            document.getElementsByClassName('dashboard-scroll-container')
        ).forEach(container => {
            container.addEventListener(
                'scroll',
                this.debouncedCheckShouldLoad,
                this.handlerOptions
            )
        })

        const mutationCallback = mutationsList => {
            const styleChanged = mutationsList.find(
                mutation => mutation.attributeName === 'style'
            )

            if (styleChanged) {
                this.debouncedCheckShouldLoad()
            }
        }

        this.observer = new MutationObserver(mutationCallback)
        this.observer.observe(this.containerRef, observerConfig)
    }

    removeHandler() {
        Array.from(
            document.getElementsByClassName('dashboard-scroll-container')
        ).forEach(container => {
            container.removeEventListener(
                'scroll',
                this.debouncedCheckShouldLoad,
                this.handlerOptions
            )
        })

        this.observer.disconnect()
    }

    componentDidMount() {
        this.registerHandler()
        this.checkShouldLoad()
    }

    componentDidUpdate() {
        if (this.props.forceLoad && !this.state.shouldLoad) {
            this.checkShouldLoad()
        }
    }

    componentWillUnmount() {
        this.removeHandler()
    }

    render() {
        const { children, className, forceLoad, style, ...props } = this.props
        const { shouldLoad } = this.state

        const eventProps = pick(props, [
            'onMouseDown',
            'onTouchStart',
            'onMouseUp',
            'onTouchEnd',
        ])

        return (
            <div
                ref={ref => (this.containerRef = ref)}
                style={style}
                className={className}
                data-test={`dashboarditem-${props.name}`}
                {...eventProps}
            >
                {(forceLoad || shouldLoad) && children}
            </div>
        )
    }
}

export default ProgressiveLoadingContainer
