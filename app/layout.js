
import "./globals.css";

export const metadata = {
  title: "TBD FC Internationals | Madison, Wisconsin",
  description:
    "TBD FC Internationals is an amateur soccer club based in Madison, Wisconsin, competing in the UPSL.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
