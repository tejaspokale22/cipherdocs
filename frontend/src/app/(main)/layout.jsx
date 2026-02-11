import Navbar from "@/app/components/Navbar";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
