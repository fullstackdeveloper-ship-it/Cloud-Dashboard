/**
 * Date and time utility functions for time series dashboard
 */

import moment from 'moment';

export const formatTime = (timestamp, format = 'HH:mm:ss') => {
  return moment(timestamp).format(format);
};

export const formatDate = (timestamp, format = 'MMM DD, YYYY') => {
  return moment(timestamp).format(format);
};

export const formatDateTime = (timestamp, format = 'MMM DD, HH:mm') => {
  return moment(timestamp).format(format);
};

export const parseTime = (timeString) => {
  return moment(timeString).valueOf();
};

export const getTimeRange = (startTime, endTime, interval = '1m') => {
  const start = moment(startTime);
  const end = moment(endTime);
  const times = [];
  
  let current = start.clone();
  while (current.isBefore(end) || current.isSame(end)) {
    times.push(current.valueOf());
    current.add(moment.duration(interval));
  }
  
  return times;
};

export const getRelativeTime = (timestamp) => {
  return moment(timestamp).fromNow();
};

export const getTimeAgo = (minutes = 60) => {
  return moment().subtract(minutes, 'minutes').valueOf();
};

export const getTimeNow = () => {
  return moment().valueOf();
};

export const isWithinTimeRange = (timestamp, startTime, endTime) => {
  const time = moment(timestamp);
  return time.isBetween(moment(startTime), moment(endTime), null, '[]');
};

export const getTimeZone = () => {
  return moment.tz.guess();
};

export const convertToTimeZone = (timestamp, timeZone) => {
  return moment(timestamp).tz(timeZone);
};

export const getIntervalDuration = (interval) => {
  const duration = moment.duration(interval);
  return duration.asMilliseconds();
};

export const getNextInterval = (timestamp, interval) => {
  return moment(timestamp).add(moment.duration(interval)).valueOf();
};

export const getPreviousInterval = (timestamp, interval) => {
  return moment(timestamp).subtract(moment.duration(interval)).valueOf();
};

export const formatDuration = (milliseconds) => {
  const duration = moment.duration(milliseconds);
  if (duration.asDays() >= 1) {
    return `${Math.floor(duration.asDays())}d ${duration.hours()}h ${duration.minutes()}m`;
  } else if (duration.asHours() >= 1) {
    return `${Math.floor(duration.asHours())}h ${duration.minutes()}m`;
  } else if (duration.asMinutes() >= 1) {
    return `${Math.floor(duration.asMinutes())}m ${duration.seconds()}s`;
  } else {
    return `${Math.floor(duration.asSeconds())}s`;
  }
};

export const getTimeRangePresets = () => {
  return {
    'Last 5 minutes': () => ({
      start: getTimeAgo(5),
      end: getTimeNow()
    }),
    'Last 15 minutes': () => ({
      start: getTimeAgo(15),
      end: getTimeNow()
    }),
    'Last 30 minutes': () => ({
      start: getTimeAgo(30),
      end: getTimeNow()
    }),
    'Last 1 hour': () => ({
      start: getTimeAgo(60),
      end: getTimeNow()
    }),
    'Last 3 hours': () => ({
      start: getTimeAgo(180),
      end: getTimeNow()
    }),
    'Last 6 hours': () => ({
      start: getTimeAgo(360),
      end: getTimeNow()
    }),
    'Last 12 hours': () => ({
      start: getTimeAgo(720),
      end: getTimeNow()
    }),
    'Last 24 hours': () => ({
      start: getTimeAgo(1440),
      end: getTimeNow()
    }),
    'Last 7 days': () => ({
      start: moment().subtract(7, 'days').valueOf(),
      end: getTimeNow()
    }),
    'Last 30 days': () => ({
      start: moment().subtract(30, 'days').valueOf(),
      end: getTimeNow()
    })
  };
};
