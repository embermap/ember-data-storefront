import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class AuthorModel extends Model {
  @attr('string') name;

  @hasMany() comments;
  @belongsTo() post;
}
