export interface DurationConfig {
  type: 'hours' | 'days' | 'indefinite';
  value: number | null;
}

export function calculateClosesAt(durationType: string, durationValue: number | null): Date | null {
  if (durationType === 'indefinite' || !durationValue) {
    return null;
  }

  const now = new Date();

  if (durationType === 'hours') {
    return new Date(now.getTime() + durationValue * 60 * 60 * 1000);
  } else if (durationType === 'days') {
    return new Date(now.getTime() + durationValue * 24 * 60 * 60 * 1000);
  }

  return null;
}

export function formatTimeRemaining(closesAt: string | null): string {
  if (!closesAt) {
    return 'Open indefinitely';
  }

  const now = new Date();
  const closes = new Date(closesAt);
  const diff = closes.getTime() - now.getTime();

  if (diff <= 0) {
    return 'Closed';
  }

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  if (days > 0) {
    return `Closes in: ${days}d ${hours}h`;
  } else if (hours > 0) {
    return `Closes in: ${hours}h ${minutes}m`;
  } else {
    return `Closes in: ${minutes}m`;
  }
}

export function isSurveyClosed(survey: { status: string; closes_at: string | null }): boolean {
  if (survey.status === 'closed') {
    return true;
  }

  if (!survey.closes_at) {
    return false;
  }

  return new Date(survey.closes_at) <= new Date();
}

export function formatClosureDate(closesAt: string | null): string {
  if (!closesAt) {
    return 'No scheduled closure';
  }

  const date = new Date(closesAt);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
