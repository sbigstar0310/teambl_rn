import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import Teambl from "@/assets/teambl.svg";
import MessageIcon from "@/assets/header/MessageIcon.svg";
import NotiIcon from "@/assets/header/NotiIcon.svg";
import SettingIcon from "@/assets/header/SettingIcon.svg";
import FriendsIcon from "@/assets/header/FriendsIcon.svg";
import { SafeAreaView } from "react-native-safe-area-context";
import unreadNotificationCount from "@/libs/apis/Notification/unreadNotificationCount";

const Header: React.FC = () => {
  const [unreadNotifications, setUnreadNotifications] = useState(0); // 읽지 않은 알림 수

  useEffect(() => {
      fetchUnreadNotifications();
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
        const count = await unreadNotificationCount();
        setUnreadNotifications(count.unread_count);
        console.log("unread notification count:", count);
    } catch (error) {
        console.error("Failed to fetch unread notifications:", error);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#fff" }} edges={["top"]}>
      <View style={styles.headerContainer}>
        {/* Left-aligned Icon */}
        <TouchableOpacity onPress={() => router.push("/home")}>
          <Teambl width={94} height={39} />
        </TouchableOpacity>

        {/* Right-aligned Icons */}
        <View style={styles.rightIconsContainer}>
          <TouchableOpacity onPress={() => router.push("/myfriends")}>
            <FriendsIcon/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/conversations")}>
            <MessageIcon/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/notification")} style={styles.notiContainer}>
            <NotiIcon/>
            {unreadNotifications > 0 && (
              <View style={unreadNotifications<100 ? styles.badge : styles.longbadge}>
                <Text style={styles.badgeText}>
                  {unreadNotifications<100 ? unreadNotifications : "99+"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => router.push("/settings")}>
            <SettingIcon width={24} height={24} />
          </TouchableOpacity> */}
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
  notiContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -3,
    backgroundColor: "#B80000",
    borderRadius: 25,
    width: 15,
    height: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  longbadge: {
    position: "absolute",
    top: -4,
    right: -9,
    backgroundColor: "#B80000",
    borderRadius: 25,
    width: 21,
    height: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontFamily: "PretendardRegular",
    fontSize: 10,
    color: "#ffffff",
  },
});

export default Header;
