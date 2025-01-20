import {FlatList, StyleSheet, Text, View} from "react-native";
import {useMemo, useState} from "react";
import theme from "@/shared/styles/theme";

interface DatePickerProps {
    defaultValue?: Date;
    onChange: (value: Date) => void;
}

export default function DatePicker(props: DatePickerProps) {
    const [selectedYear, setSelectedYear] = useState<number>(props.defaultValue?.getFullYear() ?? new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(props.defaultValue?.getMonth() ?? new Date().getMonth());

    const years = useMemo(() => Array.from({length: 10}, (_, i) => i - 5 + selectedYear), []);
    const months = useMemo(() => Array.from({length: 12}, (_, i) => i + 1), []);

    return (
        <View style={styles.container}>
            {/* Year */}
            <View style={styles.carouselContainer}>
                <Text style={styles.labelText}>년</Text>
                <FlatList
                    style={styles.list}
                    scrollEnabled={true}
                    contentContainerStyle={styles.listContainer}
                    data={years}
                    renderItem={({item}) =>
                        <CarouselItem
                            label={item.toString()}
                            isActive={item === selectedYear}
                        />}/>
            </View>
            {/* Month */}
            <View style={styles.carouselContainer}>
                <Text style={styles.labelText}>월</Text>
                <FlatList
                    style={styles.list}
                    contentContainerStyle={styles.listContainer}
                    data={months}
                    renderItem={({item}) =>
                        <CarouselItem
                            label={item.toString()}
                            isActive={item === selectedMonth}
                        />
                    }/>
            </View>
        </View>
    )
}

interface CarouselItemProps {
    label: string,
    isActive: boolean
}

function CarouselItem(props: CarouselItemProps) {
    return (
        <Text style={[styles.carouselItemLabel, props.isActive && styles.carouselItemLabelActive]}>
            {props.label}
        </Text>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    carouselContainer: {
        height: 160,
        flex: 1
    },
    list: {
        flex: 1,
    },
    listContainer: {
        gap: 12,
        alignItems: "center"
    },
    labelText: {
        textAlign: 'center',
        color: theme.colors.achromatic01,
        fontSize: 14,
        marginVertical: 16
    },
    carouselItemLabel: {
        fontSize: 20,
        color: theme.colors.achromatic04
    },
    carouselItemLabelActive: {
        color: theme.colors.black
    }
})