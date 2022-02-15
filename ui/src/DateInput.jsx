import React from 'react';

export default class DateInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      value: this.props,
      focused: false,
      valid: true,
    });
  }

  render() {
    const { value, valid, focused } = this.state;
    return (
      <h2>{`This is a stub for date inputs ${value} ${valid} ${focused}`}</h2>
    );
  }
}
