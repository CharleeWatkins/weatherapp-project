import { ReactNode, CSSProperties } from 'react';

interface SectionProps {
  children: ReactNode;
  py?: number;
  bordered?: boolean;
  bg?: string;
  className?: string;
  style?: CSSProperties;
}

export default function Section({
  children,
  py = 48,
  bordered = false,
  bg,
  className = '',
  style,
}: SectionProps) {
  return (
    <section
      className={`section${bordered ? ' section--bordered' : ''} ${className}`}
      style={{ paddingTop: py, paddingBottom: py, background: bg, ...style }}
    >
      <div className="container">{children}</div>
    </section>
  );
}