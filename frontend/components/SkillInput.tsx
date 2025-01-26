import theme from '@/shared/styles/theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SearchIcon from "@/assets/search-icon-sm.svg";
import DeleteIcon from '@/assets/delete-x-icon.svg';
import SkillInputBottomModal from './SkillInputBottomModal';

interface SkillBadgeProps {
    skill: string;
    onDelete?: () => void;
}

const SkillBadge = (props: SkillBadgeProps) => {
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
  
const SkillInput = (props: any) => {
    const {
        selectedSkills,
        updateSelectedSkills,
        placeholderText = "스킬 검색"
    } = props;

    const [visible, setVisible] = useState(false);

    const onClose = () => {
        setVisible(false);
    };

    const onRemoveSkill = (index: number) => {
        updateSelectedSkills((prevState: any) => {
            let newState = [...prevState];
            newState = newState.filter((_: any, i: number) => i !== index);
            return newState;
        });
    };

    const onConfirm = (newSkillList: any) => {
        updateSelectedSkills(newSkillList);
        onClose();
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
                        (selectedSkills.length === 0) &&
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
                        (selectedSkills.length > 0) &&
                        selectedSkills.map((skill: any, index: number) => {
                            return (
                                <SkillBadge
                                    key={index + skill.id}
                                    skill={skill.name}
                                    onDelete={() => onRemoveSkill(index)}
                                />
                            );
                        })
                    }
                </View>
            </TouchableOpacity>
            <SkillInputBottomModal
                visible={visible}
                onClose={onClose}
                onConfirm={onConfirm}
                selectedSkills={selectedSkills}
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

export default SkillInput;