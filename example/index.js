import JSONSchemaValidator from '../lib'

let schema = {
  "type": "object",
  "properties": {
    "a": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "ac": {
            "type": "number"
          },
          "g": {
            "type": "string"
          }
        },
        "required": [ 'g' ]
      }
    },
    "b": {
      "type": [ 'number' ]
    }
  },
  "required": [ "b", "f" ]
}
let data = {
  "a": [ {
    "ac": '11'
  } ],
  "b": '111'
}

var validator = new JSONSchemaValidator();
let res = validator.validate(data, schema);
console.log(validator);
console.log(JSON.stringify(res, null, 2));