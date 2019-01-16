import JSONSchemaValidator from '../lib'
import { test } from './test'

let somePromise = function () {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve(1000);
    }, 100)
  });
}
async function getTest() {
  let abc = await somePromise();
  console.log(abc);
  return abc;
}
getTest();


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