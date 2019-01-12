const toStr = val => Object.prototype.toString.call(val).slice(8, -1)
/**
 * 获取类型
 * @param {any} value
 */
function getType(value) {
  const str = typeof value

  if (str === 'object') {
    return value === null ? null : toStr(value).toLowerCase()
  }

  return str
}

/**
 * 获取 schema 的类型定义
 * 例如：schema.type = Array | 'array'
 * 应当返回：'array'
 * @param {*} value
 * @memberof JSONSchemaValidator
 */
function getSchemaType(value) {
  if (typeof value === 'function') {
    return value.name.toLowerCase()
  } else if (value instanceof Array) {
    return value.map(item => { return getSchemaType(item) });
  }
  return value.toLowerCase()
}

function mergeRequired(required, schema) {
  let resRequire = required;
  const currentRequire = getType(schema && schema.required) === 'boolean' ? schema.required : undefined;
  if (currentRequire !== undefined) {
    resRequire = currentRequire;
  }
  return resRequire;
}

/**
 * 校验
 * @param {any} instance
 * @param {any} schema
 * @param {string} optionalPath
 * @param {Boolean} required
 */
function validate(instance, schema, optionalPath, required) {
  let resErrors = [];
  const path = optionalPath || ''
  if (!schema) {
    // 未定义 schema
    resErrors.push([ path, 'schemaRequired' ])
    return resErrors
  }

  if (mergeRequired(required, schema) === false && instance === undefined) {
    return resErrors
  }
  if (schema.type && getSchemaType(schema.type) !== 'any') {
    if (validateType(instance, schema, path).length !== 0) {
      return validateType(instance, schema, path);
    }
    let cType = getSchemaType(schema.type);
    let res = validateMultiply(cType, instance, schema, path);
    return res;
  }
}

function validateMultiply(type, instance, schema, path, required) {
  let resErrors = [];
  if (type instanceof Array) {
    let pass = false;
    type.forEach(item => {
      let res = validateMultiply(item, instance, schema, path, required)
      if (res.length === 0) {
        pass = true;
      } else {
        resErrors = resErrors.concat(res);
      }
    });
    if (pass) {
      resErrors = [];
    }
  } else if (type === 'object') {
    resErrors = resErrors.concat(validateObject(instance, schema, path, required))
  } else if (type === 'array') {
    resErrors = resErrors.concat(validateArray(instance, schema, path, required))
  } else if (type === 'string') {
    resErrors = resErrors.concat(validateString(instance, schema, path, required))
  } else if (type === 'number') {
    resErrors = resErrors.concat(validateNumber(instance, schema, path, required))
  }
  return resErrors;
}


/**
 * 校验是否符合 schema 定义的类型
 * @param {*} instance
 * @param {*} schema
 * @param {*} path
 * @returns
 * @memberof JSONSchemaValidator
 */
function validateType(instance, schema, path, required) {
  let resErrors = [];
  const actualType = getType(instance)
  const schemaType = getSchemaType(schema.type)
  if (mergeRequired(required, schema)) {
    let cError = false;
    if (schemaType instanceof Array) {
      if (schemaType.indexOf(actualType) !== -1) {
        cError = true
      }
    } else if (actualType === schemaType) {
      cError = true
    }
    if (!cError) {
      resErrors.push([ path, 'invalidType', [ schemaType, actualType ] ])
    }
  }
  return resErrors
}

/**
 * 检验对象
 * @param {*} instance
 * @param {*} schema
 * @param {*} path
 * @memberof JSONSchemaValidator
 */
