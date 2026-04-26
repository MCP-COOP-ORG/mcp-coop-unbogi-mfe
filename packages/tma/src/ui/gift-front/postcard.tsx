import { APP_CONFIG } from '@unbogi/shared';
import type { ReactNode } from 'react';
import { sanitizeImageUrl } from '@/lib';

export interface PostcardMetadata {
  from?: string;
  date?: Date;
  id?: string;
}

export interface PostcardProps {
  imageUrl: string;
  additionalInfo?: PostcardMetadata;
  imageOverlay?: ReactNode;
}

export function Postcard({ imageUrl, additionalInfo, imageOverlay }: PostcardProps) {
  return (
    <div
      className="w-full h-full bg-[#FAF6EE] p-[20px] shadow-md relative flex flex-col border border-black"
      title="Postcard"
    >
      <div
        className="w-full flex-1 bg-gray-100 relative overflow-hidden bg-cover bg-center border border-black"
        style={{ backgroundImage: `url(${sanitizeImageUrl(imageUrl)})` }}
      >
        {/* Image-area overlay slot (e.g. ScratchCanvas) — clipped to image bounds */}
        {imageOverlay && <div className="absolute inset-0 rounded-[inherit] overflow-hidden">{imageOverlay}</div>}
      </div>

      {/* Text label centered at bottom */}
      {additionalInfo && (
        <div className="absolute bottom-[4px] left-0 right-0 flex items-center justify-center text-[10px] text-zinc-600 font-medium tracking-tight">
          <span>
            {additionalInfo.from && <>from {additionalInfo.from}</>}
            {additionalInfo.from && additionalInfo.date && ' • '}
            {additionalInfo.date?.toLocaleDateString(APP_CONFIG.DEFAULT_LOCALE, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      )}
    </div>
  );
}
