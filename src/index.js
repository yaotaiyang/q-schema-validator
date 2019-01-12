// error message
import { validate } from './validator'
const messages = {
  invalidType: types => `Expected ${types[ 0 ]} but got ${types[ 1 ]}.`,
  arrayMinItems: num => `Array must have at least ${num} items.`,
  arrayMaxItems: num => `Array must not have more than ${num} items.`,
  invalidEnum: enums => `Value must be one of: ${enums}.`,
  numberMinValue: num => `Value must not be less than ${num}.`,
  numberMaxValue: num => `Value must not be greater than ${num}.`,
  stringMinLength: len => `String must be at least ${len} characters long.`,
  stringMaxLength: len => `String must not be more than ${len} characters long.`,
  stringPattern: pattern => `String must match the pattern: ${pattern}.`,
  schemaRequired: () => 'Schema value required.',
  unknownSchemaReference: () => 'Unknown schema reference: *.',
  unexpectedProperty: prop => `Unexpected property ${prop}.`,
  propertyRequired: prop => `Missing required property ${prop}.`
}

/**
 *
 * JSON Schema Validator
 * @export
 * @class JSONSchemaValidator
 */
export default class JSONSchemaValidator {
  constructor() {
    this.errors = []
  }

  /**
   * 添加错误信息
   *
   * @param {*} path
   * @param {*} key
   * @param {*} val
   * @memberof JSONSchemaValidator
   */
  addError(path, key, val) {
    this.errors.push({
      path,
      message: this.formatError(key, val)
    })
  }

  resetError() {
    this.errors = []
  }

  /**
   * 格式化错误信息
   * @param {string} key
   * @param {any | array} error
   */
  formatError(key, error) {
    return messages[ key ](error)
  }

  validate(instance, schema) {
    let res = validate(instance, schema)
    res.forEach(item => {
      this.addError.apply(this, item);
    });
    return this.errors;
  }
}


