import React from 'react';

const MetricCard = ({ title, value, icon: Icon, accentColor = 'var(--primary)', subtitle, trend }) => {
  return (
    <div
      className="glass-panel glass-panel-hover"
      style={{
        padding: '1.4rem 1.6rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top accent gradient line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: accentColor,
          opacity: 0.85,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', marginTop: '0.35rem', letterSpacing: '-0.03em' }}>
            {value}
          </h3>
        </div>

        {Icon && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span>{subtitle || 'Updated just now'}</span>
        {trend && (
          <span style={{ color: trend.positive ? 'var(--success)' : 'var(--warning)', fontWeight: '600' }}>
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
