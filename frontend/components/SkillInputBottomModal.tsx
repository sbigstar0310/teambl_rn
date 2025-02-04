import React, { useEffect, useState } from "react";
import BottomModal from "./BottomModal";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import theme from "@/shared/styles/theme";
import SearchIcon from "@/assets/search-icon-sm.svg";
import DeleteIcon from "@/assets/delete-x-icon.svg";
import PrimeButton from "./PrimeButton";

import fetchSkills from "@/libs/apis/Skill/fetchSkills";
import searchSkill from "@/libs/apis/Skill/searchSkill";
import recommendSkill from "@/libs/apis/Skill/recommendSkill";
import addSkill from "@/libs/apis/Skill/addSkill";
import deleteSkill from "@/libs/apis/Skill/deleteSkill";

interface SkillBadgeProps {
    skill: api.Skill;
    onDelete?: () => void;
}

const dummySuggestions = [
    {
        id: 1,
        name: "Figma",
        matches: ["figma", "ux", "ui", "design", "prototype"],
    },
    {
        id: 7,
        name: "Python",
        matches: ["python", "py", "backend", "ml", "ai", "data"],
    },
    {
        id: 3,
        name: "React",
        matches: ["react", "reactjs", "frontend", "javascript", "jsx"],
    },
];

const dummySkillData = [
    {
        id: 1,
        name: "Figma",
        matches: ["figma", "ux", "ui", "design", "prototype"],
    },
    {
        id: 2,
        name: "Photoshop",
        matches: ["photoshop", "ps", "photo", "image", "design"],
    },
    {
        id: 3,
        name: "React",
        matches: ["react", "reactjs", "frontend", "javascript", "jsx"],
    },
    {
        id: 4,
        name: "C언어",
        matches: ["c언어", "c", "programming", "embedded", "system"],
    },
    {
        id: 5,
        name: "HTML/CSS",
        matches: ["html", "css", "frontend", "web", "markup"],
    },
    {
        id: 6,
        name: "JavaScript",
        matches: ["javascript", "js", "frontend", "web", "scripting"],
    },
    {
        id: 7,
        name: "Python",
        matches: ["python", "py", "backend", "ml", "ai", "data"],
    },
    {
        id: 8,
        name: "Java",
        matches: ["java", "backend", "spring", "android", "oop"],
    },
    {
        id: 9,
        name: "Node.js",
        matches: ["node", "nodejs", "backend", "javascript", "server"],
    },
    {
        id: 10,
        name: "MySQL",
        matches: ["mysql", "sql", "database", "db", "backend"],
    },
    {
        id: 11,
        name: "MongoDB",
        matches: ["mongodb", "mongo", "database", "db", "nosql"],
    },
    {
        id: 12,
        name: "Redux",
        matches: ["redux", "state", "react", "frontend", "store"],
    },
    {
        id: 13,
        name: "TypeScript",
        matches: ["typescript", "ts", "javascript", "frontend", "static"],
    },
    {
        id: 14,
        name: "Illustrator",
        matches: ["illustrator", "ai", "vector", "design", "graphics"],
    },
    {
        id: 15,
        name: "Vue.js",
        matches: ["vue", "vuejs", "frontend", "javascript", "framework"],
    },
    {
        id: 16,
        name: "Flutter",
        matches: ["flutter", "dart", "mobile", "cross-platform", "app"],
    },
    {
        id: 17,
        name: "Swift",
        matches: ["swift", "ios", "apple", "mobile", "app"],
    },
    {
        id: 18,
        name: "Kotlin",
        matches: ["kotlin", "android", "mobile", "java", "app"],
    },
    {
        id: 19,
        name: "Django",
        matches: ["django", "python", "backend", "web", "framework"],
    },
    {
        id: 20,
        name: "Ruby on Rails",
        matches: ["rails", "ruby", "backend", "web", "framework"],
    },
    {
        id: 21,
        name: "JUnit",
        matches: ["junit", "java", "testing", "unit", "framework"],
    },
];

// interface SkillBadgeProps {
//     skill: string;
//     onDelete?: () => void;
// }

// const SkillBadge = (props: SkillBadgeProps) => {
//     return (
//         <View style={styles.badgeContainer}>
//             <Text style={styles.badgeText}>{props.skill}</Text>
//             {props.onDelete && (
//                 <TouchableOpacity onPress={props.onDelete}>
//                     <DeleteIcon />
//                 </TouchableOpacity>
//             )}
//         </View>
//     );
// };

