import Model, { hasMany } from '@ember-data/model';

export default class ItemizableModel extends Model {

  @hasMany() tags;

}
