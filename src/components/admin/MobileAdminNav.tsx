'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Activity, MapPin, Users } from 'lucide-react';

export default function MobileAdminNav() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/admin/scoreboard', label: 'Scoreboard', icon: Activity },
    { href: '/admin/districts', label: 'Districts', icon: MapPin },
    { href: '/admin/recruits', label: 'Recruits', icon: Users },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 pt-1 px-1 custom-scrollbar w-full snap-x">
      {links.map((link) => {
        const isActive = link.exact 
          ? pathname === link.href 
          : pathname?.startsWith(link.href);

        const Icon = link.icon;

        return (
          <Link 
            key={link.href} 
            href={link.href}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 snap-start shrink-0
              ${isActive 
                ? 'bg-seal-gold text-passport-navy shadow-[0_0_10px_rgba(201,168,76,0.4)] border border-seal-gold' 
                : 'bg-white/5 text-seal-gold/70 border border-white/10 hover:bg-white/10 hover:text-seal-gold'}
            `}
          >
            <Icon size={16} className={isActive ? 'text-passport-navy' : 'text-seal-gold/60'} />
            <span className={`font-mono text-xs uppercase tracking-wider font-bold ${isActive ? 'text-passport-navy' : ''}`}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
