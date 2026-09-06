'use client';

/**
 * Placeholder affiché pour les produits sans photo fournie.
 * Fond ivoire neutre + icône vêtement + texte "Photo à venir".
 */
export default function PlaceholderProductImage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#F0EDE8] gap-3 select-none">
      {/* Icône vêtement */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Cintre */}
        <path
          d="M24 10C21.8 10 20 11.8 20 14C20 15.1 20.4 16.1 21.1 16.8L10 22V26H16V42H32V26H38V22L26.9 16.8C27.6 16.1 28 15.1 28 14C28 11.8 26.2 10 24 10Z"
          stroke="#8C8C88"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="24" cy="14" r="2" fill="#8C8C88" opacity="0.5" />
      </svg>

      {/* Texte */}
      <span className="text-xs font-medium text-stone tracking-wide uppercase">
        Photo à venir
      </span>
    </div>
  );
}
