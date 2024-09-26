import { AvatarProps } from './avatar.types';
import { ProfilePicture } from '@boclar/booking-app-components';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Avatar component.
 */
const Avatar = ({ ...props }: AvatarProps) => {
    const { testID } = props;
    const { t } = useTranslation();
    const alerts: Required<AvatarProps['alerts']> = useMemo(
        () => ({
            notGrantedChooseFromLibraryCancel: t(
                'avatarComponent.notGrantedChooseFromLibraryCancel'
            ),
            notGrantedChooseFromLibraryMessage: t(
                'avatarComponent.notGrantedChooseFromLibraryMessage'
            ),
            notGrantedChooseFromLibraryOpenSettings: t(
                'avatarComponent.notGrantedChooseFromLibraryOpenSettings'
            ),
            notGrantedChooseFromLibraryTitle: t(
                'avatarComponent.notGrantedChooseFromLibraryTitle'
            ),
            notGrantedTakeAPhotoCancel: t(
                'avatarComponent.notGrantedTakeAPhotoCancel'
            ),
            notGrantedTakeAPhotoMessage: t(
                'avatarComponent.notGrantedTakeAPhotoMessage'
            ),
            notGrantedTakeAPhotoOpenSettings: t(
                'avatarComponent.notGrantedTakeAPhotoOpenSettings'
            ),
            notGrantedTakeAPhotoTitle: t(
                'avatarComponent.notGrantedTakeAPhotoTitle'
            ),
        }),
        [t]
    );

    return (
        <ProfilePicture
            {...props}
            actionSheetTitle={t('common.actionSheetTitle')}
            alerts={alerts}
            chooseFromGalleryText={t('avatarComponent.chooseFromGallery')}
            deletePhotoText={t('avatarComponent.deletePhoto')}
            takeAPhotoText={t('avatarComponent.takeAPhoto')}
            testID={testID}
        />
    );
};

export { Avatar };
