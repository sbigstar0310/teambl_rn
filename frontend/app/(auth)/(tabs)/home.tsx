import { Button, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import React from "react";
import { sharedStyles } from "@/app/_layout";
import Header from "@/components/Header";

export default function HomeScreen() {
  return (
    <>
      <Header />
      <View
        style={[
          sharedStyles.container,
          sharedStyles.contentCentered,
        ]}
      >
        <ScrollView style={{ 
          width: "100%", 
          borderTopWidth: 4,
          borderColor: '#F5F5F5',
          padding: 16,
        }}>
          <Text>Home Screen</Text>
          <Button
            title="Go to Notification"
            onPress={() => router.push("/notification")}
          />
          <Button
            title="Go to Settings"
            onPress={() => router.push("/settings")}
          />
          <Button
            title="Go to Profile"
            onPress={() => router.push("/profiles")}
          />
          <Button title="Go to Search" onPress={() => router.push("/search")} />
          <Button
            title="Go to Messages Inbox"
            onPress={() => router.push("/conversations")}
          />
          <Button
            title="Go to Login"
            onPress={() => router.push("/onboarding")}
          />
          <Button
            title="Go to Signup"
            onPress={() => router.push("/signupOnboarding")}
          />
          <Text>Home Screen</Text>
          <Button
            title="Go to Notification"
            onPress={() => router.push("/notification")}
          />
          <Button
            title="Go to Settings"
            onPress={() => router.push("/settings")}
          />
          <Button
            title="Go to Profile"
            onPress={() => router.push("/profiles")}
          />
          <Button title="Go to Search" onPress={() => router.push("/search")} />
          <Button
            title="Go to Messages Inbox"
            onPress={() => router.push("/conversations")}
          />
          <Button
            title="Go to Login"
            onPress={() => router.push("/onboarding")}
          />
          <Button
            title="Go to Signup"
            onPress={() => router.push("/signupOnboarding")}
          />
          <Text>Home Screen</Text>
          <Button
            title="Go to Notification"
            onPress={() => router.push("/notification")}
          />
          <Button
            title="Go to Settings"
            onPress={() => router.push("/settings")}
          />
          <Button
            title="Go to Profile"
            onPress={() => router.push("/profiles")}
          />
          <Button title="Go to Search" onPress={() => router.push("/search")} />
          <Button
            title="Go to Messages Inbox"
            onPress={() => router.push("/conversations")}
          />
          <Button
            title="Go to Login"
            onPress={() => router.push("/onboarding")}
          />
          <Button
            title="Go to Signup"
            onPress={() => router.push("/signupOnboarding")}
          />
          <Text>Home Screen</Text>
          <Button
            title="Go to Notification"
            onPress={() => router.push("/notification")}
          />
          <Button
            title="Go to Settings"
            onPress={() => router.push("/settings")}
          />
          <Button
            title="Go to Profile"
            onPress={() => router.push("/profiles")}
          />
          <Button title="Go to Search" onPress={() => router.push("/search")} />
          <Button
            title="Go to Messages Inbox"
            onPress={() => router.push("/conversations")}
          />
          <Button
            title="Go to Login"
            onPress={() => router.push("/onboarding")}
          />
          <Button
            title="Go to Signup"
            onPress={() => router.push("/signupOnboarding")}
          />
          <Text>Home Screen</Text>
          <Button
            title="Go to Notification"
            onPress={() => router.push("/notification")}
          />
          <Button
            title="Go to Settings"
            onPress={() => router.push("/settings")}
          />
          <Button
            title="Go to Profile"
            onPress={() => router.push("/profiles")}
          />
          <Button title="Go to Search" onPress={() => router.push("/search")} />
          <Button
            title="Go to Messages Inbox"
            onPress={() => router.push("/conversations")}
          />
          <Button
            title="Go to Login"
            onPress={() => router.push("/onboarding")}
          />
          <Button
            title="Go to Signup"
            onPress={() => router.push("/signupOnboarding")}
          />
          <Text>Home Screen</Text>
          <Button
            title="Go to Notification"
            onPress={() => router.push("/notification")}
          />
          <Button
            title="Go to Settings"
            onPress={() => router.push("/settings")}
          />
          <Button
            title="Go to Profile"
            onPress={() => router.push("/profiles")}
          />
          <Button title="Go to Search" onPress={() => router.push("/search")} />
          <Button
            title="Go to Messages Inbox"
            onPress={() => router.push("/conversations")}
          />
          <Button
            title="Go to Login"
            onPress={() => router.push("/onboarding")}
          />
          <Button
            title="Go to Signup"
            onPress={() => router.push("/signupOnboarding")}
          />
        </ScrollView>
      </View>
    </>
  );
}
