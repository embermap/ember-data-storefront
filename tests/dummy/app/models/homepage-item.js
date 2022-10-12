import Model, { belongsTo } from '@ember-data/model';

export default class HomepageItemModel extends Model {
  @belongsTo({ polymorphic: true }) itemizable;
}
