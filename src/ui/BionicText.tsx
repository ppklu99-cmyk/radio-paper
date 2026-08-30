import { bionicParts } from "../lib/text";

export default function BionicText({ text }: { text: string }) {
  const words = text.split(/\s+/);

  return (
    <p className="english bionic-text">
      {words.map((word, i) => {
        const { bold, rest } = bionicParts(word);
        return (
          <span key={`${word}-${i}`}>
            {i > 0 ? " " : null}
            <strong>{bold}</strong>
            {rest}
          </span>
        );
      })}
    </p>
  );
}
