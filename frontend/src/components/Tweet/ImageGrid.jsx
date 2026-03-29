export default function ImageGrid({ images = [], onClick }) {
  if (!images.length) return null;
  const count = images.length;

  const gridClass =
    count === 1 ? 'grid grid-cols-1' :
    count === 2 ? 'grid grid-cols-2 gap-2' :
    count === 3 ? 'grid grid-cols-2 gap-2' :
    'grid grid-cols-2 gap-2';

  return (
    <div className={`${gridClass} mt-3 overflow-hidden rounded-3xl`}>
      {images.slice(0, 4).map((img, index) => {
        const big = count === 3 && index === 0;
        return (
          <button
            key={img.url + index}
            onClick={() => onClick?.(index)}
            className={`relative overflow-hidden bg-slate-900 ${count === 3 && index === 0 ? 'row-span-2' : ''}`}
          >
            <img
              src={img.url}
              alt=""
              className={`h-full w-full object-cover ${count === 1 ? 'max-h-[500px]' : big ? 'min-h-[360px]' : 'min-h-[180px]'}`}
              loading="lazy"
            />
          </button>
        );
      })}
    </div>
  );
}
