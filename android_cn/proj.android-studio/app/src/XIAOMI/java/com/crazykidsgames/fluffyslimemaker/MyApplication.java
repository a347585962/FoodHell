package com.crazykidsgames.fluffyslimemaker;

import android.content.Context;
import android.support.multidex.MultiDex;
import android.support.multidex.MultiDexApplication;

import com.common.ads.MimoSDkInit;
import com.umeng.analytics.MobclickAgent;
import com.umeng.commonsdk.UMConfigure;
/**
 * Created by hujie2 on 15/11/5.
 */
public class MyApplication  extends MultiDexApplication
{
    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        MultiDex.install(this);

    }

    @Override
    public void onCreate() {
        super.onCreate();
        MimoSDkInit.init(this);
    }
}

