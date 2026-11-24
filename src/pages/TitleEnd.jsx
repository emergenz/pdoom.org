// A title with an icon after it. The last word and the icon stay together, so a
// wrapping title never leaves the icon alone on its own line.
export default function TitleEnd({ text, children }) {
  const split = text.lastIndexOf(' ')
  const head = split < 0 ? '' : text.slice(0, split + 1)
  const tail = split < 0 ? text : text.slice(split + 1)

  return (
    <>
      {head}
      <span className="title-end">{tail}{children}</span>
    </>
  )
}
