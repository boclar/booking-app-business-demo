import { UserProgressState } from '@/redux/slices/userProgress.slices';

export interface CreateBusinessFormProps {
    /**
     * Function to go to the next step
     */
    goNextPage: () => void;
    /**
     * Initial formik values for testing purposes only
     */
    testInitialFormikValues?: UserProgressState['createBusinessForm'];
}
