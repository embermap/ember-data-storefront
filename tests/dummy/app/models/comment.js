import DS from 'ember-data';

export default DS.Model.extend({

  text: DS.attr('string'),

  post: DS.belongsTo(),
  author: DS.belongsTo()

});
