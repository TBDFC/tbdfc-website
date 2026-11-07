
export const metadata = {
  title: "TBD FC Internationals | Madison, Wisconsin",
  description:
    "TBD FC Internationals is an amateur soccer club based in Madison, Wisconsin, competing in the UPSL.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
