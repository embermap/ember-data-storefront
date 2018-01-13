import moment from 'moment';

let duration = function(str) {
  return str.split(/\s/);
};

let ago = function(str) {
  let [ amount, unit ] = duration(str);
  return moment().subtract( moment.duration(parseInt(amount), unit) );
};

let fromNow = function(str) {
  let [ amount, unit ] = duration(str);
  return moment().add( moment.duration(parseInt(amount), unit) );
};

export {
  duration,
  ago,
  fromNow
};
