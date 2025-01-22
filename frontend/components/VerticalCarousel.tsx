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
import {PureComponent, useEffect, useMemo, useRef, useState} from "react";

interface VerticalCarouselProps {
    data: string[];
    defaultIndex?: number;
    onChange: (index: number) => void;
}

export const ITEM_HEIGHT = 24;
export const GAP_BETWEEN_ITEMS = 12;

export default function VerticalCarousel(props: VerticalCarouselProps) {
    const listRef = useRef<FlatList>(null);
    const data = useMemo(() => [null, ...props.data, null], [props.data]);
    const [selectedItemIndex, setSelectedItemIndex] = useState<number>(props.defaultIndex ?? 0);

    useEffect(() => {
        if (props.defaultIndex !== undefined) {
            setSelectedItemIndex(props.defaultIndex);
            listRef.current?.scrollToIndex({index: props.defaultIndex, animated: false});
        }
    }, [props.defaultIndex]);

    const snapToOffsets = useMemo(() => data.map(
            (_, i) => i * (ITEM_HEIGHT + GAP_BETWEEN_ITEMS)
        ),
        [data]
    )

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offset = e.nativeEvent.contentOffset;
        const page = Math.round(offset.y / (ITEM_HEIGHT + GAP_BETWEEN_ITEMS));
        if (page != selectedItemIndex) {
            setSelectedItemIndex(page);
        }
        return page;
    }

    const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        props.onChange(handleScroll(e));
    }

    return (
        <FlatList
            ref={listRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            pagingEnabled={true}
            snapToOffsets={snapToOffsets}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleScrollEnd}
            data={data}
            initialNumToRender={3}
            initialScrollIndex={props.defaultIndex ?? 0}
            getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: (ITEM_HEIGHT + GAP_BETWEEN_ITEMS) * index,
                index
            })}
            renderItem={({item, index}) =>
                item === null ? <View style={styles.placeholderItem}/> :
                    <CarouselItem
                        label={item.toString()}
                        isActive={index - 1 === selectedItemIndex}
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