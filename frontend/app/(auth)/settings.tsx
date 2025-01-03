import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Stack } from 'expo-router'; // Import Stack for Screen options
import TitleAndContentToggle from '../../components/TitleAndContentToggle';
import PasswordChange from '../../components/PasswordChange';
import InquirySend from '../../components/InquirySend';
import DeleteUser from '../../components/DeleteUser';
import PolicyView from '../../components/PolicyView';

const Setting: React.FC = () => {
  const navigation = useNavigation();

  /** go back handler */
  const handleBackButton = () => {
    navigation.goBack();
  };

  return (
    <>
      {/* Stack Screen to hide the header */}
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.body}>
        <View style={styles.container}>
          {/* Backward button */}
          <View style={styles.backButtonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
              <Image source={require('../../assets/left-arrow.png')} style={styles.backIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>설정</Text>

        <View style={[styles.container, styles.marginTop22]}>
          <TitleAndContentToggle title="비밀번호 변경">
            <PasswordChange />
          </TitleAndContentToggle>
          <View style={styles.transBorder} />
          <TitleAndContentToggle title="문의하기">
            <InquirySend />
          </TitleAndContentToggle>
          <View style={styles.transBorder} />
          <TitleAndContentToggle title="회원 탈퇴">
            <DeleteUser />
          </TitleAndContentToggle>
          <View style={styles.transBorder} />
          <TitleAndContentToggle title="약관 및 정책">
            <PolicyView />
          </TitleAndContentToggle>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  body: {
    margin: 0,
    padding: 20,
    backgroundColor: '#ffffff',
    width: '100%',
  },
  container: {
    width: '100%',
    margin: 0,
    padding: 0,
  },
  backButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  backButton: {
    width: 20,
    backgroundColor: 'transparent',
  },
  backIcon: {
    width: 20,
    height: 16,
  },
  title: {
    width: '100%',
    textAlign: 'left',
    marginTop: 20,
    color: '#121212',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.38,
  },
  marginTop22: {
    marginTop: 22,
  },
  transBorder: {
    width: '100%',
    height: 16,
    backgroundColor: 'none',
  },
});

export default Setting;
