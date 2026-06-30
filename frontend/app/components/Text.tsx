import { Text as RNText, TextProps } from 'react-native';

export function Text(props: TextProps) {
    return (
        <RNText {...props} style={[{ fontFamily: 'JetBrainsMono' }, props.style]} />
    );
}