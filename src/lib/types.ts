export type Lesson = {
  id: string;
  title: string;
  durationSec: number;
  mediaFileName: string;
  createdAt: number;
};

export type SentenceChunk = {
  id: string;
  lessonId: string;
  index: number;
  text: string;
  startTime: number;
  endTime: number;
  userInput: string;
  isCompleted: boolean;
  didShadow: boolean;
  updatedAt: number;
};

export type SyncDocument = {
  syncCode: string;
  lessons: Lesson[];
  chunks: SentenceChunk[];
  updatedAt: number;
};
