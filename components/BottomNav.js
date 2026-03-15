import { useRouter } from 'next/router';

const tabs = [
  { href: '/',          icon: '⌂',  label: 'Home'     },
  { href: '/log',       icon: '+',  label: 'Log'      },
  { href: '/history',   icon: '◈',  label: 'History'  },
  { href: '/ai',        icon: '✦',  label: 'Coach'    },
  { href: '/research',  icon: '⬡',  label: 'Research' },
];

export default function BottomNav() {
  const router = useRouter();
  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const active = router.pathname === tab.href;
        return (
          <button key={tab.href} className={`nav-btn ${active ? 'active' : ''}`} onClick={() => router.push(tab.href)}>
            <span className="nav-icon" style={{
              color: active ? '#6c63ff' : 'rgba(240,240,248,0.3)',
              fontWeight: active ? 700 : 400,
              fontSize: tab.icon === '+' ? 24 : 18
            }}>{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
