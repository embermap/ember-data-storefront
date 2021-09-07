import ItemizableModel from './itemizable';
import { attr, belongsTo } from '@ember-data/model';

export default class CommentModel extends ItemizableModel {

  @belongsTo() post;
  @belongsTo() author;

}
