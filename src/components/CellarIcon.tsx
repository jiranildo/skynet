interface CellarIconProps {
  className?: string;
}

export default function CellarIcon({ className = "w-5 h-5" }: CellarIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Prateleira superior */}
      <rect x="2" y="3" width="20" height="1.5" fill="currentColor" opacity="0.8" rx="0.5" />
      
      {/* Garrafas na prateleira superior */}
      <path
        d="M5 4.5 L5 8 C5 8.5 5.3 9 6 9 C6.7 9 7 8.5 7 8 L7 4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="6" cy="8.5" r="0.8" fill="currentColor" opacity="0.6" />
      
      <path
        d="M9 4.5 L9 8 C9 8.5 9.3 9 10 9 C10.7 9 11 8.5 11 8 L11 4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="10" cy="8.5" r="0.8" fill="currentColor" opacity="0.6" />
      
      <path
        d="M13 4.5 L13 8 C13 8.5 13.3 9 14 9 C14.7 9 15 8.5 15 8 L15 4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="14" cy="8.5" r="0.8" fill="currentColor" opacity="0.6" />
      
      <path
        d="M17 4.5 L17 8 C17 8.5 17.3 9 18 9 C18.7 9 19 8.5 19 8 L19 4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="18" cy="8.5" r="0.8" fill="currentColor" opacity="0.6" />
      
      {/* Prateleira do meio */}
      <rect x="2" y="10" width="20" height="1.5" fill="currentColor" opacity="0.8" rx="0.5" />
      
      {/* Garrafas na prateleira do meio */}
      <path
        d="M5 11.5 L5 15 C5 15.5 5.3 16 6 16 C6.7 16 7 15.5 7 15 L7 11.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="6" cy="15.5" r="0.8" fill="currentColor" opacity="0.6" />
      
      <path
        d="M9 11.5 L9 15 C9 15.5 9.3 16 10 16 C10.7 16 11 15.5 11 15 L11 11.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="10" cy="15.5" r="0.8" fill="currentColor" opacity="0.6" />
      
      <path
        d="M13 11.5 L13 15 C13 15.5 13.3 16 14 16 C14.7 16 15 15.5 15 15 L15 11.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="14" cy="15.5" r="0.8" fill="currentColor" opacity="0.6" />
      
      <path
        d="M17 11.5 L17 15 C17 15.5 17.3 16 18 16 C18.7 16 19 15.5 19 15 L19 11.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="18" cy="15.5" r="0.8" fill="currentColor" opacity="0.6" />
      
      {/* Prateleira inferior */}
      <rect x="2" y="17" width="20" height="1.5" fill="currentColor" opacity="0.8" rx="0.5" />
      
      {/* Garrafas na prateleira inferior */}
      <path
        d="M5 18.5 L5 21"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="6" cy="21" r="0.8" fill="currentColor" opacity="0.6" />
      
      <path
        d="M9 18.5 L9 21"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="10" cy="21" r="0.8" fill="currentColor" opacity="0.6" />
      
      <path
        d="M13 18.5 L13 21"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="14" cy="21" r="0.8" fill="currentColor" opacity="0.6" />
      
      <path
        d="M17 18.5 L17 21"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="18" cy="21" r="0.8" fill="currentColor" opacity="0.6" />
      
      {/* Estrutura lateral esquerda */}
      <rect x="2" y="3" width="1" height="18.5" fill="currentColor" opacity="0.5" rx="0.5" />
      
      {/* Estrutura lateral direita */}
      <rect x="21" y="3" width="1" height="18.5" fill="currentColor" opacity="0.5" rx="0.5" />
    </svg>
  );
}
