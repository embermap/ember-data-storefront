import Ember from 'ember';
import DS from 'ember-data';

/*
  Force all associations to be async: false.
*/
let originalBelongsTo = DS.belongsTo;
DS.belongsTo = function(...args) {
  let options = args.find(arg => typeof arg === 'object');
  let newArgs = [...args];
  let newOptions = { async: false };

  if (options) {
    Ember.assert(`We're monkey patching Ember Data to force sync relationships! You have a '${arguments[0]}' relationship defined somewhere with an 'async' option. Please remove it.`, options.async === undefined);
    let optionsIndex = args.indexOf(options);
    newOptions = Ember.assign({}, options, newOptions);
    newArgs.splice(optionsIndex, 1, newOptions);
  } else {
    newArgs.push(newOptions);
  }

  return originalBelongsTo(...newArgs);
};

let originalHasMany = DS.hasMany;
DS.hasMany = function(...args) {
  let options = args.find(arg => typeof arg === 'object');
  let newArgs = [...args];
  let newOptions = { async: false };

  if (options) {
    Ember.assert(`We're monkey patching Ember Data to force sync relationships! You have a '${arguments[0]}' relationship defined somewhere with an 'async' option. Please remove it.`, options.async === undefined);
    let optionsIndex = args.indexOf(options);
    newOptions = Ember.assign({}, options, newOptions);
    newArgs.splice(optionsIndex, 1, newOptions);
  } else {
    newArgs.push(newOptions);
  }

  return originalHasMany(...newArgs);
};
