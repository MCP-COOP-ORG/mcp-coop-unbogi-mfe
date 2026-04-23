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
  return (
    <div className="w-full h-full bg-[#fbfbfb] p-[20px] shadow-md relative flex flex-col" title="Postcard">
      <div
        className="w-full flex-1 bg-gray-100 relative overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] border border-black/[0.03] bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Text label perfectly anchored to the right */}
      {additionalInfo && (
        <div className="absolute bottom-[4px] right-[20px] flex items-center justify-end text-[10px] text-zinc-600 font-medium tracking-tight">
          <span>
            {additionalInfo.from && <>from {additionalInfo.from}</>}
            {additionalInfo.from && additionalInfo.date && ' • '}
            {additionalInfo.date && (
              <>
                {additionalInfo.date.toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </>
            )}
            {(additionalInfo.from || additionalInfo.date) && additionalInfo.id && ' • '}
            {additionalInfo.id && <>ID: {additionalInfo.id}</>}
          </span>
        </div>
      )}
    </div>
  );
}
