import theme from '@/shared/styles/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SearchIcon from "@/assets/search-icon-sm.svg";
import DeleteIcon from '@/assets/delete-x-icon.svg';
import MajorBottomModal from './MajorBottomModal';

interface MajorBadgeProps {
    skill: string;
    onDelete?: () => void;
}

const SkillBadge = (props: MajorBadgeProps) => {
    return (
        <View
            style={styles.badgeContainer}
        >
            <Text
                style={styles.badgeText}
            >
                {props.skill}
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

const MajorInput = (props: any) => {
    const {
        selectedMajors,
        updateSelectedMajors,
        placeholderText = "전공 검색"
    } = props;
    
    const [visible, setVisible] = useState<boolean>(false);

    const onClose = () => {
        setVisible(false);
    };

    const onRemoveMajor = (index: number) => {
        updateSelectedMajors((prevState: any) => {
            let newState = [...prevState];
            newState = newState.filter((_: any, i: number) => i !== index);
            return newState;
        });
    };

    const onAddMajor = (newMajor: string) => {
        updateSelectedMajors((prevState: any) => {
            let newState = [...prevState];
            newState.push(newMajor);
            return newState;
        });
    };

    return (
        <>
            <TouchableOpacity
                onPress={() => {
                    setVisible(true);
                }}
                style={{ width: '100%' }}    
            >
                <View
                    style={styles.container}
                >
                    <View style={styles.iconContainer}>
                        <SearchIcon />
                    </View>
                    {
                        (selectedMajors.length === 0) &&
                        (
                            <Text
                                style={styles.placeholder}
                                onPress={() => setVisible(true)}
                            >
                                {placeholderText}
                            </Text>
                        )
                    }
                    {
                        (selectedMajors.length > 0) &&
                        selectedMajors.map((major: string, index: number) => {
                            return (
                                <SkillBadge
                                    key={index + major}
                                    skill={major}
                                    onDelete={() => onRemoveMajor(index)}
                                />
                            );
                        })
                    }
                </View>
            </TouchableOpacity>
            <MajorBottomModal
                handleMajorSelect={(major) => {
                    if (selectedMajors.includes(major)) {
                        onRemoveMajor(selectedMajors.indexOf(major));
                    } else {
                        if (selectedMajors.length < 2) {
                            onAddMajor(major);
                        }
                    }
                }}
                visible={visible}
                onClose={onClose}
                selectedMajors={selectedMajors}
                style={{ width: '100%' }}
            />
        </>
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
    iconContainer : {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        paddingRight: 4
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
    }
});

export default MajorInput;