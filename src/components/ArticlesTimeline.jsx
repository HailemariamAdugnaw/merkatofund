const DEFAULT_ARTICLE_IMAGES = {
  1: '/images/image1.jpg',
  2: '/images/image3.jpg',
  3: '/images/image2.jpg',
  4: '/images/image2.jpg',
  5: '/images/image5.jpg',
  6: '/images/image6.jpg',
  7: '/images/image7.jpg'
}

export default function ArticlesTimeline({ articles }) {
  return (
    <section id="articles" className="articles-section">
      <div className="container">
        <div className="section-head reveal">
          <p className="kicker">The Seven Pillars of the Fund</p>
          <h2 className="section-title">Everything You Need to Know</h2>
          <p className="section-lede">
            Seven short reads that walk you from our mission to your first payout — written for the
            everyday Ethiopian, not the banker.
          </p>
        </div>
        <ol className="timeline">
          {articles.map((article, index) => {
            const image = article.image || DEFAULT_ARTICLE_IMAGES[article.order] || '/images/image1.jpg'
            return (
              <li
                key={article.slug || article.order}
                id={`article-${article.order}`}
                className={`timeline-item ${index % 2 === 0 ? 'align-left' : 'align-right'} reveal`}
              >
                <span className="timeline-node" aria-hidden="true">
                  {article.order}
                </span>
                <article className="article-card">
                  <h3 className="article-title">{article.title}</h3>
                  <p className="article-subtitle">{article.subtitle}</p>
                  {Array.isArray(article.paragraphs) &&
                    article.paragraphs.map((paragraph, paragraphIndex) => (
                      <p className="article-paragraph" key={paragraphIndex}>
                        {paragraph}
                      </p>
                    ))}
                  {article.highlight ? (
                    <blockquote className="article-highlight">
                      <p>{article.highlight}</p>
                    </blockquote>
                  ) : null}
                </article>
                <figure className="article-visual">
                  <div className="article-visual-frame">
                    <img src={image} alt={article.title} loading="lazy" />
                  </div>
                </figure>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