function validateObject(instance, schema, path, required) {
  let resErrors = [];
  let objRequired = Object.create(null);
  let mRequired = required;
  if (getType(schema.required) === 'array') {
    schema.required.forEach(item => {
      objRequired[ item ] = true;
    })
  } else {
    mRequired = mergeRequired(required, schema)
  }
  if (schema.properties) {
    Object.keys(schema.properties).forEach(key => {
      const keyPath = path ? path + '.' + key : key
      if (
        (instance && (instance[ key ] === undefined)) &&
        schema.properties[ key ].default !== undefined
      ) {
        // default
        const defaultVal = schema.properties[ key ].default
        instance[ key ] =
          typeof defaultVal === 'function' ? defaultVal() : defaultVal
      }
      if (instance && instance[ key ] !== undefined) {
        let res = validateMultiply(schema.properties[ key ].type, instance[ key ], schema.properties[ key ], keyPath, objRequired[ key ]);
        resErrors = resErrors.concat(res);
      } else if (mergeRequired(objRequired[ key ], schema.properties[ key ])) {
        // 非可选值
        resErrors.push([ keyPath, 'propertyRequired', key ]);
      }
    })
    return resErrors;
  }

  if (!schema.additionalProperties) {
    return resErrors
  }

  // 附加 any 类型
  if (schema.additionalProperties.type && schema.additionalProperties.type === 'any') {
    return resErrors
  }

  // 检验附加属性
  Object.keys(instance).forEach(key => {
    const keyPath = path ? path + '.' + key : key
    if (schema.additionalProperties) {
      let res = validateMultiply(schema.additionalProperties.type, instance[ key ], schema.additionalProperties, keyPath)
      resErrors = resErrors.concat(res);
    } else {
      resErrors.push([ keyPath, 'unexpectedProperty', keyPath ]);
    }
  })
  return resErrors;
}

/**
 * 检验数组
 * @param {*} instance
 * @param {*} schema
 * @param {*} path
 * @memberof JSONSchemaValidator
 */
function validateArray(instance, schema, path, required) {
  let resErrors = [];
  let actualType = getType(instance);
  if (actualType !== 'array') {
    resErrors.push([ path, 'invalidType', [ schema.type, actualType ] ]);
    return resErrors;
  }
  if ((!instance || !instance.length) && !mergeRequired(required, schema)) {
    // 可选值未定义也可以
    return resErrors
  }

  const typeofItems = getType(schema.items)

  if (typeofItems === 'object') {
    if (schema.minItems && instance.length < schema.minItems) {
      // 最小数目
      resErrors.push([ path, 'arrayMinItems', [ schema.minItems ] ]);
    }

    if (schema.maxItems && instance.length > schema.maxItems) {
      // 最大数目
      resErrors.push([ path, 'arrayMaxItems', [ schema.maxItems ] ]);
    }
    for (let i = 0; i < instance.length; i++) {
      let res = validateMultiply(schema.items.type, instance[ i ], schema.items, path + '.' + i)
      resErrors = resErrors.concat(res);
    }
  }
  return resErrors;
}

/**
 * 检验字符串
 * @param {*} instance
 * @param {*} schema
 * @param {*} path
 * @memberof JSONSchemaValidator
 */
function validateString(instance, schema, path, required) {
  let resErrors = [];
  const actualType = getType(instance)
  if (schema.minLength && instance.length < schema.minLength) {
    resErrors.push([ path, 'stringMinLength', [ schema.minLength ] ]);
  }
  if (schema.maxLength && instance.length > schema.maxLength) {
    resErrors.push([ path, 'stringMaxLength', [ schema.maxLength ] ]);
  }

  if (schema.pattern && !schema.pattern.test(instance)) {
    resErrors.push([ path, 'stringPattern', [ schema.pattern ] ]);
  }

  if (actualType !== 'string') {
    resErrors.push([ path, 'invalidType', [ 'string', actualType ] ]);
  }
  return resErrors;
}

/**
 * 检验数字
 * @param {*} instance
 * @param {*} schema
 * @param {*} path
 * @memberof JSONSchemaValidator
 */
function validateNumber(instance, schema, path, required) {
  let resErrors = [];
  const actualType = getType(instance)
  if (actualType !== 'number') {
    resErrors.push([ path, 'invalidType', [ 'number', actualType ] ]);
  }
  return resErrors;
}
export { validate };