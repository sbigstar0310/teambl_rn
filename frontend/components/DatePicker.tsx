import {StyleSheet, Text, View} from "react-native";
import {useMemo} from "react";
import theme from "@/shared/styles/theme";
import VerticalCarousel, {GAP_BETWEEN_ITEMS, ITEM_HEIGHT} from "@/components/VerticalCarousel";
import dayjs from "dayjs";

interface DatePickerProps {
    defaultValue?: Date;
    onChange: (value: Date) => void;
    min?: Date;
    max?: Date;
}

export default function DatePicker(props: DatePickerProps) {
    const selectedDate = useMemo(() => {
        const date = props.defaultValue ?? new Date();
        return dayjs(date);
    }, [props.defaultValue]);
    const minDate = useMemo(() => {
        const date = props.min ?? new Date(1900, 0);
        return dayjs(date);
    }, [props.min]);
    const maxDate = useMemo(() => {
        const date = props.max ?? new Date(3000, 11);
        return dayjs(date);
    }, [props.max]);

    const handleYearChange = (year: number) => {
        props.onChange(selectedDate.set('year', year).toDate());
    };

    const handleMonthChange = (month: number) => {
        props.onChange(selectedDate.set('month', month - 1).toDate());
    }

    const getNextYear = (year: number) => {
        if (year < maxDate.year()) return year + 1;
        else return null;
    }
    const getPrevYear = (year: number) => {
        if (year > minDate.year()) return year - 1;
        else return null;
    }
    const getNextMonth = (month: number) => {
        if (month >= 12) return null;
        if (selectedDate.set('month', month).isAfter(maxDate)) return null;
        return month + 1;
    }
    const getPrevMonth = (month: number) => {
        if (month <= 1) return null;
        if (selectedDate.set('month', month - 2).isBefore(minDate)) return null;
        return month - 1;
    }

    return (
        <View style={styles.container}>
            {/* Year */}
            <View style={styles.carouselContainer}>
                <Text style={styles.labelText}>년</Text>
                <VerticalCarousel
                    selectedItem={selectedDate.year()}
                    getPrevItem={getPrevYear}
                    getNextItem={getNextYear}
                    onChange={handleYearChange}
                />
            </View>
            {/* Month */}
            <View style={styles.carouselContainer}>
                <Text style={styles.labelText}>월</Text>
                <VerticalCarousel
                    selectedItem={selectedDate.month() + 1}
                    getPrevItem={getPrevMonth}
                    getNextItem={getNextMonth}
                    onChange={handleMonthChange}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    carouselContainer: {
        height: ITEM_HEIGHT * 3 + GAP_BETWEEN_ITEMS * 2 + 36,
        flex: 1
    },
    labelText: {
        textAlign: 'center',
        color: theme.colors.achromatic01,
        fontSize: 14,
        marginBottom: 12
    }
})