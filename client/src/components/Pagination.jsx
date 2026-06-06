export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null
  const nums = []
  for (let i = 1; i <= Math.min(pages, 5); i++) nums.push(i)
  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPage(page - 1)} disabled={page === 1}>‹</button>
      {nums.map(n => (
        <button key={n} className={`page-btn ${page === n ? 'active' : ''}`} onClick={() => onPage(n)}>{n}</button>
      ))}
      {pages > 5 && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>...</span>}
      <button className="page-btn" onClick={() => onPage(page + 1)} disabled={page === pages}>›</button>
    </div>
  )
}
