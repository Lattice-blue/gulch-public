import { useState } from 'react'

function Tile({ title, children, defaultCollapsed = false, onCollapse }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    if (onCollapse) onCollapse(next)
  }

  return (
    <div style={{
      boxSizing: 'border-box',
      border: '1px solid rgba(255,255,255,0.15)',
      backgroundColor: 'rgba(13,13,13,0.75)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Header (Exactly 34px + 1px border = 35px total) */}
      <div
        className="tile-header"
        onClick={toggle}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0px 12px',
          height: '34px',
          minHeight: '34px', // Prevents flexbox from squishing the header
          boxSizing: 'border-box',
          borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '10px',
          letterSpacing: '0.15em',
        }}>
          {title}
        </span>
        <span style={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: '10px',
        }}>
          {collapsed ? '+' : '−'}
        </span>
      </div>

      {/* Content */}
      {!collapsed && (
        <div style={{
          padding: '10px 12px',
          color: 'rgba(255,255,255,0.75)',
          fontSize: '11px',
          letterSpacing: '0.05em',
          lineHeight: '1.8',
          
          /* BULLETPROOF: Mathematically lock the height to the exact remaining space */
          height: 'calc(100% - 35px)', 
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}>
          {children}
        </div>
      )}

    </div>
  )
}

export default Tile