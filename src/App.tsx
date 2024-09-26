import { Button, Text } from '@boclar/booking-app-components';
import { registerRootComponent } from 'expo';
import { GlobalContext } from '@/components/global-context';

const App = () => {
    return (
        <GlobalContext>
            <Button
                background={'ctaPrimary'}
                rounded={'full-rounded'}
                variant={'filled'}
            >
                <Text
                    color={'body'}
                    fontFamily={'body.regular'}
                    fontSize={'body'}
                >
                    Button
                </Text>
            </Button>
        </GlobalContext>
    );
};

registerRootComponent(App);