const SkillBadge = ({ skill, onDelete }: SkillBadgeProps) => {
    return (
        <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{skill.skill}</Text>
            {onDelete && (
                <TouchableOpacity onPress={onDelete}>
                    <DeleteIcon />
                </TouchableOpacity>
            )}
        </View>
    );
};

// interface OptionBadgeProps {
//     name: string;
//     id: string;
//     onSelect?: () => void;
// }

// const OptionBadge = (props: OptionBadgeProps) => {
//     return (
//         <TouchableOpacity onPress={props.onSelect}>
//             <View style={styles.optionBadgeContainer}>
//                 <Text style={styles.optionBadgeText}>{props.name}</Text>
//             </View>
//         </TouchableOpacity>
//     );
// };

interface OptionBadgeProps {
    skill: api.Skill;
    onSelect?: () => void;
}

const OptionBadge = ({ skill, onSelect }: OptionBadgeProps) => {
    return (
        <TouchableOpacity onPress={onSelect}>
            <View style={styles.optionBadgeContainer}>
                <Text style={styles.optionBadgeText}>{skill.skill}</Text>
            </View>
        </TouchableOpacity>
    );
};

const SkillInputBottomModal = (props: any) => {
    const { visible, onClose, selectedSkills, onConfirm, style } = props;

    const [searchQuery, setSearchQuery] = useState("");

    // const [suggestingSkills, setSuggestingSkills] = useState(dummySuggestions);
    const [suggestingSkills, setSuggestingSkills] = useState<api.Skill[]>([]);

    // const [searchedSkills, setSearchedSkills] = useState(dummySkillData);
    const [searchedSkills, setSearchedSkills] = useState<api.Skill[]>([]);

    // const [currentSelectedSkills, setCurrentSelectedSkills] = useState(selectedSkills);
    const [currentSelectedSkills, setCurrentSelectedSkills] = useState<api.Skill[]>([]);

    /** 추천 스킬 가져오기 */
    useEffect(() => {
        const fetchRecommendedSkills = async () => {
            try {
                const skills = await recommendSkill();
                setSuggestingSkills(skills);
                console.log("fetched recommend skills:", skills);
            } catch (error) {
                console.error("Failed to load recommended skills:", error);
            }
        };
        fetchRecommendedSkills();
    }, []);

    /** 사용자의 기존 스킬 가져오기 */
    useEffect(() => {
        const loadUserSkills = async () => {
            try {
                const skills = await fetchSkills();
                setCurrentSelectedSkills(skills);
                console.log("fetched user skills:", skills);
            } catch (error) {
                console.error("Failed to load user skills:", error);
            }
        };
        if (visible) {
            loadUserSkills();
        }
    }, [visible]);

    /** 스킬 검색 */
    useEffect(() => {
        const search = async () => {
            if (searchQuery === "") {
                setSearchedSkills([]);
                return;
            }
            try {
                const skills = await searchSkill(searchQuery);
                setSearchedSkills(skills);
            } catch (error) {
                console.error("Failed to search skills:", error);
            }
        };
        search();
    }, [searchQuery]);

    /** 스킬 선택 */
    const onSelectSkill = async (skill: api.Skill) => {
        try {
            const newSkills = await addSkill([skill.skill]);
            setCurrentSelectedSkills([...currentSelectedSkills, ...newSkills]);
            setSearchQuery("");
        } catch (error) {
            console.error("Failed to add skill:", error);
        }
    };

    /** 스킬 삭제 */
    const onRemoveSkill = async (skillId: number) => {
        try {
            await deleteSkill(skillId);
            setCurrentSelectedSkills(currentSelectedSkills.filter(skill => skill.id !== skillId));
        } catch (error) {
            console.error("Failed to delete skill:", error);
        }
    };

    const matchSkills = (skill: any, query: string) => {
        const matches = skill.matches;
        return matches.some((match: string) =>
            match.includes(query.toLowerCase())
        );
    };

    const searchSkills = (query: string) => {
        if (query === "") {
            setSearchedSkills([]);
        } else {
            setSearchedSkills(
                suggestingSkills.filter((skill) => {
                    const matchRes = matchSkills(skill, query);
                    const isAlreadySelected = currentSelectedSkills.some(
                        (selectedSkill: any) => selectedSkill === skill
                    );
                    return matchRes && !isAlreadySelected;
                })
            );
        }
    };

    // const onSelectSkill = (skill: any) => {
    //     if (searchQuery !== "") {
    //         setSearchQuery("");
    //     }
    //     setCurrentSelectedSkills([...currentSelectedSkills, skill]);
    // };

    // const onRemoveSkill = (index: number) => {
    //     const newSelectedSkills = [...currentSelectedSkills];
    //     newSelectedSkills.splice(index, 1);
    //     setCurrentSelectedSkills(newSelectedSkills);
    // };

    const body = (
        <View style={styles.container}>
            <View style={[styles.titleContainer]}>
                <Text style={styles.title}>{"스킬"}</Text>
            </View>
            <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                    <SearchIcon />
                </View>
                <TextInput
                    style={styles.textInput}
                    placeholder={"스킬 검색"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={theme.colors.achromatic04}
                />
            </View>
            {/** badges */}
            <View style={styles.badgeAllContainer}>
                {currentSelectedSkills.length > 0 &&
                    currentSelectedSkills.map((skill: any, index: number) => {
                        return (
                            <SkillBadge
                                key={index + skill}
                                skill={skill}
                                onDelete={() => onRemoveSkill(index)}
                            />
                        );
                    })}
            </View>
            {/** suggestion & selections */}
            {searchQuery === "" && currentSelectedSkills.length === 0 && (
                <>
                    <View style={styles.suggestionTitleContainer}>
                        <Text style={styles.suggestionTitle}>
                            {"추천 스킬"}
                        </Text>
                    </View>
                    <View style={styles.optionBadgeAllContainer}>
                        {suggestingSkills.map((skill: any) => {
                            return (
                                // <OptionBadge
                                //     key={skill}
                                //     name={skill}
                                //     id={skill}
                                //     onSelect={() => {
                                //         onSelectSkill(skill);
                                //     }}
                                // />
                                <OptionBadge key={skill.id} skill={skill} onSelect={() => onSelectSkill(skill)} />
                            );
                        })}
                    </View>
                </>
            )}
            {(searchQuery !== "" || currentSelectedSkills.length > 0) && (
                <>
                    <View style={styles.optionBadgeAllContainer}>
                        {searchedSkills.map((skill: any) => {
                            return (
                                // <OptionBadge
                                //     key={skill}
                                //     name={skill}
                                //     id={skill}
                                //     onSelect={() => {
                                //         onSelectSkill(skill);
                                //     }}
                                // />
                                <OptionBadge key={skill.id} skill={skill} onSelect={() => onSelectSkill(skill)} />
                            );
                        })}
                    </View>
                    {/** confirm button : activated when `length > 0` */}
                    <PrimeButton
                        text="선택 완료"
                        onClickCallback={() => onConfirm(currentSelectedSkills)}
                        isActive={currentSelectedSkills.length > 0}
                        isLoading={false}
                    />
                </>
            )}
        </View>
    );

    // /** effects */
    // useEffect(() => {
    //     setSearchQuery("");
    //     setCurrentSelectedSkills(selectedSkills);
    // }, [visible]);

    // useEffect(() => {
    //     searchSkills(searchQuery);
    // }, [searchQuery]);

    return (
        <BottomModal
            visible={visible}
            onClose={onClose}
            body={body}
            fixedHeight={270}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "column",
        paddingVertical: 0,
        paddingHorizontal: 20,
    },
    titleContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingBottom: 12,
    },
    title: {
        fontSize: theme.fontSizes.smallTitle,
        fontWeight: 600,
        color: theme.colors.black,
    },
    inputContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "flex-start",
        minHeight: 40,
        backgroundColor: theme.colors.achromatic05,
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    iconContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        paddingRight: 12,
    },
    textInput: {
        fontSize: theme.fontSizes.body1,
        fontWeight: "400",
        color: theme.colors.black,
        flex: 1,
        padding: 0,
    },
    badgeAllContainer: {
        marginTop: 8,
        gap: 8,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        overflow: "scroll",
        height: 30,
    },
    badgeContainer: {
        backgroundColor: theme.colors.background2,
        borderRadius: 5,
        paddingVertical: 4,
        paddingHorizontal: 8,
        gap: 10,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    badgeText: {
        fontSize: theme.fontSizes.body2,
        fontWeight: "400",
        color: theme.colors.black,
    },
    optionBadgeContainer: {
        backgroundColor: theme.colors.white,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.achromatic01,
        paddingVertical: 5,
        paddingHorizontal: 10,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    optionBadgeText: {
        fontSize: theme.fontSizes.smallTitle,
        fontWeight: "500",
        color: theme.colors.achromatic01,
    },
    suggestionTitleContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 20,
    },
    suggestionTitle: {
        fontSize: theme.fontSizes.body2,
        fontWeight: "400",
        color: theme.colors.achromatic01,
    },
    optionBadgeAllContainer: {
        marginTop: 8,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 8,
        overflow: "scroll",
        height: 35,
        marginBottom: 16,
    },
});

export default SkillInputBottomModal;
