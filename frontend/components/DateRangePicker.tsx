import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useState} from "react";
import theme from "@/shared/styles/theme";
import PrimeButton from "@/components/PrimeButton";
import ToggleButton from "@/components/ToggleButton";
import DatePicker from "@/components/DatePicker";

interface DateRangePickerProps {
    defaultValue?: DateRange;
    onConfirm: (value: DateRange) => void;
}

export default function DateRangePicker(props: DateRangePickerProps) {
    const [hasEndDate, setHasEndDate] = useState(!!props.defaultValue?.end);
    const [isEndDateFocused, setIsEndDateFocused] = useState(false);
    const [startDate, setStartDate] = useState<Date>(props.defaultValue?.start ?? new Date());
    const [endDate, setEndDate] = useState<Date>(props.defaultValue?.end ?? new Date());

    const handleFocusStartDate = () => {
        setIsEndDateFocused(false);
    }
    const handleFocusEndDate = () => {
        setIsEndDateFocused(true);
    }

    const handleConfirm = async () => {
        const dateRange: DateRange = {start: startDate};
        if (hasEndDate) {
            dateRange.end = endDate;
        }
        props.onConfirm(dateRange);
    }

    const handleEndDateToggle = (value: boolean) => {
        setHasEndDate(value);
        if (!value && isEndDateFocused) {
            setIsEndDateFocused(false);
        }
    }

    return (
        <View>
            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, !isEndDateFocused && styles.activeTab]}
                                  onPress={handleFocusStartDate}>
                    <Text
                        style={[styles.tabText, !isEndDateFocused && styles.activeTabText]}
                    >시작</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, isEndDateFocused && styles.activeTab]}
                                  onPress={handleFocusEndDate} disabled={!hasEndDate}>
                    <Text
                        style={[styles.tabText, isEndDateFocused && styles.activeTabText, !hasEndDate && styles.disabledTab]}
                    >종료</Text>
                </TouchableOpacity>
            </View>
            {/* Date Input */}
            <View style={styles.datePickerContainer}>
                {
                    isEndDateFocused ?
                        <DatePicker defaultValue={endDate} onChange={setEndDate}/>
                        :
                        <DatePicker defaultValue={startDate} onChange={setStartDate}/>
                }
            </View>
            {/* Actions */}
            <View style={styles.actionsContainer}>
                {/* End period Switch */}
                <ToggleButton
                    label="종료"
                    defaultValue={hasEndDate}
                    onChange={handleEndDateToggle}
                />
                {/* Confirm button */}
                <PrimeButton
                    text="확인"
                    onClickCallback={handleConfirm}
                    isActive={true}
                    isLoading={false}
                />
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