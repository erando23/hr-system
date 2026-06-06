export const metadata = {
  title: "HR System",
  description: "Sistem Manajemen SDM & Penggajian",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, background: "#07090F" }}>
        {children}
      </body>
    </html>
  );
}
