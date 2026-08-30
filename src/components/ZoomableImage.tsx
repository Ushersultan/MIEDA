import { Maximize2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ZoomableImageProps = {
  src: string;
  alt: string;
  className?: string;
  buttonClassName?: string;
};

const ZoomableImage = ({
  src,
  alt,
  className,
  buttonClassName,
}: ZoomableImageProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative block cursor-zoom-in rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          buttonClassName,
        )}
        aria-label={`Agrandir la photo : ${alt}`}
      >
        <img src={src} alt={alt} className={className} />
        <span className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white opacity-90 shadow-lg transition-all group-hover:scale-105 group-hover:bg-black/80 md:opacity-0 md:group-hover:opacity-100">
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[95vh] max-w-[95vw] border-0 bg-black/95 p-3 shadow-2xl sm:max-w-5xl">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <div className="flex max-h-[90vh] items-center justify-center overflow-hidden rounded-xl">
            <img
              src={src}
              alt={alt}
              className="max-h-[88vh] max-w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ZoomableImage;
