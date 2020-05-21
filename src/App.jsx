class HelloWorld extends React.Component {
    render() {
        const continents = ['Africa', 'America', 'Asia', 'Australia', 'Europe'];
        const helloContinents = Array.from(continents, c => `Hello ${c}!`);
        const message = helloContinents.join(' ');

        return (
            <div title="Outer div">
                <h1>{message}</h1>
            </div>
        );
    }
}

class IssueFilter extends React.Component {
    render() {
        return (
            <div>This is a placeholder for the issue filter.</div>
        );
    }
}

class IssueTable extends React.Component {
    render() {
        return (
            <div>This is a placeholder for the table of issues.</div>
        );
    }
}

class IssueAdd extends React.Component {
    render() {
        return (
            <div>This is a placeholder for a form to add an issue.</div>
        );
    }
}

const element = <HelloWorld/>;

ReactDOM.render(element, document.getElementById('content'));