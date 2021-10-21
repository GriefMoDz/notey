const { React, getModule } = require('powercord/webpack');

const { default: HelpMessage, HelpMessageTypes } = getModule([ 'HelpMessageTypes' ], false);

module.exports = class ErrorBoundary extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = {
      hasError: false
    };
  }

  componentDidCatch () {
    this.setState({ hasError: true });
  }

  render () {
    if (this.state.hasError) {
      return <div className='notey-error-boundary'>
        <HelpMessage messageType={HelpMessageTypes.ERROR}>
          Something went wrong! Check your DevTools console (Ctrl+Shift+I and select the "Console" tab) for more details.
        </HelpMessage>
      </div>;
    }

    return this.props.children;
  }
};
