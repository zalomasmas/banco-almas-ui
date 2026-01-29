export interface ReflectionQuestion {
  id: string;
  text: string;
}

export interface ReflectionAnswer {
  id: string;
  questionId: string;
  text: string;
  date: string;
}
