export interface PostcardMetadata {
  from?: string;
  date?: Date;
  id?: string;
}

export interface PostcardProps {
  imageUrl: string;
  additionalInfo?: PostcardMetadata;
}

export function Postcard({ imageUrl, additionalInfo }: PostcardProps) {
  const dateStr = additionalInfo?.date
    ? additionalInfo.date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : undefined;

  return (
    <div className="w-full h-full bg-[#fbfbfb] p-[20px] shadow-md relative flex flex-col" title="Postcard">
      {/* Image area */}
      <div
        className="w-full h-full bg-gray-100 relative overflow-hidden flex-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] border border-black/[0.03] bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Metadata badge — bottom-right, paper style */}
      {additionalInfo && (
        <div className="absolute bottom-[4px] right-[20px] flex items-center justify-end text-[10px] text-zinc-600 font-medium tracking-tight">
          <span>
            {additionalInfo.from && <>from {additionalInfo.from}</>}
            {additionalInfo.from && dateStr && ' • '}
            {dateStr && <>{dateStr}</>}
            {(additionalInfo.from || dateStr) && additionalInfo.id && ' • '}
            {additionalInfo.id && <>ID: {additionalInfo.id}</>}
          </span>
        </div>
      )}
    </div>
  );
}
