const BUILTIN: Record<string, string> = {
  "Welcome to the midnight world desk.": "欢迎来到午夜世界台。",
  "Tonight we follow a short briefing from the capital.": "今晚我们关注来自首都的简短通报。",
  "Officials said talks will continue through the weekend.": "官员表示，谈判将持续整个周末。",
  "Markets opened mixed after the statement.": "声明发布后，市场开盘涨跌互现。",
  "We will return after this pause.": "休息之后我们再回来。",
};

export function builtinZh(text: string): string | undefined {
  return BUILTIN[text.trim()];
}

export async function translateSentence(text: string): Promise<string> {
  const local = builtinZh(text);
  if (local) return local;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("translate failed");
  const data = (await response.json()) as { responseData?: { translatedText?: string } };
  const zh = data.responseData?.translatedText?.trim();
  if (!zh) throw new Error("empty translation");
  return zh;
}
