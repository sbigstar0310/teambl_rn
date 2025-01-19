import theme from '@/shared/styles/theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import DeleteIcon from '@/assets/delete-x-icon.svg';

const KeywordBadge = (props: any) => {

    const {
        keyword,
        isFixed,
        value,
        onChange,
        onDelete,
        handleAddKeyword
    } = props;

    if (isFixed) {
        return (
            <View
                style={styles.badgeContainer}
            >
                <Text
                    style={styles.badgeText}
                >
                    {keyword}
                </Text>
                <TouchableOpacity
                    onPress={onDelete}
                >
                    <DeleteIcon />
                </TouchableOpacity>
            </View>
        );
    } else {
        /** adding new one */
        return (
            <View
                style={[styles.badgeContainer]}
            >
                <TextInput
                    style={[styles.badgeTextInput]}
                    value={value}
                    onChangeText={onChange}
                    onSubmitEditing={handleAddKeyword}
                    onBlur={handleAddKeyword}
                    placeholder='새 관심사를 입력해주세요'
                    placeholderTextColor={theme.colors.achromatic04}
                />
            </View>
        );
    }
};

const KeywordInput = (props: any) => {

    const {
        currentKeyworldList,
        setCurrentKeywordList,
        placeholderText = "본인을 나타내는 관심사를 입력해보세요",
        maxNumber = 5
    } = props;

    const [newKeyword, setNewKeyword] = useState("");
    const [isKeywordInputOnFocus, setIsKeywordInputOnFocus] = useState(false);

    const handleOnFocus = () => {
        setIsKeywordInputOnFocus(true);
    };

    const handleAddKeyword = () => {
        if (newKeyword.trim()) {
            setCurrentKeywordList((prevState: any) => [...prevState, newKeyword.trim()]);
            setNewKeyword("");
        }
    };

    const deleteKeyword = (index: number) => {
        setCurrentKeywordList((prevState: any) => {
            let newState = [...prevState];
            newState.splice(index, 1);
            return newState;
        });
    }

    useEffect(() => {
        if (currentKeyworldList.length === 0) {
            setIsKeywordInputOnFocus(false);
        } else {
            setIsKeywordInputOnFocus(true);
        }
    }, [currentKeyworldList]);

    return (
        <View
            style={styles.container}
        >
            {
                (currentKeyworldList.length === 0) &&
                (!isKeywordInputOnFocus) &&
                (
                    <Text
                        style={styles.placeholder}
                        onPress={handleOnFocus}
                    >
                        {placeholderText}
                    </Text>
                )
            }
            {
                (currentKeyworldList.length > 0) &&
                currentKeyworldList.map((keyword: string, index: number) => {
                    return (
                        <KeywordBadge
                            key={index + keyword}
                            keyword={keyword}
                            isFixed={true}
                            onDelete={() => deleteKeyword(index)}
                        />
                    );
                })
            }
            {
                (currentKeyworldList.length < maxNumber) &&
                (isKeywordInputOnFocus) &&
                <KeywordBadge
                    keyword={newKeyword}
                    isFixed={false}
                    value={newKeyword}
                    onChange={setNewKeyword}
                    handleAddKeyword={handleAddKeyword}
                />
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'flex-start',
        minHeight: 40,
        backgroundColor: theme.colors.achromatic05,
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        gap: 8
    },
    placeholder: {
        color: theme.colors.achromatic03,
        fontSize: theme.fontSizes.body1,
        fontWeight: '400',
        padding: 0,
        margin: 0
    },
    badgeContainer: {
        backgroundColor: theme.colors.white,
        borderRadius: 5,
        paddingVertical: 4,
        paddingHorizontal: 8,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    badgeText: {
        fontSize: theme.fontSizes.body2,
        fontWeight: '400',
        color: theme.colors.black,
        marginRight: 10
    },
    badgeTextInput: {
        fontSize: theme.fontSizes.body2,
        fontWeight: '400',
        color: theme.colors.black,
        width: 'auto',
        padding: 0,
        margin: 0,
    },
    plusButtonContainer: {
        width: 16,
        height: 16,
        borderRadius: 2,
        borderWidth: 2,
        borderColor: theme.colors.point,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.white
    }
});

export default KeywordInput;