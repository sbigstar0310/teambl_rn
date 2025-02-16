import React, { useEffect, useRef, useState } from 'react';
import "../styles/DatePicker.css";
import topBarIcon from "../assets/popUpTopBar.svg";
import InfoMessage from './InfoMessage';

const MAX_YEAR_COVERAGE = 20;
const ELEMENT_HEIGHT = 26;

/**
 * All date have a "YYYY-MM-dd" format.
 */
const DatePicker = ({ isOpen, setIsOpen, startDate, endDate, setStartDate, setEndDate }) => {

    if (!isOpen) {
        return (<></>);
    }

    /** meta */
    const [tab, setTab] = useState("START"); /** ^(START, END)$ */
    const [isChanged, setIsChanged] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const [isFirstInitScroll, setIsFirstInitScroll] = useState(true);

    /** picker data */
    const [centerStartYear, setCenterStartYear] = useState(null);
    const [centerEndYear, setCenterEndYear] = useState(null);

    const [startYears, setStartYears] = useState([]);
    const [startMonths, setStartMonths] = useState([]);
    const [startDays, setStartDays] = useState([]);

    const [endYears, setEndYears] = useState([]);
    const [endMonths, setEndMonths] = useState([]);
    const [endDays, setEndDays] = useState([]);

    /** dates */
    const [selectedStartYear, setSelectedStartYear] = useState(null);
    const [selectedStartMonth, setSelectedStartMonth] = useState(null);
    const [selectedStartDay, setSelectedStartDay] = useState(null);

    const [selectedEndYear, setSelectedEndYear] = useState(null);
    const [selectedEndMonth, setSelectedEndMonth] = useState(null);
    const [selectedEndDay, setSelectedEndDay] = useState(null);

    /** refs */
    const startYearRef = useRef(null);
    const startMonthRef = useRef(null);
    const startDayRef = useRef(null);

    const endYearRef = useRef(null);
    const endMonthRef = useRef(null);
    const endDayRef = useRef(null);

    /** date utils */
    const getMaxDays = (year, month) => {
        if (month === 2) {
            return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28;
        }
        if ([4, 6, 9, 11].includes(month)) return 30;
        return 31;
    };

    const parseDate = (dateString) => {
        const [year, month, day] = dateString.split("-");

        const yearNumber = parseInt(year, 10);
        const monthNumber = parseInt(month, 10);
        const dayNumber = parseInt(day, 10);

        return { year: yearNumber, month: monthNumber, day: dayNumber };
    };

    const formatDate = (year, month, day) => {
        const formattedMonth = String(month).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');

        return `${year}-${formattedMonth}-${formattedDay}`;
    };

    /** scroll utils */
    const handleScroll = (ref, setSelected, list) => {
        if (!ref.current) return;
        if (isAutoScrolling) return;

        const index = Math.round(ref.current.scrollTop / ELEMENT_HEIGHT);

        if (index >= 0 && index < list.length) {
            setSelected(list[index]);
        }
    };

    const scrollToIndex = (ref, index) => {
        setIsAutoScrolling(true);
        ref.current.scrollTo({
            top: (index) * ELEMENT_HEIGHT,
            behavior: 'smooth'
        });

        setTimeout(() => {
            setIsAutoScrolling(false);
        }, 700);
    };

    /** tab utils */
    const moveToTap = (nextTab) => {
        if (tab === nextTab) {
            return;
        } else {
            setTab(nextTab);
            setTimeout(() => {
                setIsFirstInitScroll(true);
            }, 100);
        }
    };

    /** effects */

    /** initialize */
    useEffect(() => {
        if ((startDate == null) || (endDate == null)) {
            const currentYear = new Date().getFullYear();
            const currentMonth = (new Date().getMonth()) + 1;
            const currentDay = new Date().getDate();

            const years = Array.from({ length: (2 * MAX_YEAR_COVERAGE + 1) }, (_, i) => currentYear - MAX_YEAR_COVERAGE + i); /** +- MAX_YEAR_COVERAGE years */
            const tempEndYears = Array.from({ length: (2 * MAX_YEAR_COVERAGE + 1) }, (_, i) => currentYear + 1 - MAX_YEAR_COVERAGE + i); /** +- MAX_YEAR_COVERAGE years */
            const months = Array.from({ length: 12 }, (_, i) => i + 1);
            const days = Array.from({ length: getMaxDays(currentYear, currentMonth) }, (_, i) => i + 1);
            const tempEndDays = Array.from({ length: getMaxDays(currentYear + 1, currentMonth) }, (_, i) => i + 1);

            setSelectedStartYear(currentYear);
            setSelectedStartMonth(currentMonth);
            setSelectedStartDay(currentDay);

            setSelectedEndYear(currentYear + 1);
            setSelectedEndMonth(currentMonth);
            setSelectedEndDay((currentDay == 1) ? 1 : (currentDay - 1));

            setStartYears(years);
            setStartMonths(months);
            setStartDays(days);

            setEndYears(tempEndYears);
            setEndMonths(months);
            setEndDays(tempEndDays);

            setCenterStartYear(currentYear);
            setCenterEndYear(currentYear + 1);
        } else { /** use prev values */
            /** start date */
            const parsedStartDate = parseDate(startDate);
            const currentStartYear = parsedStartDate['year'];
            const currentStartMonth = parsedStartDate['month'];
            const currentStartDay = parsedStartDate['day'];

            const tempStartYears = Array.from({ length: 41 }, (_, i) => currentStartYear - MAX_YEAR_COVERAGE + i); /** +- MAX_YEAR_COVERAGE years */
            const tempStartMonths = Array.from({ length: 12 }, (_, i) => i + 1);
            const tempStartDays = Array.from({ length: getMaxDays(currentStartYear, currentStartMonth) }, (_, i) => i + 1);

            setSelectedStartYear(currentStartYear);
            setSelectedStartMonth(currentStartMonth);
            setSelectedStartDay(currentStartDay);

            setStartYears(tempStartYears);
            setStartMonths(tempStartMonths);
            setStartDays(tempStartDays);

            setCenterStartYear(currentStartYear);

            /** end date */
            const parsedEndDate = parseDate(endDate);
            const currentEndYear = parsedEndDate['year'];
            const currentEndMonth = parsedEndDate['month'];
            const currentEndDay = parsedEndDate['day'];

            const tempEndYears = Array.from({ length: 41 }, (_, i) => currentEndYear - MAX_YEAR_COVERAGE + i); /** +- MAX_YEAR_COVERAGE years */
            const tempEndMonths = Array.from({ length: 12 }, (_, i) => i + 1);
            const tempEndDays = Array.from({ length: getMaxDays(currentEndYear, currentEndMonth) }, (_, i) => i + 1);

            setSelectedEndYear(currentEndYear);
            setSelectedEndMonth(currentEndMonth);
            setSelectedEndDay(currentEndDay);

            setEndYears(tempEndYears);
            setEndMonths(tempEndMonths);
            setEndDays(tempEndDays);

            setCenterEndYear(currentEndYear);
        }
    }, [startDate, endDate]);

    /** when year or month changed => check the day */
    useEffect(() => {
        if ((selectedStartYear == null) || (selectedStartMonth == null)) {
            return;
        } else {
            const maxDay = getMaxDays(selectedStartYear, selectedStartMonth);
            const newDays = Array.from({ length: maxDay }, (_, i) => i + 1);
            setStartDays(newDays);
            if (selectedStartDay > maxDay) {
                setSelectedStartDay(maxDay);
            }
        }
    }, [selectedStartYear, selectedStartMonth]);

    useEffect(() => {
        if ((selectedEndYear == null) || (selectedEndMonth == null)) {
            return;
        } else {
            const maxDay = getMaxDays(selectedEndYear, selectedEndMonth);
            const newDays = Array.from({ length: maxDay }, (_, i) => i + 1);
            setEndDays(newDays);
            if (selectedEndDay > maxDay) {
                setSelectedEndDay(maxDay);
            }
        }
    }, [selectedEndYear, selectedEndMonth]);

    /** meta init */
    useEffect(() => {
        setIsChanged(false);
        setIsValid(false);
        setIsAutoScrolling(false);
        setIsFirstInitScroll(true);
    }, [isOpen]);

    /** initial scroll */
    useEffect(() => {
        if ((selectedStartYear != null)
            && (selectedStartMonth != null)
            && (selectedStartDay != null)
            && (selectedEndYear != null)
            && (selectedEndMonth != null)
            && (selectedEndDay != null)
            && isFirstInitScroll) {
            if (tab === "START") {
                scrollToIndex(startYearRef, selectedStartYear - centerStartYear + MAX_YEAR_COVERAGE);
                scrollToIndex(startMonthRef, selectedStartMonth - 1);
                scrollToIndex(startDayRef, selectedStartDay - 1);
            } else {
                scrollToIndex(endYearRef, selectedEndYear - centerEndYear + MAX_YEAR_COVERAGE);
                scrollToIndex(endMonthRef, selectedEndMonth - 1);
                scrollToIndex(endDayRef, selectedEndDay - 1);
            }
            setIsFirstInitScroll(false);
        }
    }, [isFirstInitScroll, selectedStartYear, selectedStartMonth, selectedStartDay, selectedEndDay, selectedEndMonth, selectedEndYear, centerStartYear, centerEndYear]);

    /** validation (start to end direction) */
    useEffect(() => {
        if ((selectedStartYear != null)
            && (selectedStartMonth != null)
            && (selectedStartDay != null)
            && (selectedEndYear != null)
            && (selectedEndMonth != null)
            && (selectedEndDay != null)) {
            /** check validity */
            const generatedStartDate = new Date(selectedStartYear, selectedStartMonth - 1, selectedStartDay);
            const generatedEndDate = new Date(selectedEndYear, selectedEndMonth - 1, selectedEndDay);

            // if (generatedStartDate > generatedEndDate) {
            //     /** modify end date (after a year) */
            //     setSelectedEndYear(selectedStartYear + 1);
            //     setSelectedEndMonth(selectedStartMonth);
            //     setSelectedEndDay(selectedStartDay - 1);
            // } else {
            //     setIsValid(true);
            // }
            setIsValid(!(generatedStartDate > generatedEndDate));
        } else {
            setIsValid(false);
        }
    }, [selectedStartYear, selectedStartMonth, selectedStartDay]);

    /** validation (end to start direction) */
    useEffect(() => {
        if ((selectedStartYear != null)
            && (selectedStartMonth != null)
            && (selectedStartDay != null)
            && (selectedEndYear != null)
            && (selectedEndMonth != null)
            && (selectedEndDay != null)) {
            /** check validity */
            const generatedStartDate = new Date(selectedStartYear, selectedStartMonth - 1, selectedStartDay);
            const generatedEndDate = new Date(selectedEndYear, selectedEndMonth - 1, selectedEndDay);

            // if (generatedStartDate > generatedEndDate) {
            //     /** modify start date (before a year) */
            //     setSelectedStartYear(selectedEndYear - 1);
            //     setSelectedStartMonth(selectedEndMonth);
            //     setSelectedStartDay((selectedEndDay == 1) ? 1 : (selectedEndDay - 1));
            // } else {
            //     setIsValid(true);
            // }
            
            setIsValid(!(generatedStartDate > generatedEndDate));
        } else {
            setIsValid(false);
        }
    }, [selectedEndDay, selectedEndMonth, selectedEndYear]);

    /** isChanged checker */
    useEffect(() => {
        if ((selectedStartYear != null)
            && (selectedStartMonth != null)
            && (selectedStartDay != null)
            && (selectedEndYear != null)
            && (selectedEndMonth != null)
            && (selectedEndDay != null)) {
            const generatedStartDateStr = formatDate(selectedStartYear, selectedStartMonth, selectedStartDay);
            const generatedEndDateStr = formatDate(selectedEndYear, selectedEndMonth, selectedEndDay);
            setIsChanged((generatedStartDateStr !== startDate) || (generatedEndDateStr !== endDate));
        } else {
            setIsChanged(false);
        }
    }, [isFirstInitScroll, selectedStartYear, selectedStartMonth, selectedStartDay, selectedEndDay, selectedEndMonth, selectedEndYear, centerStartYear, centerEndYear, startDate, endDate]);

    /** component renderer */
    const renderPickerItems = (items, selectedItem) => {
        const dummyItem1 = <div key="dummy1" className="picker-item dummy"></div>;
        const dummyItem2 = <div key="dummy2" className="picker-item dummy"></div>;
        return [
            dummyItem1,
            ...items.map((item) => (
                <div
                    key={item}
                    className={`picker-item ${item === selectedItem ? 'selected' : ''}`}
                >
                    {item}
                </div>
            )),
            dummyItem2
        ];
    };

    return (
        <div
            className={'datePicker-overlay-wrapper'}
            onClick={() => setIsOpen(false)}
        >
            <div
                className='datePicker-overlay'
                onClick={(e) => e.stopPropagation()}
            >
                <div className="datePicker-top">
                    <img
                        style={{
                            margin: '16px 0px 16px 0px'
                        }}
                        src={topBarIcon}
                        alt="top useless bar"
                    />
                </div>
                {/** selection tab */}
                <div className='datePicker-tab-container'>
                    <button
                        className={`datePicker-tab${(tab === "START") ? " datePicker-tab-selected" : ""}`}
                        onClick={() => moveToTap("START")}
                    >
                        {"시작"}
                    </button>
                    <button
                        className={`datePicker-tab${(tab === "END") ? " datePicker-tab-selected" : ""}`}
                        onClick={() => moveToTap("END")}
                    >
                        {"종료"}
                    </button>
                </div>
                <div className="datePicker-container">
                    <div className='picker-title-container'>
                        <span className='picker-title'>
                            {"년"}
                        </span>
                        <span className='picker-title'>
                            {"월"}
                        </span>
                        <span className='picker-title'>
                            {"일"}
                        </span>
                    </div>
                    {/** START */}
                    <div className={`picker-container${(tab === "START") ? "" : " hidden"}`}>
                        <div
                            className="picker"
                            ref={startYearRef}
                            onScroll={() => handleScroll(startYearRef, setSelectedStartYear, startYears)}
                        >
                            {renderPickerItems(startYears, selectedStartYear)}
                        </div>
                        <div
                            className="picker"
                            ref={startMonthRef}
                            onScroll={() => handleScroll(startMonthRef, setSelectedStartMonth, startMonths)}
                        >
                            {renderPickerItems(startMonths, selectedStartMonth)}
                        </div>
                        <div
                            className="picker"
                            ref={startDayRef}
                            onScroll={() => handleScroll(startDayRef, setSelectedStartDay, startDays)}
                        >
                            {renderPickerItems(startDays, selectedStartDay)}
                        </div>
                    </div>
                    {/** END */}
                    <div className={`picker-container${(tab === "END") ? "" : " hidden"}`}>
                        <div
                            className="picker"
                            ref={endYearRef}
                            onScroll={() => handleScroll(endYearRef, setSelectedEndYear, endYears)}
                        >
                            {renderPickerItems(endYears, selectedEndYear)}
                        </div>
                        <div
                            className="picker"
                            ref={endMonthRef}
                            onScroll={() => handleScroll(endMonthRef, setSelectedEndMonth, endMonths)}
                        >
                            {renderPickerItems(endMonths, selectedEndMonth)}
                        </div>
                        <div
                            className="picker"
                            ref={endDayRef}
                            onScroll={() => handleScroll(endDayRef, setSelectedEndDay, endDays)}
                        >
                            {renderPickerItems(endDays, selectedEndDay)}
                        </div>
                    </div>
                    <button
                        className={`confirm-button${(isValid && isChanged) ? "" : " disabled"}`}
                        onClick={() => {
                            if (isValid && isChanged) {
                                setStartDate(formatDate(selectedStartYear, selectedStartMonth, selectedStartDay));
                                setEndDate(formatDate(selectedEndYear, selectedEndMonth, selectedEndDay));
                                setIsOpen(false);
                            }
                        }}
                    >
                        {"확인"}
                    </button>
                    {
                        ((!isChanged) || isValid) &&
                        <div
                            style={{
                                height: '19px'
                            }}
                        >
                            {/* {"NO CONTENT"} */}
                        </div>
                    }
                    {
                        isChanged && (!isValid) &&
                        <InfoMessage
                            type={"bad"}
                            message={"시작 날짜는 종료 날짜와 같거나 이전이어야 합니다."}
                        />
                    }
                </div>
            </div>
        </div>
    );
};

export default DatePicker;