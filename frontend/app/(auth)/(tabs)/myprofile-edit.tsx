import ScreenHeader from '@/components/common/ScreenHeader';
import CustomTextInput from '@/components/CustomTextInput';
import DegreeBottomModal from '@/components/DegreeBottomModal';
import MajorInput from '@/components/MajorInput';
import PrimeButton from '@/components/PrimeButton';
import theme from '@/shared/styles/theme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MyProfileEditView = () => {

    const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false);

    const [isAcaDegreeModalVisible, setIsAcaDegreeModalVisible] = useState<boolean>(false);

    const [name, setName] = useState<string>("성이름");
    const [school, setSchool] = useState<string>("카이스트");
    const [academicDegree, setAcademicDegree] = useState<string>("학사");
    const [year, setYear] = useState<number>(2025);
    const [currentMajorList, setCurrentMajorList] = useState<string[]>([]);

    /** TODO : backend */
    const saveInfo = async () => {
        setIsSaveLoading(true);
        setTimeout(() => {
            setIsSaveLoading(false);
        }, 1000);
    };

    return (
        <View style={[styles.container]}>
            <ScreenHeader
                title="프로필 수정"
                onBack={router.navigate.bind(null, "/myprofile/info")}
            />
            <ScrollView
                style={styles.contentContainer}
            >
                {/** Name */}
                <View style={styles.fieldTitleContainer}>
                    <Text
                        style={styles.fieldTitle}
                    >
                        {"이름"}
                    </Text>
                </View>
                <CustomTextInput
                    placeholderText="이름을 입력해주세요"
                    value={name}
                    setValue={setName}
                />
                {/** School */}
                <View style={[styles.fieldTitleContainer, { marginTop: 20 }]}>
                    <Text
                        style={styles.fieldTitle}
                    >
                        {"학교"}
                    </Text>
                </View>
                <CustomTextInput
                    placeholderText="학교를 입력해주세요"
                    value={school}
                    setValue={setSchool}
                />
                {/** Academic Degree */}
                <View style={[styles.fieldTitleContainer, { marginTop: 20 }]}>
                    <Text
                        style={styles.fieldTitle}
                    >
                        {"재학 과정"}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        setIsAcaDegreeModalVisible(true);
                    }}
                >
                    <View style={styles.textView}>
                        <Text style={styles.textViewContent}>
                            {academicDegree}
                        </Text>
                    </View>
                </TouchableOpacity>
                <DegreeBottomModal
                    handleDegreeSelect={(degree: string) => {
                        setAcademicDegree(degree);
                    }}
                    selectedDegree={academicDegree}
                    visible={isAcaDegreeModalVisible}
                    onClose={() => setIsAcaDegreeModalVisible(false)}
                />
                {/** Year */}
                <View style={[styles.fieldTitleContainer, { marginTop: 20 }]}>
                    <Text
                        style={styles.fieldTitle}
                    >
                        {"입학년도"}
                    </Text>
                </View>
                <CustomTextInput
                    placeholderText="입학년도를 입력해주세요 (e.g. 2025)"
                    value={year}
                    setValue={setYear}
                    type="number"
                    maxLength={4}
                    onChangeHandler={
                        (text: any) => {
                            if (text === "") {
                                setYear(-999);
                                return;
                            }
                            const numericText = text.replace(/[^0-9]/g, '');
                            setYear(parseInt(numericText));
                        }
                    }
                />
                {/** Major */}
                <View style={[styles.fieldTitleContainer, { marginTop: 20 }]}>
                    <Text
                        style={styles.fieldTitle}
                    >
                        {"전공"}
                    </Text>
                    <Text
                        style={styles.fieldSubTitle}
                    >
                        {"최대 2개까지 입력 가능"}
                    </Text>
                </View>
                <MajorInput
                    selectedMajors={currentMajorList}
                    updateSelectedMajors={setCurrentMajorList}
                />
                {/** save button */}
                <PrimeButton
                    text={"저장"}
                    onClickCallback={saveInfo}
                    isActive={true}
                    isLoading={isSaveLoading}
                    styleOv={{marginTop: 32}}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.white,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: theme.colors.white,
        paddingHorizontal: 20,
        paddingVertical: 30
    },
    fieldTitleContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingBottom: 12
    },
    fieldTitle: {
        fontSize: theme.fontSizes.subtitle,
        fontWeight: 600,
        color: theme.colors.black,
        marginRight: 12
    },
    fieldSubTitle: {
        fontSize: theme.fontSizes.body2,
        fontWeight: 400,
        color: theme.colors.achromatic01
    },
    textView : {
        width: '100%',
        backgroundColor: theme.colors.achromatic05,
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 12
    },
    textViewContent : {
        fontSize: theme.fontSizes.body1
    }
});

export default MyProfileEditView;