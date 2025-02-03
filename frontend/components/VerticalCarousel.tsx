import {
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from "react-native";
import theme from "@/shared/styles/theme";
import {PureComponent, useCallback, useEffect, useMemo, useRef} from "react";

interface VerticalCarouselProps<T> {
    getPrevItem: (currentItem: T) => T | null;
    getNextItem: (currentItem: T) => T | null;
    selectedItem: T;
    onChange: (item: T) => void;
}

export const ITEM_HEIGHT = 24;
export const GAP_BETWEEN_ITEMS = 12;

export default function VerticalCarousel<T>(props: VerticalCarouselProps<T>) {
    const listRef = useRef<FlatList>(null);
    const data = useMemo(() => {
        const result = []
        const currentItem = props.selectedItem;
        const prevItem = props.getPrevItem(currentItem);
        if (prevItem !== null) {
            const prevPrevItem = props.getPrevItem(prevItem);
            result.push(prevPrevItem);
        } else {
            result.push(null);
        }
        result.push(prevItem);
        result.push(currentItem);
        const nextItem = props.getNextItem(currentItem);
        result.push(nextItem);
        if (nextItem !== null) {
            const nextNextItem = props.getNextItem(nextItem);
            result.push(nextNextItem);
        } else {
            result.push(null);
        }
        return result;
    }, [props.getPrevItem, props.getNextItem, props.selectedItem]);

    useEffect(() => {
        listRef.current?.scrollToIndex({index: 1, animated: false});
    }, [listRef]);

    const snapToOffsets = useMemo(() => data.map(
            (_, i) => i * (ITEM_HEIGHT + GAP_BETWEEN_ITEMS)
        ),
        [data]
    )

    const getPage = (offset: number) => Math.round(offset / (ITEM_HEIGHT + GAP_BETWEEN_ITEMS)) + 1;

    const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const page = getPage(e.nativeEvent.contentOffset.y);
        const newSelectedItem = data[page];
        if (newSelectedItem && page !== 2) {
            props.onChange(newSelectedItem);
            listRef.current?.scrollToIndex({index: 1, animated: false});
        }
    }, [data, props.selectedItem]);

    return (
        <FlatList
            ref={listRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            pagingEnabled={true}
            snapToOffsets={snapToOffsets}
            onScroll={handleScroll}
            data={data}
            initialNumToRender={3}
            getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: (ITEM_HEIGHT + GAP_BETWEEN_ITEMS) * index,
                index
            })}
            renderItem={({item, index}) =>
                item === null ? <View style={styles.placeholderItem}/> :
                    <CarouselItem
                        label={item.toString()}
                        isActive={index === 2}
                    />
            }
        />
    );
}

interface CarouselItemProps {
    label: string,
    isActive: boolean
}

class CarouselItem extends PureComponent {
    constructor(public props: CarouselItemProps) {
        super(props);
    }

    render() {
        return (
            <TouchableWithoutFeedback>
                <Text style={[styles.carouselItem, this.props.isActive && styles.carouselItemLabelActive]}>
                    {this.props.label}
                </Text>
            </TouchableWithoutFeedback>
        )
    }
}

const styles = StyleSheet.create({
    listContainer: {
        alignItems: "center",
        gap: GAP_BETWEEN_ITEMS,
        paddingVertical: GAP_BETWEEN_ITEMS / 2
    },
    placeholderItem: {
        height: ITEM_HEIGHT
    },
    carouselItem: {
        height: ITEM_HEIGHT,
        fontSize: 20,
        color: theme.colors.achromatic04
    },
    carouselItemLabelActive: {
        color: theme.colors.black
    }
})