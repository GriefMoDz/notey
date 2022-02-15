const { React, getModule } = require('powercord/webpack');
const { default: HelpMessage, HelpMessageTypes } = getModule([ 'HelpMessageTypes' ], false);

const encounteredErrors = [];

module.exports = class ErrorBoundary extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      info: null
    };
  }

  componentDidCatch (error, info) {
    this.setState({
      hasError: true,
      error,
      info
    });
  }

  render () {
    if (this.state.hasError) {
      if (!encounteredErrors.includes(this.state.error)) {
        console.log(
          '%c[ErrorBoundary:Notey]', 'color: #f04747',
          `An error has occurred while rendering a component. Please contact Harley (350227339784880130), or open an issue on the GitHub repository.`,
          { error: this.state.error, info: this.state.info }
        );

        encounteredErrors.push(this.state.error);
      }

      return <div className='notey-error-boundary'>
        <HelpMessage messageType={HelpMessageTypes.ERROR}>
          Something went wrong! Check your DevTools console (Ctrl+Shift+I and select the "Console" tab) for more details.
        </HelpMessage>
      </div>;
    }

    return this.props.children;
  }
};
