import React from 'react';

function displayFormat(date) {
  return (date != null && date !== '') ? date.toDateString() : '';
}

function editFormat(date) {
  return (date != null && date !== '') ? date.toISOString().substr(0, 10) : '';
}

function unformat(str) {
  const val = new Date(str);
  return Number.isNaN(val.getTime()) ? null : val;
}

export default class DateInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      value: editFormat(props.value),
      focused: false,
      valid: true,
    });
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onBlur(e) {
    const { value, valid: oldValue } = this.state;
    const { onValidityChange, onChange } = this.props;
    const dateValue = unformat(value);
    const valid = value === '' || dateValue != null;
    if (valid !== oldValue && onValidityChange) {
      onValidityChange(e, valid);
    }
    this.setState({ focused: false, valid });
    if (valid) { onChange(e, dateValue); }
  }

  onFocus() {
    this.setState({ focused: true });
  }

  onChange(e) {
    if (e.target.value.match(/^[\d-]*$/)) {
      this.setState({ value: e.target.value });
    }
  }

  render() {
    const { value, valid, focused } = this.state;
    const { value: origValue, name } = this.props;
    const dateValue = new Date(origValue);
    const className = (!valid && !focused) ? 'invalid' : '';
    const displayValue = (focused || !valid) ? value : displayFormat(dateValue);
    return (
      <input
        type="text"
        size={20}
        name={name}
        className={className}
        value={displayValue}
        placeholder={focused ? 'YYYY-MM-DD' : null}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onChange={this.onChange}
      />
    );
  }
}
