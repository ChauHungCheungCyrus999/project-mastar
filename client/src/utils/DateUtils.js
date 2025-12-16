import { differenceInDays, differenceInMonths, differenceInYears, differenceInHours, differenceInMinutes, isToday } from 'date-fns';

const formatDate = (dateString, timeZone) => {
  const date = new Date(dateString);
  if (dateString === null || isNaN(date)) {
    return ''; // Return an empty string or some default value for invalid or null dates
  }
  const options = { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' };
  const formattedDate = date.toLocaleDateString(undefined, options);
  const [year, month, day] = formattedDate.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// task created how many days ago
const getDaysAgo = (startDate, t, i18n) => {
  const currentDate = new Date();
  
  if (isToday(startDate)) {
    return t('today');
  }
  
  const years = differenceInYears(currentDate, startDate);
  const months = differenceInMonths(currentDate, startDate);
  const days = differenceInDays(currentDate, startDate);

  if (days===0) {
    return t('yesterday');
  }

  if (years > 0) {
    if (i18n.language === 'zh-hk' || i18n.language === 'zh-cn')
      return `${years} ${t('year') + t('ago')}`;
    return `${years} year${years > 1 ? 's' : ''} ago`;
  } else if (months > 0) {
    if (i18n.language === 'zh-hk' || i18n.language === 'zh-cn')
      return `${months} ${t('month') + t('ago')}`;
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    if (i18n.language === 'zh-hk' || i18n.language === 'zh-cn')
      return `${days} ${t('day') + t('ago')}`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

const getDaysTimeAgo = (startDate, t, i18n) => {
  const currentDate = new Date();
  
  if (isToday(startDate)) {
    const hours = differenceInHours(currentDate, startDate);
    const minutes = differenceInMinutes(currentDate, startDate);
    
    if (hours > 0) {
      return `${hours} ${hours > 1 ? t('hoursAgo') : t('hourAgo')}`;
    }
    
    if (minutes === 0) {
      return t('justNow');
    }
    return `${minutes} ${minutes > 1 ? t('minutesAgo') : t('minuteAgo')}`;
  }
  
  const years = differenceInYears(currentDate, startDate);
  const months = differenceInMonths(currentDate, startDate);
  const days = differenceInDays(currentDate, startDate);

  if (days === 0) {
    return t('yesterday');
  }

  if (years > 0) {
    if (i18n.language === 'zh-hk' || i18n.language === 'zh-cn') {
      return `${years} ${t('year')}${t('ago')}`;
    }
    return `${years} year${years > 1 ? 's' : ''} ago`;
  } else if (months > 0) {
    if (i18n.language === 'zh-hk' || i18n.language === 'zh-cn') {
      return `${months} ${t('month')}${t('ago')}`;
    }
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    if (i18n.language === 'zh-hk' || i18n.language === 'zh-cn') {
      return `${days} ${t('day')}${t('ago')}`;
    }
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

/* 20241231_090130 */
const formatFileNameDate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");

  const formattedDate = `${year}${month}${day}_${hours}${minutes}${seconds}`;

  return formattedDate;
};

function formatToIsoDate(dateString) {
  // Parse the input date string
  const dateObj = new Date(dateString);

  // Convert the date object to the desired format
  const newDateString = dateObj.toISOString();

  return newDateString;
}

export { formatDate, getDaysAgo, getDaysTimeAgo, formatFileNameDate, formatToIsoDate };