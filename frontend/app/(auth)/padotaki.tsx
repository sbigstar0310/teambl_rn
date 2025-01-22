import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import LeftArrowIcon from "@/assets/search/LeftArrowIcon.svg";
import SearchIcon from "@/assets/padotaki/SearchIcon.svg";
import DefaultProfile from "@/assets/DefaultProfile.svg";
import { useSearchParams } from "expo-router/build/hooks";
import PostCard from "@/components/cards/PostCard";
import { mockPost1, mockPost2 } from "@/shared/mock-data";

const mockPosts = [mockPost1, mockPost2];
const mockUsers = [
  { id: 1, name: "이기동", profileImage: "" },
  { id: 2, name: "김철수", profileImage: "" },
];

type HeaderProps = {
  onBackPress: () => void;
  onSearchPress: () => void;
};

const Header: React.FC<HeaderProps> = ({ onBackPress, onSearchPress }) => (
  <View style={styles.header}>
    <View style={styles.titleContainer}>
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <LeftArrowIcon width={20} height={16} />
      </TouchableOpacity>
      <Text style={styles.title}>파도타기</Text>
    </View>
    <TouchableOpacity onPress={onSearchPress}>
      <SearchIcon width={20} height={20} />
    </TouchableOpacity>
  </View>
);

type TabsProps = {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  userName: string;
};

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, userName }) => (
  <View style={styles.tabs}>
    <TouchableOpacity
      style={[styles.tab, activeTab === "projects" && styles.activeTab]}
      onPress={() => setActiveTab("projects")}
    >
      <Text style={[styles.tabText, activeTab === "projects" && styles.activeTabText]}>
        {userName} 1촌의 프로젝트
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.tab, activeTab === "connections" && styles.activeTab]}
      onPress={() => setActiveTab("connections")}
    >
      <Text style={[styles.tabText, activeTab === "connections" && styles.activeTabText]}>이어지는 프로젝트</Text>
    </TouchableOpacity>
  </View>
);

type UserRowProps = {
  item: {
    id: number;
    name: string;
    profileImage: string;
  };
};

const UserRow: React.FC<UserRowProps> = ({ item }) => (
  <TouchableOpacity
    style={styles.userRow}
    onPress={() => {
      router.push(`padotaki?userName=${item.name}&activeTab=projects`);
    }}
  >
    <View style={styles.imageContainer}>
      {item.profileImage ? (
        <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
      ) : (
        <DefaultProfile width={40} height={40} />
      )}
    </View>
    <View style={styles.contentText}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.josa}>님</Text>
      <Text style={styles.see}>{} 1촌의 프로젝트 보기</Text>
    </View>
  </TouchableOpacity>
);

const PadoTakiScreen = () => {
  const searchParams = useSearchParams();
  const userName = searchParams.get("userName") ? `${searchParams.get("userName")}님` : "내";
  const initialTab = searchParams.get("activeTab") || "projects";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [posts, setPosts] = useState<api.Post[]>([]);
  const [userList, setUserList] = useState<{ id: number; name: string; profileImage: string; }[]>([]);

  useEffect(() => {
    fetchPadoTaki();
  }, []);

  const fetchPadoTaki = () => {
    // TODO: fetch padotaki from API
    setPosts(mockPosts);
    setUserList(mockUsers);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <Header 
          onBackPress={() => router.back()} 
          onSearchPress={() => router.push("/search")} 
        />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} userName={userName} />

        <View style={styles.content}>
          {activeTab === "projects" ? (
            <FlatList
              contentContainerStyle={{ gap: 20, padding: 2 }}
              data={posts}
              renderItem={({ item, index }) => <PostCard key={index} post={item} />}
            />
          ) : (
            <FlatList
              data={userList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <UserRow item={item} />}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "#fff",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 20,
  },
  title: {
    fontFamily: "Pretendard",
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: 20,
    lineHeight: 25,
    color: "#121212",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    height: 42,
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    borderBottomWidth: 1.5,
    borderColor: "#0923A9",
  },
  tabText: {
    fontFamily: "Pretendard",
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: 16,
    lineHeight: 21,
    color: "#595959",
  },
  activeTabText: {
    color: "#0923A9",
  },
  content: {
    flex: 1,
    padding: 16,
    borderTopWidth: 4,
    borderColor: "#F5F5F5",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  imageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contentText: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontFamily: "Pretendard",
    fontStyle: "normal",
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 21,
    color: "#121212",
  },
  josa: {
    fontFamily: "Pretendard",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 21,
    color: "#121212",
  },
  see: {
    fontFamily: "Pretendard",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 21,
    color: "#2546F3",
  },
});

export default PadoTakiScreen;
