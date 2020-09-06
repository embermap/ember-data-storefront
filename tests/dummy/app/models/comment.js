import Model, { attr, belongsTo } from '@ember-data/model';

export default clas CommentModel extends Model {

  @attr('string') text;

  @belongsTo() post;
  @belongsTo() author;

}
