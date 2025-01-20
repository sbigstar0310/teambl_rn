import {StyleSheet, Switch, Text, View} from "react-native";
import theme from "@/shared/styles/theme";

interface ToggleButtonProps {
    label: string;
    defaultValue?: boolean;
    onChange: (value: boolean) => void;
}

export default function ToggleButton(props: ToggleButtonProps) {
    const isEnabled = props.defaultValue ?? false;
    return (
        <View style={styles.container}>
            {/* Toggle */}
            <Switch
                trackColor={{false: theme.colors.achromatic03, true: theme.colors.main}}
                thumbColor={theme.colors.white}
                onValueChange={props.onChange}
                value={isEnabled}
            />
            {/* Label */}
            <Text style={styles.labelText}>{props.label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center"
    },
    labelText: {
        fontSize: 16
    }
})