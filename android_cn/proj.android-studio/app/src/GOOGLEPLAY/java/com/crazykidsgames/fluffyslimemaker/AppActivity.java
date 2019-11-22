/****************************************************************************
Copyright (c) 2008-2010 Ricardo Quesada
Copyright (c) 2010-2012 cocos2d-x.org
Copyright (c) 2011      Zynga Inc.
Copyright (c) 2013-2014 Chukong Technologies Inc.
 
http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package com.crazykidsgames.fluffyslimemaker;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.PixelFormat;
import android.os.Bundle;
import android.os.Build;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;

//import com.common.ads.AdsManager;
//import com.common.ads.AdsType;
import com.common.ads.AdsManager;
import com.common.ads.AdsType;
import com.common.android.PlatformCode;
import com.common.android.utils.Utils;
import com.common.lqview.LQ_glView;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;

//import com.common.lqview.LQ_glView;

public class AppActivity extends Cocos2dxActivity {
@Override
	public int getAnalyticsCode() {
		return 0;
	}

@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
//		if(receiver != null){
//	this.unregisterReceiver(receiver);
//	receiver = null;
//}
	setupNativeEnvironment();
	AdsManager.getInstance(this).setUpWithJni(AdsType.BANNER | AdsType.REWARD | AdsType.INTERSTITIAL | AdsType.CROSS);


	}

	public Cocos2dxGLSurfaceView onCreateView() {
		Cocos2dxGLSurfaceView glSurfaceView = new LQ_glView(this);
		// HelloWorld should create stencil buffer
		glSurfaceView.setEGLConfigChooser(8, 8, 8, 8, 16, 8);
		glSurfaceView.getHolder().setFormat(PixelFormat.TRANSPARENT);
		glSurfaceView.setZOrderOnTop(true);
		glSurfaceView.setZOrderMediaOverlay(true);
		return glSurfaceView;
	}

	@Override
	public int getPlatformCode() {
		return com.common.android.PlatformCode.GOOGLEPLAY;
	}

	@Override
	public boolean getDebugMode() {
		return true;
	}

	@Override
	public boolean enableEvent() {
		return !getDebugMode();
	}
}
