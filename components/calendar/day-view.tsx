/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useModalDialog } from "@/hooks/use-modal";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import CreateMeetingDialog from "./create-meeting-dialog";

const hours = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 || 12;
  const ampm = i < 12 ? "AM" : "PM";
  return `${hour}:00 ${ampm}`;
});

export default function DailyView({
  prevButton,
  nextButton,
}: {
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
}) {
  const hoursColumnRef = useRef<HTMLDivElement>(null);
  const [detailedHour, setDetailedHour] = useState<string | null>(null);
  const [timelinePosition, setTimelinePosition] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { isOpen, openModal, closeModal } = useModalDialog();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!hoursColumnRef.current) return;
    const rect = hoursColumnRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hourHeight = rect.height / 24;
    const hour = Math.max(0, Math.min(23, Math.floor(y / hourHeight)));
    const minuteFraction = (y % hourHeight) / hourHeight;
    const minutes = Math.floor(minuteFraction * 60);

    // Format in 12-hour format
    const hour12 = hour % 12 || 12;
    const ampm = hour < 12 ? "AM" : "PM";
    setDetailedHour(`${hour12}:${Math.max(0, minutes).toString().padStart(2, "0")} ${ampm}`);

    // Ensure timelinePosition is never negative and is within bounds
    const position = Math.max(0, Math.min(rect.height, Math.round(y)));
    setTimelinePosition(position);
  }, []);

  const getFormattedDayTitle = useCallback(() => currentDate.toDateString(), [currentDate]);

  //   const dayEvents = getEventsForDay(
  //     state,
  //     currentDate?.getDate() || 0,
  //     currentDate
  //   );

  //   const timeGroups = groupEventsByTimePeriod(dayEvents);

  const handleNextDay = useCallback(() => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDay);
  }, [currentDate]);

  const handlePrevDay = useCallback(() => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(currentDate.getDate() - 1);
    setCurrentDate(prevDay);
  }, [currentDate]);

  const handleAddEventDay = (hour: string) => {
    // Logic to handle adding an event at the specified hour
    console.log(`Add event at ${hour} on ${currentDate.toDateString()}`);
    openModal();
  };

  return (
    <>
      <div className="">
        <div className="flex justify-between gap-3 flex-wrap mb-5">
          <h1 className="text-3xl font-semibold mb-4">{getFormattedDayTitle()}</h1>

          <div className="flex ml-auto  gap-3">
            {prevButton ? (
              <Button onClick={handlePrevDay}>{prevButton}</Button>
            ) : (
              <Button variant={"outline"} onClick={handlePrevDay}>
                <ArrowLeft />
                Prev
              </Button>
            )}
            {nextButton ? (
              <Button onClick={handleNextDay}>{nextButton}</Button>
            ) : (
              <Button variant={"outline"} onClick={handleNextDay}>
                Next
                <ArrowRight />
              </Button>
            )}
          </div>
        </div>
        <div key={currentDate.toISOString()} className="flex flex-col gap-4">
          <div className="relative rounded-md bg-default-50 hover:bg-default-100 transition duration-400">
            <div
              className="relative rounded-xl flex ease-in-out"
              ref={hoursColumnRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setDetailedHour(null)}
            >
              <div className="flex  flex-col">
                {hours.map((hour, index) => (
                  <div
                    key={`hour-${index}`}
                    className="cursor-pointer   transition duration-300  p-4 h-16 text-left text-sm text-muted-foreground border-default-200"
                  >
                    {hour}
                  </div>
                ))}
              </div>
              <div className="flex relative grow flex-col ">
                {Array.from({ length: 24 }).map((_, index) => (
                  <div
                    onClick={() => {
                      handleAddEventDay(detailedHour as string);
                    }}
                    key={`hour-${index}`}
                    className="cursor-pointer w-full relative border-b  hover:bg-default-200/50  transition duration-300  p-4 h-16 text-left text-sm text-muted-foreground border-default-200"
                  >
                    <div className="absolute bg-accent flex items-center justify-center text-xs opacity-0 transition left-0 top-0 duration-250 hover:opacity-100 w-full h-full">
                      Add Event
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {detailedHour && (
              <div
                className="absolute left-[50px] w-[calc(100%-53px)] h-0.5 bg-primary/40 rounded-full pointer-events-none"
                style={{ top: `${timelinePosition}px` }}
              >
                <Badge
                  variant="outline"
                  className="absolute -translate-y-1/2 bg-white z-50 -left-5 text-xs"
                >
                  {detailedHour}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
      {isOpen && (
        <CreateMeetingDialog
          open={isOpen}
          closeModal={closeModal}
          startingDate={currentDate}
          startingHour={detailedHour}
        />
      )}
    </>
  );
}
