import Model, { attr, hasMany } from '@ember-data/model';

export default class ItemizableModel extends Model {
  @attr('string') text;

  @hasMany() tags;
}
