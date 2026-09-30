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
          {articles.map((article, index) => (
            <li
              key={article.slug || article.order}
              id={`article-${article.order}`}
              className={`timeline-item ${index % 2 === 0 ? 'align-left' : 'align-right'} reveal`}
            >
              <span className="timeline-node" aria-hidden="true">
                {article.order}
              </span>
              <article className="article-card">
                <p className="article-category">{article.category || `Article ${article.order}`}</p>
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
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
