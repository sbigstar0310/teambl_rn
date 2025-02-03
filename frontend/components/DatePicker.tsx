import {StyleSheet, Text, View} from "react-native";
import {useEffect, useMemo, useState} from "react";
import theme from "@/shared/styles/theme";
import VerticalCarousel, {GAP_BETWEEN_ITEMS, ITEM_HEIGHT} from "@/components/VerticalCarousel";

interface DatePickerProps {
    defaultValue?: Date;
    onChange: (value: Date) => void;
    min?: Date;
    max?: Date;
}

export default function DatePicker(props: DatePickerProps) {
    const [selectedYear, setSelectedYear] = useState<number>(0);
    const [selectedMonth, setSelectedMonth] = useState<number>(0);
    const [minYear, minMonth] = useMemo(() => {
        const minDate = props.min ?? new Date(1900, 0);
        return [minDate.getFullYear(), minDate.getMonth() + 1];
    }, [props.min]);
    const [maxYear, maxMonth] = useMemo(() => {
        const maxDate = props.max ?? new Date(3000, 11);
        return [maxDate.getFullYear(), maxDate.getMonth() + 1];
    }, [props.max]);

    useEffect(() => {
        let date = props.defaultValue ?? new Date();
        setSelectedYear(date.getFullYear());
        setSelectedMonth(date.getMonth() + 1);
    }, [props.defaultValue]);

    const handleYearChange = (year: number) => {
        setSelectedYear(year);
        props.onChange(new Date(year, selectedMonth));
    };

    const handleMonthChange = (month: number) => {
        setSelectedMonth(month);
        props.onChange(new Date(selectedYear, month));
    }

    const getNextYear = (year: number) => {
        if (year <= maxYear) return year + 1;
        else return null;
    }
    const getPrevYear = (year: number) => {
        if (year >= minYear) return year - 1;
        else return null;
    }
    const getNextMonth = (month: number) => {
        if (month < 12 && (selectedYear < maxYear || month < maxMonth)) return month + 1;
        else return null;
    }
    const getPrevMonth = (month: number) => {
        if (month > 1 && (selectedYear > minYear || month > minMonth)) return month - 1;
        else return null;
    }

    return (
        <View style={styles.container}>
            {/* Year */}
            <View style={styles.carouselContainer}>
                <Text style={styles.labelText}>년</Text>
                <VerticalCarousel
                    selectedItem={selectedYear}
                    getPrevItem={getPrevYear}
                    getNextItem={getNextYear}
                    onChange={handleYearChange}
                />
            </View>
            {/* Month */}
            <View style={styles.carouselContainer}>
                <Text style={styles.labelText}>월</Text>
                <VerticalCarousel
                    selectedItem={selectedMonth}
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