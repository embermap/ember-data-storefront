import DS from 'ember-data';

export default DS.Model.extend({

  itemizable: DS.belongsTo({ polymorphic: true }),

});
