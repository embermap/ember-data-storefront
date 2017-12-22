import DS from 'ember-data';

export default DS.Model.extend({

  title: DS.attr('string'),
  text: DS.attr('string'),

  author: DS.belongsTo(),
  comments: DS.hasMany(),
  tags: DS.hasMany()

});
