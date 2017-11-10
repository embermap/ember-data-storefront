import DS from 'ember-data';

export default DS.Model.extend({
  comment: DS.hasMany('post')
});
