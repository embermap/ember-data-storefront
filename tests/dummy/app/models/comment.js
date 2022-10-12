import ItemizableModel from './itemizable';
import { belongsTo } from '@ember-data/model';

export default class CommentModel extends ItemizableModel {
  @belongsTo() post;
  @belongsTo() author;
}
