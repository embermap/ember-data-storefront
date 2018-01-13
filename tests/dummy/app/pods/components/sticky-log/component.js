import Component from '@ember/component';

export default Component.extend({
  log: null,

  classNames: ['sticky-log'],

  willUpdate() {
    this._super(...arguments);

    let box = this.element;
    let isScrolledToBottom = box.scrollTop + box.clientHeight === box.scrollHeight;

    this.set('isScrolledToBottom', isScrolledToBottom);
  },

  didRender() {
    this._super(...arguments);

    if (this.get('isScrolledToBottom')) {
      this.element.scrollTop = this.element.scrollHeight;
    }
  }


});
