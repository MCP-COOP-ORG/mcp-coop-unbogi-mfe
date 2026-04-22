interface HolidayHeadingProps {
  name: string;
}

/**
 * Holiday title — centered, no icons, postcard back-side style.
 * Decorative divider line sits above the title.
 */
export function HolidayHeading({ name }: HolidayHeadingProps) {
  return (
    <div className="w-full text-center mb-5 mt-6 relative z-10">
      {/* Decorative top line */}
      <div className="w-16 h-[1px] bg-white/20 mx-auto mb-5 rounded-full" />

      <h3 className="text-white/90 text-2xl font-bold tracking-wide drop-shadow-md leading-snug">{name}</h3>
    </div>
  );
}
