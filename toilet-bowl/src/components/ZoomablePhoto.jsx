import { useRef } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

export default function ZoomablePhoto({ src, alt, onPrevious, onNext }) {
  const scale = useRef(1);
  const swipe = useRef(null);
  return (
    <div className="zoomable-photo" onClick={(event) => event.stopPropagation()}
      onTouchStart={(event) => {
        event.stopPropagation();
        swipe.current = event.touches.length === 1 && scale.current <= 1.01
          ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
      }}
      onTouchEnd={(event) => {
        event.stopPropagation();
        if (!swipe.current || event.touches.length || scale.current > 1.01) return;
        const dx = event.changedTouches[0].clientX - swipe.current.x;
        const dy = event.changedTouches[0].clientY - swipe.current.y;
        swipe.current = null;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          if (dx > 0) onPrevious?.();
          else onNext?.();
        }
      }}
      onTouchCancel={() => { swipe.current = null; }}
    >
      <TransformWrapper minScale={1} maxScale={5} centerOnInit
        doubleClick={{ mode: "toggle", step: 1 }}
        onTransform={(_, state) => { scale.current = state.scale; }}
        onPinchStart={() => { swipe.current = null; }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="photo-zoom-stage">
              <TransformComponent wrapperStyle={{ width: "100%", height: "100%", touchAction: "none" }} contentStyle={{ width: "100%", height: "100%" }}>
                <img src={src} alt={alt} draggable={false} />
              </TransformComponent>
            </div>
            <div className="photo-zoom-controls" role="group" aria-label="Photo zoom">
              <button type="button" onClick={() => zoomOut()} title="Zoom out" aria-label="Zoom out">&minus;</button>
              <button type="button" onClick={() => resetTransform()} title="Reset zoom" aria-label="Reset zoom">&#8634;</button>
              <button type="button" onClick={() => zoomIn()} title="Zoom in" aria-label="Zoom in">+</button>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
