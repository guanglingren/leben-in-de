import "./globals.css";

export const metadata = {
  title: "德国浮生记",
  description: "在德国生活，最难的不是规则多，而是没人知道规则为什么这样。"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
