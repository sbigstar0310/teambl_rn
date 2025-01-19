import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {PropsWithChildren, useState} from "react";
import DropdownUpIcon from '@/assets/dropdown-up-icon.svg';
import DropdownDownIcon from '@/assets/dropdown-down-icon.svg';
import {sharedStyles} from "@/app/_layout";

interface DropdownContentProps extends PropsWithChildren {
    title: string;
}

export default function DropdownContent(props: DropdownContentProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.header} onPress={handleToggle}>
                <Text style={sharedStyles.primaryText}>{props.title}</Text>
                {isOpen ? <DropdownUpIcon/> : <DropdownDownIcon/>}
            </TouchableOpacity>
            {isOpen && props.children}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 12
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12
    }
})