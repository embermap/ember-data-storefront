import ItemizableModel from './itemizable';
import { attr, belongsTo } from '@ember-data/model';

export default class CommentModel extends ItemizableModel {

  @attr('string') text;

  @belongsTo() post;
  @belongsTo() author;

}
