import * as React from 'react'

type IconProps = React.SVGProps<SVGSVGElement>

function createIcon(paths: React.ReactNode) {
  return function LucideIcon({ className, ...props }: IconProps) {
    return (
      <svg
        className={className}
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        {...props}
      >
        {paths}
      </svg>
    )
  }
}

export const PanelLeft = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
  </>,
)

export const LayoutDashboard = createIcon(
  <>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </>,
)

export const FileText = createIcon(
  <>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
    <path d="M8 13h8" />
    <path d="M8 17h8" />
  </>,
)

export const FolderKanban = createIcon(
  <>
    <path d="M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    <path d="M8 12h3" />
    <path d="M8 16h2" />
    <path d="M14 12h2" />
    <path d="M14 16h3" />
  </>,
)

export const Briefcase = createIcon(
  <>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 13h18" />
  </>,
)

export const MessageSquareQuote = createIcon(
  <>
    <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 9h.01" />
    <path d="M12 9h.01" />
    <path d="M8 13h4" />
  </>,
)

export const Users = createIcon(
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
)

export const DollarSign = createIcon(
  <>
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" />
  </>,
)

export const Inbox = createIcon(
  <>
    <path d="M22 12h-4l-2 3h-8l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </>,
)

export const CalendarClock = createIcon(
  <>
    <path d="M21 7.5V6a2 2 0 0 0-2-2h-1V2" />
    <path d="M6 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h7" />
    <path d="M3 10h18" />
    <path d="M8 2v2" />
    <circle cx="18" cy="18" r="4" />
    <path d="M18 16.5v2.5l1.5 1" />
  </>,
)

export const Newspaper = createIcon(
  <>
    <path d="M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    <path d="M8 10h8" />
    <path d="M8 14h8" />
    <path d="M8 18h5" />
  </>,
)

export const Image = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.5-3.5a2 2 0 0 0-2.8 0L8 18" />
  </>,
)

export const Navigation = createIcon(
  <>
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </>,
)

export const PanelBottom = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 15h18" />
  </>,
)

export const LogOut = createIcon(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </>,
)
