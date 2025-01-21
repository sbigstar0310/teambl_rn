import {StyleSheet, Text, View} from "react-native";
import {useEffect, useMemo, useState} from "react";
import theme from "@/shared/styles/theme";
import VerticalCarousel, {GAP_BETWEEN_ITEMS, ITEM_HEIGHT} from "@/components/VerticalCarousel";

interface DatePickerProps {
    defaultValue?: Date;
    onChange: (value: Date) => void;
}

const years = Array.from({length: 100}, (_, i) => new Date().getFullYear() - 50 + i);
const months = Array.from({length: 12}, (_, i) => i + 1);

export default function DatePicker(props: DatePickerProps) {
    const initialDate = useMemo(() => props.defaultValue ?? new Date(), [props.defaultValue]);
    const [selectedYear, setSelectedYear] = useState<number>(initialDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(initialDate.getMonth() + 1);


    useEffect(() => {
        if (!props.defaultValue) return;
        setSelectedYear(props.defaultValue.getFullYear());
        setSelectedMonth(props.defaultValue.getMonth() + 1);
    }, [props.defaultValue]);

    const handleYearChange = (index: number) => {
        setSelectedYear(years[index]);
        props.onChange(new Date(years[index], selectedMonth - 1));
    }

    const handleMonthChange = (index: number) => {
        setSelectedMonth(months[index]);
        props.onChange(new Date(selectedYear, months[index] - 1));
    }

    return (
        <View style={styles.container}>
            {/* Year */}
            <View style={styles.carouselContainer}>
                <Text style={styles.labelText}>년</Text>
                <VerticalCarousel
                    data={years.map(String)}
                    onChange={handleYearChange}
                    defaultIndex={years.indexOf(selectedYear)}
                />
            </View>
            {/* Month */}
            <View style={styles.carouselContainer}>
                <Text style={styles.labelText}>월</Text>
                <VerticalCarousel
                    data={months.map(m => m < 10 ? `0${m}` : String(m))}
                    onChange={handleMonthChange}
                    defaultIndex={months.indexOf(selectedMonth)}
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