import { View } from 'react-native';

type SvgMockProps = {
    [key: string]: string;
};

const SvgMock = (props: SvgMockProps) => {
    return <View {...props}>SvgMock</View>;
};

export default SvgMock;
