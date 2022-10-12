import ItemizableModel from './itemizable';
import { attr, belongsTo, hasMany } from '@ember-data/model';

export default class PostModel extends ItemizableModel {
  @attr('string') title;

  @belongsTo() author;
  @hasMany() comments;
}
