// The sentence at the top of the Following page, worded as the original did:
// "Ana followed you recently." / "Ana and Ben ..." / "Ana, Ben, and 3 other
// people ...". Names come newest first.

export type SentencePart = { name: string; username: string } | string;

export function recentFollowersSentence(
  people: { name: string; username: string }[],
): SentencePart[] {
  if (people.length === 0) return ['No one has followed you yet.'];
  const [a, b] = people;
  if (people.length === 1) return [a, ' followed you recently.'];
  if (people.length === 2) return [a, ' and ', b, ' followed you recently.'];
  const others = people.length - 2;
  return [
    a,
    ', ',
    b,
    `, and ${others} other ${others === 1 ? 'person' : 'people'} followed you recently.`,
  ];
}
