const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

// Custom type resolver
const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: '',
  serialize(value) {
    return value.toISOString();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const value = new Date(ast.value);
      return Number.isNaN(value.getTime()) ? undefined : value;
    }
    return undefined;
  },
  parseValue(value) {
    const dateValue = new Date(value);
    return Number.isNaN(dateValue.getTime()) ? undefined : dateValue;
  },
});

module.exports = GraphQLDate;
