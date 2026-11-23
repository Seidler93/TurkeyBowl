import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion as Motion, useReducedMotion } from "framer-motion";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { loadViewerPhoto } from "../utils/viewerPhotos";

export default function ZoomablePhoto({ src, fullPath, fallbackSrc, photoKey = src, alt, caption, onPrevious, onNext }) {
  const scale = useRef(1);
  const swipe = useRef(null);
  const transforms = useRef(new Map());
  const [displayed, setDisplayed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    loadViewerPhoto({ fullUrl: src, fullPath, thumbUrl: fallbackSrc }).then((url) => {
      if (cancelled) return;
      scale.current = 1;
      swipe.current = null;
      setDisplayed({ src: url, key: photoKey, alt, caption });
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setLoading(false);
      setError("Could not load this photo. Try the next one.");
    });
    return () => { cancelled = true; };
  }, [src, fullPath, fallbackSrc, photoKey, alt, caption]);

  const transform = () => transforms.current.get(displayed?.key);
  return (
    <div className="zoomable-photo" onClick={(event) => event.stopPropagation()}
      onTouchStart={(event) => {
        event.stopPropagation();
        swipe.current = event.touches.length === 1 && scale.current <= 1.01
          ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
      }}
      onTouchEnd={(event) => {
        event.stopPropagation();
        if (!swipe.current || event.touches.length || scale.current > 1.01 || loading) return;
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
      {caption !== undefined && <div className="photo-caption" aria-live="polite" aria-atomic="true">{displayed?.caption || caption}</div>}
      <div className="photo-zoom-stage" aria-busy={loading}>
        <AnimatePresence initial={false}>
          {displayed && (
            <Motion.div className="photo-transition-layer" key={displayed.key}
              initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reducedMotion ? 1 : 1.015 }}
              transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}>
              <TransformWrapper ref={(instance) => {
                if (instance) transforms.current.set(displayed.key, instance);
                else transforms.current.delete(displayed.key);
              }} minScale={1} maxScale={5} centerOnInit
                doubleClick={{ mode: "toggle", step: 1 }}
                onTransform={(_, state) => { scale.current = state.scale; }}
                onPinchStart={() => { swipe.current = null; }}>
                <TransformComponent wrapperStyle={{ width: "100%", height: "100%", touchAction: "none" }} contentStyle={{ width: "100%", height: "100%" }}>
                  <img src={displayed.src} alt={displayed.alt} draggable={false} decoding="async" />
                </TransformComponent>
              </TransformWrapper>
            </Motion.div>
          )}
        </AnimatePresence>
        {loading && <div className="photo-transition-loading" role="status" aria-label="Loading photo"><span className="photo-loader" /></div>}
        {error && <p className="photo-transition-error" role="alert">{error}</p>}
      </div>
      <div className="photo-zoom-controls" role="group" aria-label="Photo zoom">
        <button type="button" disabled={!displayed || loading} onClick={() => transform()?.zoomOut()} title="Zoom out" aria-label="Zoom out">&minus;</button>
        <button type="button" disabled={!displayed || loading} onClick={() => transform()?.resetTransform()} title="Reset zoom" aria-label="Reset zoom">&#8634;</button>
        <button type="button" disabled={!displayed || loading} onClick={() => transform()?.zoomIn()} title="Zoom in" aria-label="Zoom in">+</button>
      </div>
    </div>
  );
}
