#!/usr/bin/env bash
set -euo pipefail
native_dir="${RUNNER_TEMP}/nsfw-native"
mkdir -p "$native_dir"
curl --fail --location --retry 3 https://github.com/JetBrains/kotlin/releases/download/v2.4.0/kotlin-compiler-2.4.0.zip -o "$native_dir/kotlin.zip"
unzip -q "$native_dir/kotlin.zip" -d "$native_dir"
curl --fail --location --retry 3 https://github.com/revenge-mod/revenge-xposed/archive/347e10b36eecadd2a6d537c4d61965c0cabae635.tar.gz -o "$native_dir/api.tar.gz"
tar -xzf "$native_dir/api.tar.gz" -C "$native_dir"
curl --fail --location --retry 3 https://api.xposed.info/de/robv/android/xposed/api/82/api-82.jar -o "$native_dir/xposed-api.jar"
curl --fail --location --retry 3 https://repo.maven.apache.org/maven2/org/jetbrains/kotlinx/kotlinx-coroutines-core-jvm/1.10.2/kotlinx-coroutines-core-jvm-1.10.2.jar -o "$native_dir/coroutines.jar"
"$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" 'platforms;android-36' 'build-tools;36.0.0'
android_jar="$ANDROID_HOME/platforms/android-36/android.jar"
curl --fail --location --retry 3 https://repo.maven.apache.org/maven2/org/luckypray/dexkit/2.3.0/dexkit-2.3.0.aar -o "$native_dir/dexkit.aar"
unzip -p "$native_dir/dexkit.aar" classes.jar > "$native_dir/dexkit.jar"
printf '%s\n' 'package io.github.revenge.api' 'object BuildConfig { const val API_VERSION = "1.2.1" }' > "$native_dir/BuildConfig.kt"
"$native_dir/kotlinc/bin/kotlinc" \
    "$native_dir/revenge-xposed-347e10b36eecadd2a6d537c4d61965c0cabae635/api/src/main/kotlin" \
    "$native_dir/BuildConfig.kt" \
    -classpath "$android_jar:$native_dir/xposed-api.jar:$native_dir/coroutines.jar:$native_dir/dexkit.jar" \
    -jvm-target 17 -d "$native_dir/revenge-api.jar"
{
    echo "KOTLIN_HOME=$native_dir/kotlinc"
    echo "ANDROID_JAR=$android_jar"
    echo "REVENGE_API_JAR=$native_dir/revenge-api.jar"
    echo "XPOSED_API_JAR=$native_dir/xposed-api.jar"
    echo "DEXKIT_JAR=$native_dir/dexkit.jar"
    echo "COROUTINES_JAR=$native_dir/coroutines.jar"
    echo "D8=$ANDROID_HOME/build-tools/36.0.0/d8"
} >> "$GITHUB_ENV"
