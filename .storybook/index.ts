import AsyncStorage from '@react-native-async-storage/async-storage';
import {view} from './storybook.requires';

const StorybookUIRoot = view.getStorybookUI({
    storage: {
        getItem: AsyncStorage.getItem,
        setItem: AsyncStorage.setItem,
    },
    initialSelection: undefined,

});

export default StorybookUIRoot;
