import { useEffect, useState } from "react";
import { getGameYear } from "./gameYear";

export default function useGameYear() {
  const [year, setYear] = useState(getGameYear);
  useEffect(() => {
    const refresh = () => setYear(getGameYear());
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return year;
}
