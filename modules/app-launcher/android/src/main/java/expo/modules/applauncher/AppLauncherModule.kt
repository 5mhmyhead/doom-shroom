package expo.modules.applauncher

import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AppLauncherModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AppLauncher") // must match requireNativeModule below

    Function("launch") { pkg: String ->
      val ctx = appContext.reactContext ?: return@Function false
      val intent = ctx.packageManager.getLaunchIntentForPackage(pkg)
        ?: return@Function false
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      ctx.startActivity(intent)
      true
    }
  }
}

