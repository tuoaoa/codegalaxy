import './globals.css';

export const metadata = {
  title: 'CodeGalaxy - AI Context Navigation Engine',
  description: 'Prune codebase context visually and deteministically to minimize LLM token waste.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
