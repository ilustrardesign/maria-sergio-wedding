export type CountdownValue = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  status: "counting" | "today" | "past";
};

const DAY_IN_MS = 86_400_000;
const HOUR_IN_MS = 3_600_000;
const MINUTE_IN_MS = 60_000;

export function getCountdown(targetIso: string, now = Date.now()): CountdownValue {
  const target = new Date(targetIso).getTime();

  if (!Number.isFinite(target)) {
    throw new Error("A data configurada para a contagem regressiva é inválida.");
  }

  const difference = target - now;

  if (difference <= -DAY_IN_MS) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, status: "past" };
  }

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, status: "today" };
  }

  return {
    days: Math.floor(difference / DAY_IN_MS),
    hours: Math.floor((difference % DAY_IN_MS) / HOUR_IN_MS),
    minutes: Math.floor((difference % HOUR_IN_MS) / MINUTE_IN_MS),
    seconds: Math.floor((difference % MINUTE_IN_MS) / 1000),
    status: "counting",
  };
}
