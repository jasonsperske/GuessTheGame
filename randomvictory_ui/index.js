"use strict";
module.exports = {
  error: function(input, key, message) {
    return {
      success: false,
      errors: [{
        input: input,
        key: input+'.'+key,
        message: message
      }]
    };
  },
  errors: function(errors) {
    var ui_errors = [];
    if(errors && errors.errors) {
      for(var error_key in errors.errors) {
        if(errors.errors.hasOwnProperty(error_key)) {
          ui_errors.push({
            input: error_key,
            key: errors.errors[error_key].kind,
            message: errors.errors[error_key].message
          });
        }
      }
      return { success: false, errors: ui_errors };
    } else {
      return { sucess: false, errors: [{input: 'UNKNOWN', key: 'UNKNOWN.undefined', message: 'An unknown error has occured.'}] };
    }
  },
  groupsOf: function(group_size, input) {
    var groups = [], i;
    if(input && input.length) {
      for(i = 0; i < input.length; i+=group_size) {
        groups.push(input.slice(i, i+group_size));
      }
    }
    return groups;
  },
  ifDefined: function(defaults, subject, inputs) {
    for(var key in defaults) {
      if(inputs.hasOwnProperty(key)) {
        subject[key] = inputs[key];
      } else {
        subject[key] = defaults[key];
      }
    }
    return subject;
  }
};
