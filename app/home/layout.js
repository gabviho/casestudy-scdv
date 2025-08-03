// app/home/layout.js
export default function HomeLayout({ children }) {
  return (
    <div
      className="
        flex items-center justify-center 
        min-h-screen 
        bg-gray dark:bg-black
      "
    >
      {children}
    </div>
  );
}
