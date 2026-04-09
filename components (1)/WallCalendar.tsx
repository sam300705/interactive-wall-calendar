"use client";

import { useState, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  addMonths,
  subMonths,
  differenceInCalendarDays,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DateRange {
  start: Date | null;
  end: Date | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const HERO_IMAGES: Record<number, string> = {
  0: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=85",
  1: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&q=85",
  2: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=85",
  3: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&q=85",
  4: "https://images.unsplash.com/photo-1490750967868-88df5691cc35?w=800&q=85",
  5: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=85",
  6: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=85",
  7: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=85",
  8: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=85",
  9: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85",
  10: "https://images.unsplash.com/photo-1477322524744-0eece9e79640?w=800&q=85",
  11: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=800&q=85",
};

// ─── HeroImage ────────────────────────────────────────────────────────────────

interface HeroImageProps {
  month: Date;
  direction: number;
}

function HeroImage({ month, direction }: HeroImageProps) {
  const monthIndex = month.getMonth();
  const monthName = format(month, "MMMM");
  const year = format(month, "yyyy");

  return (
    <div className="relative overflow-hidden bg-stone-900 md:h-full h-52">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={monthIndex}
          custom={direction}
          initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0 }}
          transition={{ type: "tween", duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          {/* position:relative required for next/image fill mode */}
          <div className="absolute inset-0">
            <Image
              src={HERO_IMAGES[monthIndex]}
              alt={`${monthName} landscape`}
              fill
              style={{ objectFit: "cover" }}
              priority={monthIndex === new Date().getMonth()}
              sizes="(max-width: 768px) 100vw, 280px"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* Month label */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <motion.div
          key={`label-${monthIndex}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <p className="font-serif text-4xl font-semibold text-white leading-none tracking-tight">
            {monthName}
          </p>
          <p className="font-mono text-xs text-white/50 tracking-widest mt-1">
            {year}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ─── DayCell ──────────────────────────────────────────────────────────────────

interface DayCellProps {
  date: Date;
  range: DateRange;
  hoverDate: Date | null;
  onClick: (date: Date) => void;
  onHover: (date: Date | null) => void;
}

const DayCell = memo(function DayCell({ date, range, hoverDate, onClick, onHover }: DayCellProps) {
  const { start, end } = range;

  const isStart = start ? isSameDay(date, start) : false;
  const isEnd = end ? isSameDay(date, end) : false;
  const isTodayDate = isToday(date);

  // Confirmed range fill
  const effectiveLo = start && end ? (isBefore(start, end) ? start : end) : start;
  const effectiveHi = start && end ? (isBefore(start, end) ? end : start) : null;
  const isInRange =
    effectiveLo && effectiveHi
      ? isAfter(date, effectiveLo) && isBefore(date, effectiveHi)
      : false;

  // Hover preview (only when start set, end not yet)
  const hoverLo =
    start && !end && hoverDate
      ? isBefore(start, hoverDate)
        ? start
        : hoverDate
      : null;
  const hoverHi =
    start && !end && hoverDate
      ? isBefore(start, hoverDate)
        ? hoverDate
        : start
      : null;
  const isHoverRange =
    hoverLo && hoverHi
      ? isAfter(date, hoverLo) && isBefore(date, hoverHi)
      : false;
  const isHoverEnd =
    !end && hoverDate ? isSameDay(date, hoverDate) : false;

  // Cell styling
  let cellClass =
    "min-h-[44px] min-w-[44px] flex items-center justify-center text-sm rounded-lg cursor-pointer select-none transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 relative";

  if (isStart && isEnd) {
    cellClass += " bg-violet-700 text-white rounded-lg";
  } else if (isStart) {
    cellClass += " bg-violet-700 text-white rounded-l-lg rounded-r-none z-10";
  } else if (isEnd) {
    cellClass += " bg-violet-700 text-white rounded-r-lg rounded-l-none z-10";
  } else if (isInRange) {
    cellClass += " bg-violet-100 text-violet-900 rounded-none";
  } else if (isHoverEnd && !end) {
    cellClass += " bg-violet-300 text-violet-900 rounded-r-lg rounded-l-none";
  } else if (isHoverRange) {
    cellClass += " bg-violet-100 text-violet-900 rounded-none";
  } else {
    cellClass += " text-stone-600 hover:bg-stone-100";
    if (isTodayDate) cellClass += " font-semibold text-violet-700";
  }

  const ariaLabel = `${format(date, "MMMM d, yyyy")}${isTodayDate ? " (today)" : ""}${isStart ? " — range start" : ""}${isEnd ? " — range end" : ""}`;

  return (
    <div
      role="gridcell"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-selected={isStart || isEnd || isInRange}
      className={cellClass}
      onClick={() => onClick(date)}
      onMouseEnter={() => onHover(date)}
      onMouseLeave={() => onHover(null)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(date);
        }
      }}
    >
      {format(date, "d")}
      {isTodayDate && !isStart && !isEnd && (
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500" />
      )}
    </div>
  );
});

// ─── DateGrid ─────────────────────────────────────────────────────────────────

interface DateGridProps {
  month: Date;
  range: DateRange;
  direction: number;
  onDayClick: (date: Date) => void;
  onDayHover: (date: Date | null) => void;
  hoverDate: Date | null;
}

function DateGrid({
  month,
  range,
  direction,
  onDayClick,
  onDayHover,
  hoverDate,
}: DateGridProps) {
  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });
  const firstDayOffset = getDay(startOfMonth(month));

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={format(month, "yyyy-MM")}
          custom={direction}
          initial={{ x: direction > 0 ? 40 : -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -40 : 40, opacity: 0 }}
          transition={{ type: "tween", duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        >
          <div
            role="grid"
            aria-label={format(month, "MMMM yyyy")}
            className="grid grid-cols-7 gap-0.5"
          >
            {/* Weekday headers */}
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                role="columnheader"
                aria-label={d}
                className="text-center font-mono text-[10px] tracking-widest text-stone-400 py-1"
              >
                {d}
              </div>
            ))}

            {/* Empty offset cells */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} aria-hidden="true" />
            ))}

            {/* Day cells */}
            {days.map((date) => (
              <DayCell
                key={date.toISOString()}
                date={date}
                range={range}
                hoverDate={hoverDate}
                onClick={onDayClick}
                onHover={onDayHover}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── NotesPanel ───────────────────────────────────────────────────────────────

interface NotesPanelProps {
  range: DateRange;
  notes: string;
  onNotesChange: (val: string) => void;
  onClear: () => void;
}

function NotesPanel({ range, notes, onNotesChange, onClear }: NotesPanelProps) {
  const { start, end } = range;

  const lo = start && end ? (isBefore(start, end) ? start : end) : start;
  const hi = start && end ? (isBefore(start, end) ? end : start) : null;

  let rangeLabel = "";
  let statusText = "Click a date to start selecting";

  if (lo && hi) {
    const days = differenceInCalendarDays(hi, lo) + 1;
    rangeLabel = `${format(lo, "MMM d")} – ${format(hi, "MMM d, yyyy")}`;
    statusText = `${days} day${days > 1 ? "s" : ""} selected`;
  } else if (lo) {
    rangeLabel = `${format(lo, "MMM d, yyyy")} → ?`;
    statusText = "Select an end date";
  }

  return (
    <div className="mt-4 pt-4 border-t border-stone-200">
      <p className="font-mono text-[10px] tracking-widest text-stone-400 uppercase mb-1.5">
        Notes
      </p>
      <div className="min-h-[18px] mb-1.5">
        {rangeLabel && (
          <motion.p
            key={rangeLabel}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-medium text-violet-700"
          >
            {rangeLabel}
          </motion.p>
        )}
      </div>
      <textarea
        aria-label="Notes for selected range or month"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Add a note for this month or selected range..."
        rows={3}
        className="w-full text-sm text-stone-700 placeholder-stone-300 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
      />
      <div className="flex items-center justify-between mt-2">
        <p aria-live="polite" aria-atomic="true" className="text-xs text-stone-400">{statusText}</p>
        {(start || end) && (
          <button
            onClick={onClear}
            className="text-[11px] font-mono text-stone-400 hover:text-stone-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded px-1"
            aria-label="Clear date selection"
          >
            Clear selection
          </button>
        )}
      </div>
    </div>
  );
}

// ─── CalendarWidget (main) ────────────────────────────────────────────────────

export default function CalendarWidget() {
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [direction, setDirection] = useState(0);
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [mounted, setMounted] = useState(false);

  // Hydration guard — localStorage only on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load notes from localStorage keyed by month
  useEffect(() => {
    if (!mounted) return;
    const key = `cal_notes_${format(viewMonth, "yyyy-MM")}`;
    const saved = localStorage.getItem(key) ?? "";
    setNotes(saved);
  }, [viewMonth, mounted]);

  // Persist notes
  const handleNotesChange = useCallback(
    (val: string) => {
      setNotes(val);
      if (!mounted) return;
      const key = `cal_notes_${format(viewMonth, "yyyy-MM")}`;
      localStorage.setItem(key, val);
    },
    [viewMonth, mounted]
  );

  const handleDayHover = useCallback((date: Date | null) => {
    setHoverDate(date);
  }, []);

  const navigate = (delta: number) => {
    setDirection(delta);
    setRange({ start: null, end: null });
    setHoverDate(null);
    setViewMonth((prev) =>
      delta > 0 ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const handleDayClick = useCallback((date: Date) => {
    setRange((prev) => {
      // No start — set start
      if (!prev.start) return { start: date, end: null };
      // Already have both — reset and start fresh
      if (prev.start && prev.end) return { start: date, end: null };
      // Same day as start — deselect
      if (isSameDay(date, prev.start)) return { start: null, end: null };
      // Set end — auto-correct direction
      return { start: prev.start, end: date };
    });
  }, []);

  const handleClear = useCallback(() => {
    setRange({ start: null, end: null });
    setHoverDate(null);
  }, []);

  return (
    <div
      className="font-sans max-w-3xl mx-auto rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm"
      role="application"
      aria-label="Interactive wall calendar"
    >
      <div className="grid md:grid-cols-[280px_1fr] grid-rows-[auto_1fr] md:grid-rows-none min-h-[480px]">
        {/* Left: Hero image */}
        <HeroImage month={viewMonth} direction={direction} />

        {/* Right: Calendar panel */}
        <div className="flex flex-col p-5">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              aria-label="Previous month"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              ←
            </button>
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                key={format(viewMonth, "yyyy-MM")}
                initial={{ opacity: 0, y: direction > 0 ? 8 : -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction > 0 ? -8 : 8 }}
                transition={{ duration: 0.22 }}
                className="font-serif text-lg font-semibold text-stone-800"
              >
                {format(viewMonth, "MMMM yyyy")}
              </motion.h2>
            </AnimatePresence>
            <button
              onClick={() => navigate(1)}
              aria-label="Next month"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              →
            </button>
          </div>

          {/* Date grid */}
          <DateGrid
            month={viewMonth}
            range={range}
            direction={direction}
            onDayClick={handleDayClick}
            onDayHover={handleDayHover}
            hoverDate={hoverDate}
          />

          {/* Notes */}
          {mounted && (
            <NotesPanel
              range={range}
              notes={notes}
              onNotesChange={handleNotesChange}
              onClear={handleClear}
            />
          )}
        </div>
      </div>
    </div>
  );
}
