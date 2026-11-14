// Account icon: a person inside an open ring (the ring has a small gap at the
// top right). Drawn in currentColor so it follows the text colour around it.
export default function AccountIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.75 7.15 A10 10 0 1 1 13.74 2.15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="9.9" r="3.7" fill="currentColor" />
      <path
        d="M5.4 17.7 C6.7 15.2 9.1 14.4 12 14.4 C14.9 14.4 17.3 15.2 18.6 17.7 C16.9 19.3 14.6 20.1 12 20.1 C9.4 20.1 7.1 19.3 5.4 17.7 Z"
        fill="currentColor"
      />
    </svg>
  );
}
