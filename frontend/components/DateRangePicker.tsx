import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useMemo, useState} from "react";
import theme from "@/shared/styles/theme";
import PrimeButton from "@/components/PrimeButton";
import ToggleButton from "@/components/ToggleButton";
import DatePicker from "@/components/DatePicker";
import dayjs from "dayjs";

interface DateRangePickerProps {
    defaultValue?: DateRange;
    onConfirm: (value: DateRange) => void;
}

export default function DateRangePicker(props: DateRangePickerProps) {
    const [isEndDateFocused, setIsEndDateFocused] = useState(false);
    const [startDate, setStartDate] = useState<Date>(props.defaultValue?.start ?? new Date());
    const [endDate, setEndDate] = useState<Date | null>(props.defaultValue?.end ?? null);
    const hasEndDate = useMemo(() => endDate !== null, [endDate]);

    const handleFocusStartDate = () => {
        setIsEndDateFocused(false);
    }
    const handleFocusEndDate = () => {
        setIsEndDateFocused(true);
    }

    const handleConfirm = async () => {
        const dateRange: DateRange = {start: startDate};
        if (endDate !== null) {
            dateRange.end = endDate;
        }
        props.onConfirm(dateRange);
    }

    const handleEndDateToggle = (hasEndDate: boolean) => {
        if (hasEndDate) {
            setEndDate(startDate);
        } else {
            setEndDate(null);
        }
        if (!hasEndDate && isEndDateFocused) {
            // If turning off the end date while focusing on end date
            setIsEndDateFocused(false);
        }
    }

    const handleStartDateChange = (date: Date) => {
        if (endDate !== null && dayjs(endDate).isBefore(date)) {
            // If there's end date which is set before start date, update it
            setEndDate(date);
        }
        setStartDate(date);
    }

    return (
        <View>
            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, !isEndDateFocused && styles.activeTab]}
                    onPress={handleFocusStartDate}
                >
                    <Text
                        style={[styles.tabText, !isEndDateFocused && styles.activeTabText]}
                    >
                        시작
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, isEndDateFocused && styles.activeTab]}
                    onPress={handleFocusEndDate}
                    disabled={!hasEndDate}
                >
                    <Text
                        style={[styles.tabText, isEndDateFocused && styles.activeTabText, !hasEndDate && styles.disabledTab]}
                    >
                        종료
                    </Text>
                </TouchableOpacity>
            </View>
            {/* Date Input */}
            <View style={styles.datePickerContainer}>
                {
                    isEndDateFocused ?
                        <DatePicker
                            defaultValue={endDate ?? undefined}
                            onChange={setEndDate}
                            min={startDate}
                        />
                        :
                        <DatePicker
                            defaultValue={startDate}
                            onChange={handleStartDateChange}
                        />
                }
            </View>
            {/* Actions */}
            <View style={styles.actionsContainer}>
                {/* End period Switch */}
                <ToggleButton
                    label="종료"
                    defaultValue={endDate !== null}
                    onChange={handleEndDateToggle}
                />
                {/* Confirm button */}
                <View style={{flex: 1}}>
                    <PrimeButton
                        text="확인"
                        onClickCallback={handleConfirm}
                        isActive={true}
                        isLoading={false}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    actionsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 24,
        padding: 12
    },
    datePickerContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    tab: {
        flex: 1,
        padding: 12,
        borderBottomWidth: 2,
        borderColor: theme.colors.achromatic04
    },
    tabText: {
        fontSize: 16,
        color: theme.colors.achromatic01,
        textAlign: 'center'
    },
    activeTab: {
        borderColor: theme.colors.main
    },
    activeTabText: {
        color: theme.colors.main,
    },
    disabledTab: {
        color: theme.colors.achromatic04
    },
    button: {
        flex: 1,
        padding: 10,
        backgroundColor: theme.colors.main,
        borderRadius: 5
    },
    buttonText: {
        color: theme.colors.white,
        textAlign: "center"
    }
})

/*
 * Represents a date range.
 * end is optional - represents end date of the range when given.
 */
export type DateRange = {
    start: Date;
    end?: Date;
}

export function toDateRangeString(dateRange: DateRange): string {
    console.log(dateRange);
    let text = `${dayjs(dateRange.start).format("YYYY.MM")} ~`;
    if (dateRange.end) {
        text += ` ${dayjs(dateRange.end).format("YYYY.MM")}`;
    }
    return text;
}