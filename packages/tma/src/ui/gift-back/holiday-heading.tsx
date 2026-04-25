interface HolidayHeadingProps {
  name: string;
}

/**
 * Holiday title — centered, no icons, postcard back-side style.
 * Decorative divider line sits above the title.
 */
export function HolidayHeading({ name }: HolidayHeadingProps) {
  return (
    <div className="w-full text-center relative z-10">
      <h3 className="text-[#1A1A1A] text-2xl font-bold tracking-wide leading-snug">{name}</h3>
    </div>
  );
}
