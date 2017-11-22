import React, { PropTypes, Component } from 'react'
import ReactDOM from 'react-dom'
import logo from './logo.svg';

let instances = []
const register = (comp) => instances.push(comp)
const unregister = (comp) =>      instances.splice(instances.indexOf(comp), 1)
const historyPush = (path) => {
    window.history.pushState({}, null, path)
    instances.forEach(instance => instance.forceUpdate())
}
const historyReplace = (path) => {
    window.history.replaceState({}, null, path)
    instances.forEach(instance => instance.forceUpdate())
}
const matchPath = (pathname, options) => {
    const { exact = false, path } = options
    if (!path) {
        return {
            path: null,
            url: pathname,
            isExact: true
        }
    }
    const match = new RegExp(`^${path}`).exec(pathname)
    if (!match) return null
    const url = match[0]
    const isExact = pathname === url
    if (exact && !isExact) return null
    return {
        path,
        url,
        isExact,
    }
}
class Route extends Component {
    componentWillMount() {
        window.addEventListener("popstate", this.handlePop)
        register(this)
    }
    componentWillUnmount() {
        unregister(this)
        window.removeEventListener("popstate", this.handlePop)
    }
    handlePop = () => {
        this.forceUpdate()
    }
    render() {
        const {
            path,
            exact,
            component,
            render,
        } = this.props
        const match = matchPath(window.location.pathname, { path, exact })
        if (!match)
            return null
        if (component) {
            return React.createElement(component, { match })
        }
        if (render)
            return render({ match })
        return null
    }
}
class Link extends Component {
    handleClick = (event) => {
        const { replace, to } = this.props
        event.preventDefault()
        replace ? historyReplace(to) : historyPush(to)
    }
    render() {
        const { to, children} = this.props
        return (
            <a href={to} onClick={this.handleClick}>
                {children}
            </a>
        )
    }
}

class Redirect extends Component {
    static defaultProps = {
        push: false
    }

    componentDidMount() {
        const { to, push } = this.props
        push ? historyPush(to) : historyReplace(to)
    }
    render() {
        return null
    }
}

const Home = () => (
    <h2>Home</h2>
)
const About = () => (
    <h2>About</h2>
)
const Topic = ({ topicId }) => (
    <h3>{topicId}</h3>
)
const Topics = ({ match }) => {
    const items = [
        { name: 'Rendering with React', slug: 'rendering' },
        { name: 'Components', slug: 'components' },
        { name: 'Props v. State', slug: 'props-v-state' },
    ]
    return (
        <div>
            <h2>Topics</h2>
            <ul>
                {items.map(({ name, slug }) => (
                    <li key={name}>
                        <Link to={`${match.url}/${slug}`}>{name}</Link>
                    </li>
                ))}
            </ul>
            {items.map(({ name, slug }) => (
                <Route
                    key={name}
                    path={`${match.path}/${slug}`}
                    render={() => (
                        <Topic topicId={name} />
                    )} />
            ))}
            <Route exact path={match.url} render={() => (
                <h3>Please select a topic.</h3>
            )}/>
        </div>
    )
}
const App = () => (
    <div>
        <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/topics">Topics</Link></li>
        </ul>
        <hr/>
        <Route exact path="/" component={Home}/>
        <Route path="/about" component={About}/>
        <Route path="/topics" component={Topics} />
    </div>
)



ReactDOM.render(<App />, document.getElementById('root'));