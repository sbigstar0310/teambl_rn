import theme from '@/shared/styles/theme';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import DeleteIcon from '@/assets/delete-x-icon.svg';

interface KeywordInputProps {
    currentKeywordList: string[];
    onAdd?: (keyword: string) => void;
    onRemove?: (index: number) => void;
    placeholderText?: string;
    maxNumber?: number;
    icon?: React.ReactNode;
}

const KeywordInput = (props: KeywordInputProps) => {
    const {
        currentKeywordList,
        onAdd,
        onRemove,
        placeholderText = "본인을 나타내는 관심사를 입력해보세요",
        maxNumber = 5,
        icon
    } = props;

    const [isKeywordInputOnFocus, setIsKeywordInputOnFocus] = useState(false);

    const handleOnFocus = () => {
        if (onAdd) setIsKeywordInputOnFocus(true);
    };

    const handleAddKeyword = (newKeyword: string) => {
        if (newKeyword.trim() && onAdd) {
            onAdd(newKeyword.trim());
        }
    };

    useEffect(() => {
        if (currentKeywordList.length === 0) {
            setIsKeywordInputOnFocus(false);
        } else {
            setIsKeywordInputOnFocus(true);
        }
    }, [currentKeywordList]);

    return (
        <View style={styles.container}>
            {icon && icon}
            {
                (currentKeywordList.length === 0) &&
                (!isKeywordInputOnFocus) &&
                (
                    <Text
                        style={styles.placeholder}
                        onPress={onAdd && handleOnFocus}
                    >
                        {placeholderText}
                    </Text>
                )
            }
            {
                (currentKeywordList.length > 0) &&
                currentKeywordList.map((keyword: string, index: number) => {
                    return (
                        <KeywordBadge
                            key={index + keyword}
                            keyword={keyword}
                            onDelete={onRemove?.bind(null, index)}
                        />
                    );
                })
            }
            {
                onAdd &&
                (currentKeywordList.length < maxNumber) &&
                (isKeywordInputOnFocus) &&
                <NewKeyboardInput
                    onSubmit={handleAddKeyword}
                />
            }
        </View>
    );
};

interface KeywordBadgeProps {
    keyword: string;
    onDelete?: () => void;
}

const KeywordBadge = (props: KeywordBadgeProps) => {
    return (
        <View
            style={styles.badgeContainer}
        >
            <Text
                style={styles.badgeText}
            >
                {props.keyword}
            </Text>
            {props.onDelete &&
                <TouchableOpacity
                    onPress={props.onDelete}
                >
                    <DeleteIcon/>
                </TouchableOpacity>
            }
        </View>
    );
};

interface NewKeyboardInputProps {
    onSubmit: (newKeyword: string) => void;
}

const NewKeyboardInput = (props: NewKeyboardInputProps) => {
    const [keyword, setKeyword] = useState<string>("");

    const handleSubmit = () => {
        props.onSubmit(keyword);
        setKeyword("");
    };

    return (
        <View
            style={[styles.badgeContainer]}
        >
            <TextInput
                style={[styles.badgeTextInput]}
                value={keyword}
                onChangeText={setKeyword}
                onSubmitEditing={handleSubmit}
                onBlur={handleSubmit}
                placeholder='새 관심사를 입력해주세요'
                placeholderTextColor={theme.colors.achromatic04}
            />
        </View>
    );
}

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
        gap: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    badgeText: {
        fontSize: theme.fontSizes.body2,
        fontWeight: '400',
        color: theme.colors.black
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