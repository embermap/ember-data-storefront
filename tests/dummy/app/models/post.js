import ItemizableModel from './itemizable';
import { attr, belongsTo, hasMany } from '@ember-data/model';

export default class PostModel extends ItemizableModel {

  @attr('string') title;
  @attr('string') text;

  @belongsTo() author;
  @hasMany() comments;

}
