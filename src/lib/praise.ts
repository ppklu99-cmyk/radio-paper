export const AFTER_SHADOW = [
  "We\u2019ll take that.",
  "That\u2019s on the air.",
  "Clean enough to broadcast.",
  "You held the pace. I like that.",
  "The room heard you.",
  "That\u2019s a voice I would keep.",
  "You didn\u2019t flinch. Good.",
  "Noted \u2014 and well said.",
  "That landed.",
  "Keep that colour in your voice.",
  "You sounded sure. Stay there.",
  "I\u2019d run that again as-is.",
  "Quiet confidence. That\u2019s the one.",
  "You made the sentence behave.",
  "That\u2019s the cut. Print it.",
];

export const MESSY = [
  "You started. That\u2019s the hard part.",
  "Messy is still a take.",
  "You showed up. I heard you.",
  "Not perfect. Still yours.",
  "Come back tomorrow with the same nerve.",
];

export const STOP = [
  "One more if you want it. You\u2019re allowed to stop.",
  "That\u2019s a full day\u2019s work, if you say so.",
  "Leave on a good take.",
];

const BANKS = {
  afterShadow: AFTER_SHADOW,
  messy: MESSY,
  stop: STOP,
} as const;

export function pickPraise(kind: "afterShadow" | "messy" | "stop", last?: string): string {
  const bank = BANKS[kind];
  const choices = last !== undefined && bank.length > 1 ? bank.filter((line) => line !== last) : bank;
  return choices[Math.floor(Math.random() * choices.length)] ?? bank[0];
}
