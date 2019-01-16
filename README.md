# q-schema-validator
JSON Schema validator for javascript

### download && test demo

```
git clone git@github.com:yaotaiyang/q-schema-validator.git

npm install

npm run dev
```
open browser http://localhost:9092/


### install

```
npm install q-schema-validator --save

```

### use as module

``` javascript
import JSONSchemaValidator from 'q-schema-validator'

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
console.log(res);

[
  {
    "path": "a.0.ac",
    "message": "Expected number but got string."
  },
  {
    "path": "a.0.g",
    "message": "Missing required property g."
  },
  {
    "path": "b",
    "message": "Expected number but got string."
  }
]

```

### use in browser

``` html
<script src="https://unpkg.com/q-schema-validator/lib/index.js"></script>
```
``` javascript
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


[
  {
    "path": "a.0.ac",
    "message": "Expected number but got string."
  },
  {
    "path": "a.0.g",
    "message": "Missing required property g."
  },
  {
    "path": "b",
    "message": "Expected number but got string."
  }
]

```
