@file:JvmName("NsfwBlur")

package org.wolfies.nsfwblur

import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import de.robv.android.xposed.XC_MethodHook
import de.robv.android.xposed.XposedBridge
import de.robv.android.xposed.XposedHelpers
import io.github.revenge.plugins.plugin
import io.github.revenge.xposed.api.registerNativeMethod
import java.lang.ref.WeakReference
import java.util.WeakHashMap

private const val LABEL = "Tap to reveal"
private val main = Handler(Looper.getMainLooper())
private val overlays = WeakHashMap<View, WeakReference<ViewGroup>>()
@Volatile private var strength = 24f

private fun field(target: Any, name: String): Any = XposedHelpers.getObjectField(target, name)

private fun nestedClick(view: View, listener: View.OnClickListener) {
    val helper = XposedHelpers.findClass("com.discord.react_gesture_handler.nested_touch.NestedScrollOnTouchUtilsKt", view.javaClass.classLoader)
    XposedHelpers.callStaticMethod(helper, "setOnClickListenerNested", view, false, listener)
}

private fun applyOverlay(overlay: View, parent: ViewGroup, radius: Float, revealOnTap: Boolean) {
    val binding = field(overlay, "binding")
    val blur = field(binding, "blurView") as View
    XposedHelpers.callMethod(blur, "setBlurRadius", radius)
    XposedHelpers.callMethod(blur, "setOverlayColor", if (revealOnTap) 0 else 0x50000000)
    blur.invalidate()
}

val nsfwBlur = plugin {
    val hooks = mutableListOf<XC_MethodHook.Unhook>()
    var active = false

    start {
        active = true
        val overlayClass = XposedHelpers.findClass("com.discord.chat.presentation.message.view.ObscureOverlayView", classLoader)
        hooks += XposedBridge.hookAllMethods(overlayClass, "configure", object : XC_MethodHook() {
            override fun afterHookedMethod(param: MethodHookParam) {
                val overlay = param.thisObject as? View ?: return
                if (!active || param.args.firstOrNull() != LABEL) {
                    if (overlays.remove(overlay) != null) {
                        nestedClick(field(field(overlay, "binding"), "blurView") as View, View.OnClickListener {})
                    }
                    return
                }
                val parent = param.args.getOrNull(2) as? ViewGroup ?: return
                try {
                    val blur = field(field(overlay, "binding"), "blurView") as View
                    val reveal = field(field(overlay, "binding"), "revealButton")
                    val target = field(field(reveal, "binding"), "iconContainer") as View
                    val helper = XposedHelpers.findClass("com.discord.react_gesture_handler.nested_touch.NestedScrollOnTouchUtilsKt", overlay.javaClass.classLoader)
                    val onReveal = XposedHelpers.callStaticMethod(helper, "getNestedClickListener", target) as? View.OnClickListener
                        ?: error("Reveal button listener missing")
                    nestedClick(blur, View.OnClickListener {
                        if (blur.visibility == View.VISIBLE) onReveal.onClick(target)
                    })
                    overlays[overlay] = WeakReference(parent)
                    applyOverlay(overlay, parent, strength, true)
                } catch (error: Throwable) {
                    log.e("Failed to configure NSFW blur", error)
                }
            }
        })
        val infoLinkClass = XposedHelpers.findClass("com.discord.chat.presentation.message.view.InfoLinkView", classLoader)
        hooks += XposedBridge.hookAllMethods(infoLinkClass, "configure", object : XC_MethodHook() {
            override fun afterHookedMethod(param: MethodHookParam) {
                val view = param.thisObject as? View ?: return
                val text = param.args.firstOrNull() as? String
                view.visibility = if (text.isNullOrEmpty()) View.GONE else View.VISIBLE
            }
        })
        registerNativeMethod("${manifest.id}.configure") { args ->
            check(active) { "NSFW blur is stopped" }
            val requested = args.firstOrNull() as? Number ?: error("Blur strength must be a number")
            strength = requested.toFloat().also { require(it.isFinite()) }.coerceIn(1f, 25f)
            log.i("Applying blur strength $strength to ${overlays.size} overlays")
            main.post {
                overlays.entries.toList().forEach { (overlay, parent) ->
                    try { parent.get()?.let { applyOverlay(overlay, it, strength, true) } }
                    catch (error: Throwable) { log.e("Failed to update NSFW blur", error) }
                }
            }
            true
        }
        log.i("NSFW blur native hooks ready: direct view setters")
    }

    stop {
        active = false
        hooks.forEach { it.unhook() }
        hooks.clear()
        main.post {
            overlays.entries.toList().forEach { (overlay, parent) ->
                runCatching {
                    nestedClick(field(field(overlay, "binding"), "blurView") as View, View.OnClickListener {})
                    parent.get()?.let { applyOverlay(overlay, it, 24f, false) }
                }
            }
            overlays.clear()
        }
        requireReload()
    }
}
