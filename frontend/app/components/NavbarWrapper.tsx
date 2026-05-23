'use client';

import Navbar from './Navbar';

// This thin wrapper exists so the server layout.tsx can import
// a client component (Navbar) without becoming a client component itself.
export default function NavbarWrapper() {
  return <Navbar />;
}
