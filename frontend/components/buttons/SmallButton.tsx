import theme from '@/shared/styles/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

const SmallButton = (props: any) => {
    const {
        text,
        onClickCallback,
        isActive=true,
        isLoading,
        type="point"
    } = props;

    if (type === "disabled") {
        return (
            <TouchableOpacity
                style={[
                    styles.disabledButton,
                ]}
                onPress={async () => await onClickCallback()}
                disabled={!isActive || isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator
                        color={
                            theme.colors.white
                        }
                        style={styles.loader}
                    />
                ) : (
                    <Text
                        style={
                            styles.pointText
                        }
                    >
                        {text}
                    </Text>
                )}
            </TouchableOpacity>
        );
    }
    return (
        <TouchableOpacity
            style={[
                (type === "point") ? styles.pointButton : styles.secondaryButton,
            ]}
            onPress={async () => await onClickCallback()}
            disabled={!isActive || isLoading}
        >
            {isLoading ? (
                <ActivityIndicator
                    color={
                        type === "point" ? theme.colors.white : theme.colors.black
                    }
                    style={styles.loader}
                />
            ) : (
                <Text
                    style={
                        type === "point" ? styles.pointText : styles.secondaryText
                    }
                >
                    {text}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    pointButton: {
        flex: 1,
        height: 32,
        borderRadius: 5,
        backgroundColor: theme.colors.point,
        justifyContent: "center",
        alignItems: "center",
    },
    secondaryButton: {
        flex: 1,
        height: 32,
        borderRadius: 5,
        backgroundColor: theme.colors.achromatic05,
        justifyContent: "center",
        alignItems: "center",
    },
    disabledButton : {
        flex: 1,
        height: 32,
        borderRadius: 5,
        backgroundColor: theme.colors.achromatic03,
        justifyContent: "center",
        alignItems: "center",  
    },
    pointText: {
        color: theme.colors.white,
        fontSize: theme.fontSizes.body2,
        fontWeight: "600"
    },
    secondaryText: {
        color: theme.colors.black,
        fontSize: theme.fontSizes.body2,
        fontWeight: "600"
    },
    loader: {
        width: 20,
        height: 20,
    },
});

export default SmallButton;