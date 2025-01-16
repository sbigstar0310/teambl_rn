import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import Teambl from "@/assets/teambl.svg";
import MessageIcon from "@/assets/header/MessageIcon.svg";
import NotiIcon from "@/assets/header/NotiIcon.svg";
import SettingIcon from "@/assets/header/SettingIcon.svg";
import { SafeAreaView } from "react-native-safe-area-context";

const Header: React.FC = () => {
  return (
    <SafeAreaView edges={["top"]}>
      <View style={styles.headerContainer}>
        {/* Left-aligned Icon */}
        <TouchableOpacity onPress={() => router.push("/home")}>
          <Teambl width={94} height={39} />
        </TouchableOpacity>

        {/* Right-aligned Icons */}
        <View style={styles.rightIconsContainer}>
          <TouchableOpacity onPress={() => router.push("/conversations")}>
            <MessageIcon width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/notification")}>
            <NotiIcon width={18} height={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <SettingIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "#fff",
  },
  rightIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});

export default Header;
