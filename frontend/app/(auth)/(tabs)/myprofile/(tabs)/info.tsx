import DegreeBottomModal from '@/components/DegreeBottomModal';
import theme from '@/shared/styles/theme';
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

const MyProfileInfoView = () => {

    const [isSkillModalVisible, setIsSkillModalVisible] = React.useState(false);

    return (
        <ScrollView
            style={styles.container}
        >
            <View
                style={styles.innerContainer}
            >
                <Text
                    onPress={() => {
                        setIsSkillModalVisible(true);
                    }}
                >
                    Info!
                </Text>
               <DegreeBottomModal
                    visible={isSkillModalVisible}
                    onClose={() => {
                        setIsSkillModalVisible(false);
                    }}
                    handleDegreeSelect={() => {}}
                    selectedDegree={"학사"}
                    heightPercentage={0.3}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container : {
        flex: 1,
        backgroundColor: theme.colors.achromatic05,
        paddingTop: 6
    },
    innerContainer: {
        flex: 1,
        backgroundColor: theme.colors.white,
        paddingTop: 15,
        paddingBottom: 50,
        paddingHorizontal: 15
    },
});

export default MyProfileInfoView;