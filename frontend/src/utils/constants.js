export const ROLES = {
  STUDENT: 'student',
  STAFF: 'staff',
  ADMIN: 'admin'
};

export const COMPLAINT_STATUS = {
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In_Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected'
};

export const COMPLAINT_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  EMERGENCY: 'Emergency'
};

export const STATUS_COLORS = {
  Pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500'
  },
  Assigned: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500'
  },
  In_Progress: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500'
  },
  Resolved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500'
  },
  Rejected: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500'
  }
};

export const PRIORITY_COLORS = {
  Low: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300'
  },
  Medium: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200'
  },
  High: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200'
  },
  Emergency: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-300'
  }
};
