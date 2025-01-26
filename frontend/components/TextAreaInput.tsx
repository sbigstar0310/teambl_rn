import theme from '@/shared/styles/theme';
import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

const TextAreaInput = (props: any) => {

    const {
        value,
        setValue,
        placeholderText="내용을 입력해주세요",
        heigth=100,
    } = props;

    return (
        <TextInput
            style={styles.textInput}
            placeholder={placeholderText}
            value={value}
            onChangeText={setValue}
            placeholderTextColor={theme.colors.achromatic03}
            multiline
            textAlignVertical="top"
        />
    );
};

const styles = StyleSheet.create({
    textInput : {
        width: '100%',
        fontSize: theme.fontSizes.body1,
        backgroundColor: theme.colors.achromatic05,
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 16,
        gap: 8,
        height: 215
    }
});

export default TextAreaInput;