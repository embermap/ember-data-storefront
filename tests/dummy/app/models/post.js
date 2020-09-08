import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class PostModel extends Model {

  @attr('string') title;
  @attr('string') text;

  @belongsTo() author;
  @hasMany() comments;
  @hasMany() tags;

}
