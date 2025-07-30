/**
 * Filters module for Claude Code usage data
 */

/**
 * Parse time filter string and return start/end dates
 * Supports formats like:
 * - "5min" or "5 minutes" (last 5 minutes)
 * - "2h" or "2 hours" (last 2 hours)
 * - "7d" or "7 days" (last 7 days)
 * - "1m" or "1 month" (last 1 month)
 * - "1y" or "1 year" (last 1 year)
 * - "7-8" or "July-August" (July to August this year)
 * - "2024-7-2024-8" (July 2024 to August 2024)
 * - "2024-07-01,2024-08-31" (specific date range)
 */
function parseTimeFilter(timeFilter) {
  if (!timeFilter) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Remove spaces and convert to lowercase
  const filter = timeFilter.toLowerCase().replace(/\s+/g, '');
  
  // Last N minutes: "5min", "5minutes"
  if (filter.match(/^\d+min(utes?)?$/)) {
    const minutes = parseInt(filter.match(/^\d+/)[0]);
    const startDate = new Date(now);
    startDate.setMinutes(startDate.getMinutes() - minutes);
    return { start: startDate, end: now };
  }
  
  // Last N hours: "2h", "2hours"
  if (filter.match(/^\d+h(ours?)?$/)) {
    const hours = parseInt(filter.match(/^\d+/)[0]);
    const startDate = new Date(now);
    startDate.setHours(startDate.getHours() - hours);
    return { start: startDate, end: now };
  }
  
  // Last N days: "7d", "7days"
  if (filter.match(/^\d+d(ays?)?$/)) {
    const days = parseInt(filter.match(/^\d+/)[0]);
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    return { start: startDate, end: now };
  }
  
  // Last N months: "1m", "1month", "3months"
  if (filter.match(/^\d+m(onths?)?$/)) {
    const months = parseInt(filter.match(/^\d+/)[0]);
    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - months);
    return { start: startDate, end: now };
  }
  
  // Last N years: "1y", "1year"
  if (filter.match(/^\d+y(ears?)?$/)) {
    const years = parseInt(filter.match(/^\d+/)[0]);
    const startDate = new Date(now);
    startDate.setFullYear(startDate.getFullYear() - years);
    return { start: startDate, end: now };
  }
  
  // Month range in current year: "7-8", "july-august"
  if (filter.match(/^\d{1,2}-\d{1,2}$/)) {
    const [startMonth, endMonth] = filter.split('-').map(m => parseInt(m));
    const startDate = new Date(currentYear, startMonth - 1, 1);
    const endDate = new Date(currentYear, endMonth, 0); // Last day of end month
    return { start: startDate, end: endDate };
  }
  
  // Month names range: "january-march", "jan-mar"
  const monthNames = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12
  };
  
  const monthRangeMatch = filter.match(/^([a-z]+)-([a-z]+)$/);
  if (monthRangeMatch) {
    const startMonthName = monthRangeMatch[1];
    const endMonthName = monthRangeMatch[2];
    
    if (monthNames[startMonthName] && monthNames[endMonthName]) {
      const startMonth = monthNames[startMonthName];
      const endMonth = monthNames[endMonthName];
      const startDate = new Date(currentYear, startMonth - 1, 1);
      const endDate = new Date(currentYear, endMonth, 0);
      return { start: startDate, end: endDate };
    }
  }
  
  // Year-Month range: "2024-7-2024-8"
  const yearMonthRangeMatch = filter.match(/^(\d{4})-(\d{1,2})-(\d{4})-(\d{1,2})$/);
  if (yearMonthRangeMatch) {
    const [, startYear, startMonth, endYear, endMonth] = yearMonthRangeMatch;
    const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, 1);
    const endDate = new Date(parseInt(endYear), parseInt(endMonth), 0);
    return { start: startDate, end: endDate };
  }
  
  // Specific date range: "2024-07-01,2024-08-31"
  const dateRangeMatch = filter.match(/^(\d{4}-\d{2}-\d{2}),(\d{4}-\d{2}-\d{2})$/);
  if (dateRangeMatch) {
    const startDate = new Date(dateRangeMatch[1] + 'T00:00:00');
    const endDate = new Date(dateRangeMatch[2] + 'T23:59:59');
    return { start: startDate, end: endDate };
  }
  
  throw new Error(`Invalid time filter format: ${timeFilter}. 
Examples: 5min, 2h, 7d, 1m, 1y, 7-8, july-august, 2024-7-2024-8, 2024-07-01,2024-08-31`);
}

/**
 * Filter messages by time range
 */
function filterByTime(messages, timeFilter) {
  if (!timeFilter) return messages;
  
  const timeRange = parseTimeFilter(timeFilter);
  if (!timeRange) return messages;
  
  return messages.filter(msg => {
    if (!msg.timestamp) return false;
    const msgDate = new Date(msg.timestamp);
    return msgDate >= timeRange.start && msgDate <= timeRange.end;
  });
}

/**
 * Filter messages by project name (supports partial matching)
 */
function filterByProject(messages, projectFilter) {
  if (!projectFilter) return messages;
  
  const filter = projectFilter.toLowerCase();
  return messages.filter(msg => {
    const project = (msg.project || '').toLowerCase();
    return project.includes(filter);
  });
}

/**
 * Apply all filters to messages
 */
function applyFilters(messages, { timeFilter, projectFilter }) {
  let filtered = messages;
  
  if (timeFilter) {
    filtered = filterByTime(filtered, timeFilter);
  }
  
  if (projectFilter) {
    filtered = filterByProject(filtered, projectFilter);
  }
  
  return filtered;
}

/**
 * Get available projects from messages
 */
function getAvailableProjects(messages) {
  const projects = new Set();
  messages.forEach(msg => {
    if (msg.project) {
      projects.add(msg.project);
    }
  });
  return Array.from(projects).sort();
}

module.exports = {
  parseTimeFilter,
  filterByTime,
  filterByProject,
  applyFilters,
  getAvailableProjects
};
