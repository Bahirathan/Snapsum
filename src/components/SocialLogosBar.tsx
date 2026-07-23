import React from 'react';

interface SocialLogosBarProps {
  youtubeLink?: string;
  xLink?: string;
  facebookLink?: string;
  linkedinLink?: string;
  tiktokLink?: string;
  pinterestLink?: string;
  threadsLink?: string;
  blueskyLink?: string;
  instagramLink?: string;
  mastodonLink?: string;
  googleLink?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SocialLogosBar({
  youtubeLink = 'https://youtube.com',
  xLink = 'https://x.com',
  facebookLink = 'https://facebook.com',
  linkedinLink = 'https://linkedin.com',
  tiktokLink = 'https://tiktok.com',
  pinterestLink = 'https://pinterest.com',
  threadsLink = 'https://threads.net',
  blueskyLink = 'https://bsky.app',
  instagramLink = 'https://instagram.com',
  mastodonLink = 'https://mastodon.social',
  googleLink = 'https://business.google.com',
  className = '',
  size = 'md'
}: SocialLogosBarProps) {
  
  // Dimensions based on size prop
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl',
    lg: 'w-14 h-14 rounded-3xl'
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size];

  const socialPlatforms = [
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
      id: 'threads',
      name: 'Threads',
      bgColor: 'bg-black hover:bg-zinc-900 border border-zinc-800/40',
      href: threadsLink,
      icon: (
        <svg className={`${iconSizes} fill-white`} viewBox="0 0 24 24">
          <path d="M12.186 20.322c-4.22 0-7.391-2.92-7.391-7.822 0-4.802 3.27-8.082 7.771-8.082 4.4 0 7.271 3.03 7.271 7.152 0 3.821-2.31 5.961-4.871 5.961-1.35 0-2.32-.71-2.68-1.74l-.08.01c-.69 1.25-1.82 1.83-3.2 1.83-2.07 0-3.53-1.47-3.53-3.6 0-2.76 2.31-4.76 5.56-4.76 1.05 0 2.07.19 2.87.5v-.52c0-1.74-1.07-2.75-2.82-2.75-1.39 0-2.45.54-2.88 1.25l-1.92-1.09c.89-1.48 2.68-2.36 4.95-2.36 3.19 0 5.28 1.82 5.28 4.92v5.47c0 .93.38 1.35 1.03 1.35.88 0 2.01-1.08 2.01-3.69 0-3.15-2.05-5.22-5.41-5.22-3.41 0-5.77 2.37-5.77 6.04 0 3.73 2.31 5.86 5.55 5.86 1.77 0 3.23-.52 4.13-1.43l1.45 1.57c-1.32 1.29-3.23 1.96-5.6 1.96zm-1.09-8.4c-1.81 0-2.88.98-2.88 2.31 0 1.05.69 1.72 1.74 1.72.93 0 1.83-.56 2.18-1.44.05-.14.07-.3.07-.46v-.88c-.37-.16-.76-.25-1.11-.25z"/>
        </svg>
      )
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      bgColor: 'bg-[#E60023] hover:bg-[#c4001d]',
      href: pinterestLink,
      icon: (
        <svg className={`${iconSizes} fill-white`} viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
        </svg>
      )
    },
    {
      id: 'bluesky',
      name: 'Bluesky',
      bgColor: 'bg-[#0085FF] hover:bg-[#0070d8]',
      href: blueskyLink,
      icon: (
        <svg className={`${iconSizes} fill-white`} viewBox="0 0 568 501">
          <path d="M123.121 33.664C188.241 82.553 258.281 182.68 284 234.861c25.719-52.181 95.759-152.308 160.879-201.197C491.822-1.311 568-28.851 568 56.848c0 17.112-9.82 143.768-15.584 164.385-19.988 71.49-92.83 89.68-158.334 78.502 114.509 19.5 143.5 84.148 80.528 147.12C353.948 567.525 301.625 435.006 284 391.22c-17.625 43.786-69.948 176.305-190.61 55.635-62.972-62.972-33.981-127.62 80.528-147.12C108.414 310.913 35.572 292.723 15.584 221.233 9.82 200.616 0 73.96 0 56.848 0-28.851 76.178-1.311 123.121 33.664z"/>
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
      id: 'x',
      name: 'X (Twitter)',
      bgColor: 'bg-black hover:bg-zinc-900 border border-zinc-800/40',
      href: xLink,
      icon: (
        <svg className={`${iconSizes} fill-white`} viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      id: 'google',
      name: 'Google My Business',
      bgColor: 'bg-[#4285F4] hover:bg-[#3367d6]',
      href: googleLink,
      icon: (
        <svg className={`${iconSizes} fill-white`} viewBox="0 0 24 24">
          <path d="M21.9 8.55l-1.32-5.3a1.5 1.5 0 0 0-1.46-1.14H4.88a1.5 1.5 0 0 0-1.46 1.14l-1.32 5.3A2.99 2.99 0 0 0 2 9.5V10c0 1.66 1.34 3 3 3s3-1.34 3-3c0 1.66 1.34 3 3 3s3-1.34 3-3c0 1.66 1.34 3 3 3a2.99 2.99 0 0 0 .12-.5v-.5a2.99 2.99 0 0 0-.12-.95zM19 14.5v6.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-6.5a4.92 4.92 0 0 0 2 .42 4.92 4.92 0 0 0 3-.98 4.92 4.92 0 0 0 3 .98 4.92 4.92 0 0 0 3-.98 4.92 4.92 0 0 0 2 .42z"/>
          <path fill="#4285F4" d="M12 15.2a2.8 2.8 0 1 0 2.8 2.8c0-.2 0-.4-.05-.6h-2.75v1.2h1.56a1.6 1.6 0 1 1-.46-1.78l.85-.85A2.78 2.78 0 0 0 12 15.2z"/>
        </svg>
      )
    },
    {
      id: 'instagram',
      name: 'Instagram',
      bgColor: 'bg-[#E1306C] hover:bg-[#c91e56]',
      href: instagramLink,
      icon: (
        <svg className={`${iconSizes} fill-none stroke-white stroke-[2.2]`} viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'mastodon',
      name: 'Mastodon',
      bgColor: 'bg-[#6364FF] hover:bg-[#4d4eff]',
      href: mastodonLink,
      icon: (
        <svg className={`${iconSizes} fill-white`} viewBox="0 0 24 24">
          <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.3-5.004C15.823.01 12 0 12 0s-3.822.01-5.967.309c-2.684.393-4.95 2.426-5.3 5.004C.406 7.728.005 10.764 0 13.067c0 2.578.028 5.153.238 7.712.21 2.56 1.83 4.63 4.385 5.04 2.86.46 5.823.167 8.378-.052 1.347-.116 2.684-.334 3.978-.652a1.73 1.73 0 0 0 1.258-1.571l.088-1.396a.1.1 0 0 0-.106-.106c-.846.126-1.7.202-2.556.228-2.002.062-4.015-.052-6.002-.338-1.258-.182-1.53-.787-1.583-1.613a.1.1 0 0 1 .082-.103c1.93-.306 3.882-.442 5.833-.406 1.488.028 2.974.135 4.453.32 1.214.15 2.418.384 3.612.7.078.02.158-.035.17-.113.25-1.58.428-3.172.534-4.77.172-2.56.242-5.132.228-7.702zm-5.02 9.071h-2.15v-5.228c0-1.127-.47-1.701-1.41-1.701-.98 0-1.47.622-1.47 1.851v2.678h-2.436V9.306c0-1.229-.49-1.851-1.47-1.851-.94 0-1.41.574-1.41 1.701v5.228H5.752V8.892c0-1.127.29-2.025.87-2.695.6-.67 1.402-1.01 2.406-1.01 1.163 0 2.052.443 2.663 1.328l.31.484.31-.484c.61-.885 1.5-1.328 2.662-1.328 1.004 0 1.806.34 2.406 1.01.58.67.87 1.568.87 2.695v5.492z"/>
        </svg>
      )
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      bgColor: 'bg-black hover:bg-zinc-900 border border-zinc-800/40',
      href: tiktokLink,
      icon: (
        <svg className={`${iconSizes} fill-white`} viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .56.04.83.12V9.38a6.33 6.33 0 0 0-1-.08A6.26 6.26 0 0 0 3 15.56a6.26 6.26 0 0 0 10.7 4.34V12a8.16 8.16 0 0 0 4.89 1.6v-3.5a4.81 4.81 0 0 1-3-3.41z"/>
        </svg>
      )
    },
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
    }
  ];

  return (
    <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 ${className}`}>
      {socialPlatforms.map((platform) => (
        <a
          key={platform.id}
          href={platform.href || '#'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={platform.name}
          title={platform.name}
          className={`${sizeClasses} ${platform.bgColor} flex items-center justify-center text-white shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md cursor-pointer shrink-0`}
        >
          {platform.icon}
        </a>
      ))}
    </div>
  );
}
