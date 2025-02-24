import theme from "@/shared/styles/theme";
import React, { useRef, useState } from "react";
import {
    FlatList,
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
} from "react-native";
import DottedLine from "@/assets/DottedLine.svg";
import ALine from "@/assets/ALine.svg";

const ITEM_HEIGHT = 30;

const RelationShipBridgeView = (props: any) => {
    const { startName, endName, relationShipList, distance, isLoading } = props;

    console.log("relationShipList", relationShipList);

    const scrollY = useRef(new Animated.Value(0)).current;

    const renderItem = ({ item, index }: any) => {
        const inputRange = [
            (index - 1) * ITEM_HEIGHT,
            index * ITEM_HEIGHT,
            (index + 1) * ITEM_HEIGHT,
        ];

        const opacity = scrollY.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
        });

        if (distance === 2) {
            return (
                <Animated.View style={[styles.snapItem, { opacity }]}>
                    <Text style={styles.itemText}>{item}</Text>
                </Animated.View>
            );
        } else if (distance === 3) {
            return (
                <Animated.View style={[styles.snapItem, { opacity }]}>
                    <View style={styles.doubleItemContainer}>
                        <Text style={styles.doubleItemText}>{item[0]}</Text>
                        <ALine />
                        <Text style={styles.doubleItemText}>{item[1]}</Text>
                    </View>
                </Animated.View>
            );
        }
        return null;
    };

    return (
        <View style={styles.container}>
            {(distance === 2 || distance === 3) && (
                <View style={styles.messageContainer}>
                    <Text style={styles.withBold}>{startName}</Text>
                    <Text>{"님과 "}</Text>
                    <Text style={styles.withBold}>{endName}</Text>
                    <Text>{"님은 "}</Text>
                    <Text style={styles.withPointColor}>
                        {`${distance - 1}명`}
                    </Text>
                    <Text>{"을 거치면 아는 사이입니다."}</Text>
                </View>
            )}
            {distance >= 4 && (
                <View style={styles.messageContainer}>
                    <Text style={styles.withPointColor}>{`3명 이상`}</Text>
                    <Text>
                        {"을 거쳐햐 하므로 관계도를 표시하지 않습니다."}
                    </Text>
                </View>
            )}
            <View style={styles.bridgeContainer}>
                <View style={styles.endPointContainer}>
                    <Text
                        style={[styles.endPointName, { marginRight: 12 }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {startName}
                    </Text>
                    <DottedLine />
                </View>
                <View style={styles.scrollAreaContainer}>
                    <View style={styles.scrollCenter} />
                    {(distance === 2 || distance === 3) && (
                        <Animated.FlatList
                            data={relationShipList}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={ITEM_HEIGHT}
                            snapToAlignment="start"
                            decelerationRate="fast"
                            onScroll={Animated.event(
                                [
                                    {
                                        nativeEvent: {
                                            contentOffset: { y: scrollY },
                                        },
                                    },
                                ],
                                { useNativeDriver: true }
                            )}
                            contentContainerStyle={{
                                paddingTop: (90 - ITEM_HEIGHT) / 2,
                                paddingBottom: (90 - ITEM_HEIGHT) / 2,
                            }}
                            style={{ height: 90 }}
                        />
                    )}
                    {distance >= 4 && (
                        <Text style={styles.questionMark}>{"?"}</Text>
                    )}
                </View>
                <View style={styles.endPointContainer}>
                    <DottedLine />
                    <Text style={[styles.endPointName, { marginLeft: 12 }]}>
                        {endName}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 5,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundColor: theme.colors.achromatic05,
    },
    messageContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        fontSize: theme.fontSizes.body2,
        color: theme.colors.black,
        fontWeight: 400,
    },
    bridgeContainer: {
        width: "100%",
        height: 90,
        padding: 0,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },
    endPointContainer: {
        height: 90,
        maxWidth: "30%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    endPointName: {
        fontSize: theme.fontSizes.body2,
        fontWeight: 600,
        color: theme.colors.black,
    },
    scrollAreaContainer: {
        height: 90,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    scrollCenter: {
        position: "absolute",
        width: "100%",
        backgroundColor: theme.colors.white,
        height: 30,
        borderRadius: 17,
    },
    withBold: {
        fontWeight: 600,
    },
    withPointColor: {
        color: theme.colors.point,
    },
    snapItem: {
        height: ITEM_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 22,
    },
    itemText: {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.point,
        fontWeight: 600,
        paddingHorizontal: 20,
    },
    doubleItemContainer: {
        height: 30,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        padding: 0,
    },
    doubleItemText: {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.point,
        fontWeight: 600,
    },
    questionMark: {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.black,
        fontWeight: 600,
        paddingHorizontal: 60,
    },
});

export default RelationShipBridgeView;
