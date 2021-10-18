const { React, getModule } = require('powercord/webpack');

const SlateTextArea = require('../misc/SlateTextArea');
const Slate = getModule([ 'Annotation', 'Block' ], false);

const Serializer = getModule([ 'serialize', 'deserialize' ], false);

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      value: Serializer.deserialize('')
    }
  }

  render () {
    return <SlateTextArea
      placeholder='Click to add a note'
      value={this.state.value}
      onChange={(_, __, richValue) => this.setState({ value: richValue })}
      spellcheckEnabled={false}
    />;
  }
};
