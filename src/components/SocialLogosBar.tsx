import React from 'react';

interface SocialLogosBarProps {
  facebookLink?: string;
  linkedinLink?: string;
  xLink?: string;
  youtubeLink?: string;
  tiktokLink?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SocialLogosBar({
  facebookLink = 'https://facebook.com',
  linkedinLink = 'https://linkedin.com',
  xLink = 'https://x.com',
  youtubeLink = 'https://youtube.com',
  tiktokLink = 'https://tiktok.com',
  className = '',
  size = 'md'
}: SocialLogosBarProps) {
  
  // Dimensions based on size prop - slightly smaller and more refined
  const sizeClasses = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg',
    md: 'w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-xl',
    lg: 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl'
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
    md: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
    lg: 'w-4.5 h-4.5 sm:w-5 sm:h-5'
  }[size];

  const socialPlatforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      bgColor: 'bg-[#1877F2] hover:bg-[#1264ce]',
      href: facebookLink,
      icon: (
        <svg className={`${iconSizes} fill-white`} viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      bgColor: 'bg-[#0A66C2] hover:bg-[#084e96]',
      href: linkedinLink,
      icon: (
        <svg className={`${iconSizes} fill-white`} viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
        </svg>
      )
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      bgColor: 'bg-black hover:bg-zinc-900 border border-zinc-800/50',
      href: xLink,
      icon: (
        <svg className={`${iconSizes} fill-white`} viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      id: 'youtube',
      name: 'YouTube',
      bgColor: 'bg-[#FF0000] hover:bg-[#d90000]',
      href: youtubeLink,
      icon: (
        <svg className={`${iconSizes} fill-white`} viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      bgColor: 'bg-black hover:bg-zinc-900 border border-zinc-800/50',
      href: tiktokLink,
      icon: (
        <svg className={`${iconSizes} fill-white`} viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .56.04.83.12V9.38a6.33 6.33 0 0 0-1-.08A6.26 6.26 0 0 0 3 15.56a6.26 6.26 0 0 0 10.7 4.34V12a8.16 8.16 0 0 0 4.89 1.6v-3.5a4.81 4.81 0 0 1-3-3.41z"/>
        </svg>
      )
    }
  ];

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 ${className}`}>
      {socialPlatforms.map((platform) => (
        <a
          key={platform.id}
          href={platform.href || '#'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={platform.name}
          title={platform.name}
          className={`${sizeClasses} ${platform.bgColor} flex items-center justify-center text-white shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md cursor-pointer shrink-0`}
        >
          {platform.icon}
        </a>
      ))}
    </div>
  );
}

