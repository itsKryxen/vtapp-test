import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function EventCircuitField({ children }: Props) {
  return <div className="event-circuit-field">{children}</div>;
}
