import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useState } from "react";
import TextField from "@/components/TextField";
import UserCard from "@/components/search/UserCard";
import PrimeButton from "@/components/PrimeButton";
import { mockUser1 } from "@/shared/mock-data";
import SearchIcon from "@/assets/bottomtab/SearchIcon.svg";
import searchUserByName from "@/libs/apis/Search/searchUserByName";

interface SearchUsersWidgetProps {
    onConfirm: (user: api.User) => void;
}

export default function SearchUsersWidget(props: SearchUsersWidgetProps) {
    const [query, setQuery] = useState<string>("");
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [results, setResults] = useState<api.UserSearchResult[]>([]);

    const updateResults = async (text: string) => {
        const newResults: api.UserSearchResult[] = await searchUserByName({
            user_name: query,
        });

        setResults(newResults);
    };

    const handleQueryInput = (text: string) => {
        setQuery(text);
        if (text.length === 0) setResults([]);
        else updateResults(text);
    };

    const handleSelect = (index: number) => {
        if (selectedIndex === index) setSelectedIndex(null);
        else setSelectedIndex(index);
    };

    const handleConfirm = async () => {
        if (selectedIndex !== null)
            props.onConfirm(results[selectedIndex].user);
        setQuery("");
        setResults([]);
        setSelectedIndex(null);
    };

    return (
        <View style={styles.container}>
            {/*Title*/}
            <Text style={styles.title}>사람 태그</Text>
            {/*Search input*/}
            <TextField
                placeholder="사람 검색"
                value={query}
                onChangeText={handleQueryInput}
                icon={<SearchIcon width={15} height={15} />}
            />
            {/*Results*/}
            <FlatList
                style={styles.list}
                data={results}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item, index }) => (
                    <TouchableOpacity onPress={handleSelect.bind(null, index)}>
                        <UserCard
                            is_new_user={item.is_new_user}
                            relation_degree={item.relation_degree}
                            user={item.user}
                            is_selected={index === selectedIndex}
                        />
                    </TouchableOpacity>
                )}
            />
            {/*Confirm button*/}
            <PrimeButton
                text="선택 완료"
                onClickCallback={handleConfirm}
                isActive={selectedIndex !== null}
                isLoading={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 12,
    },
    list: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 500,
    },
});
