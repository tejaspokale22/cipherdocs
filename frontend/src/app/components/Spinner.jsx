export default function Spinner({ size = "md", variant = "dark" }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-3",
    lg: "h-8 w-8 border-4",
    xl: "h-12 w-12 border-5",
  };

  const variants = {
    dark: "border-black/20 border-t-black",
    light: "border-white/30 border-t-white",
  };

  return (
    <div
      className={`${sizes[size]} ${variants[variant]} rounded-full animate-spin`}
    />
  );
}
