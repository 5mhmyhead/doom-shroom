import { registerWebModule, NativeModule } from 'expo';

class AppLauncherModule extends NativeModule<{}> {}

export default registerWebModule(AppLauncherModule, 'AppLauncherModule');
