import theme from '@/shared/styles/theme';
import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

const CustomTextInput = (props: any) => {

    const {
        value,
        setValue,
        placeholderText="내용을 입력해주세요",
        readOnly=false,
        type="text",
        maxLength=100,
        onChangeHandler
    } = props;

    if (type === "text") {
        return (
            <TextInput
                style={styles.textInput}
                placeholder={placeholderText}
                value={value}
                onChangeText={setValue}
                placeholderTextColor={theme.colors.achromatic03}
                readOnly={readOnly}
            />
        );
    } else if (type === "number") { 
        return (
            <TextInput
                style={styles.textInput}
                placeholder={placeholderText}
                value={`${value > 0 ? value : ""}`}
                onChangeText={onChangeHandler}
                placeholderTextColor={theme.colors.achromatic03}
                readOnly={readOnly}
                keyboardType="numeric"
                maxLength={maxLength}
            />
        );
    }
};

const styles = StyleSheet.create({
    textInput : {
        width: '100%',
        fontSize: theme.fontSizes.body1,
        backgroundColor: theme.colors.achromatic05,
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 10,
        height: 40,
    }
});

export default CustomTextInput;