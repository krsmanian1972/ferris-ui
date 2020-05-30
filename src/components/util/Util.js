import moment from 'moment';

export function humanizeDate(rawDate) {
    const m  = new moment(rawDate);
    return m.format('DD-MMM-YYYY');
}