import { NativeModule, requireNativeModule } from 'expo';

declare class AppLauncherModule extends NativeModule<{}> {}

export default requireNativeModule<AppLauncherModule>('AppLauncher');
