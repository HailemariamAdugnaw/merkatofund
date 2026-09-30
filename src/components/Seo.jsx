import { Helmet } from 'react-helmet-async'

const DEFAULT_TITLE = 'The Merkato Fund | 5 Million Birr Daily Liquidity for Everyday Ethiopia'
const DEFAULT_DESCRIPTION =
  'The Merkato Fund is a hybrid financial ecosystem for Everyday Ethiopia, delivering 5 Million Birr in daily liquidity powered by collective economics. Not Equb, not lottery, not a bank.'

export default function Seo({ activeArticle }) {
  const title = activeArticle
    ? `${activeArticle.title} | The Merkato Fund`
    : DEFAULT_TITLE
  const firstParagraph =
    activeArticle && Array.isArray(activeArticle.paragraphs) && activeArticle.paragraphs[0]
      ? activeArticle.paragraphs[0]
      : ''
  const description = activeArticle
    ? `${activeArticle.subtitle || ''} — ${firstParagraph}`.slice(0, 300)
    : DEFAULT_DESCRIPTION

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}
