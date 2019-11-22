package com.common.lqview;

import android.app.Activity;
import android.content.Context;
import android.view.MotionEvent;
import android.view.View;
import android.view.inputmethod.InputMethodManager;

import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import org.cocos2dx.lib.Cocos2dxRenderer;

import java.lang.reflect.Field;


public class LQ_glView extends Cocos2dxGLSurfaceView {
	private static boolean  isMultTouch = false;
	
	public static void setMultTouch(boolean flag){
		isMultTouch = flag;
	}
	Cocos2dxRenderer LQ_renderer = null;
	public LQ_glView(Context context) {
		super(context);

		// TODO Auto-generated constructor stub
	}
	
	@Override
	public boolean onTouchEvent(MotionEvent pMotionEvent) {
		// TODO Auto-generated method stub
		if(LQ_renderer == null) {
			try {
				Field rendererField = Cocos2dxGLSurfaceView.class.getDeclaredField("mCocos2dxRenderer");
				rendererField.setAccessible(true);
				LQ_renderer = (Cocos2dxRenderer)(rendererField.get(LQ_glView.this));
			}catch (Exception e){

			}
		}
		int pointNumner = pMotionEvent.getPointerCount();
		if (!isMultTouch&&(pMotionEvent.getAction() & MotionEvent.ACTION_MASK) == MotionEvent.ACTION_POINTER_DOWN &&pointNumner>1) {
			return false;
		}{
			int pointerNumber = pMotionEvent.getPointerCount();
			final int[] ids = new int[pointerNumber];
			final float[] xs = new float[pointerNumber];
			final float[] ys = new float[pointerNumber];
			boolean flag = false;
			Field mSoftKeyboardShownfield = null;
			try {
				 mSoftKeyboardShownfield = Cocos2dxGLSurfaceView.class.getDeclaredField("mSoftKeyboardShown");
				mSoftKeyboardShownfield.setAccessible(true);
				flag = mSoftKeyboardShownfield.getBoolean(this);
			}catch (Exception e) {

			}


			if(flag) {
				InputMethodManager indexPointerDown = (InputMethodManager)this.getContext().getSystemService("input_method");
				View idPointerDown = ((Activity)this.getContext()).getCurrentFocus();
				indexPointerDown.hideSoftInputFromWindow(idPointerDown.getWindowToken(), 0);
				this.requestFocus();
				try {
					mSoftKeyboardShownfield.setBoolean(this, false);
				}
					catch (Exception e) {

					}
			}

			int var20;
			for(var20 = 0; var20 < pointerNumber; ++var20) {
				ids[var20] = pMotionEvent.getPointerId(var20);
				xs[var20] = pMotionEvent.getX(var20);
				ys[var20] = pMotionEvent.getY(var20);
			}

			switch(pMotionEvent.getAction() & 255) {
				case 0:
					final int idDown = pMotionEvent.getPointerId(0);
					final float xDown = xs[0];
					final float yDown = ys[0];
					this.queueEvent(new Runnable() {
						public void run() {

							LQ_renderer.handleActionDown(idDown, xDown, yDown);
						}
					});
					break;
				case 1:
					final int idUp = pMotionEvent.getPointerId(0);
					final float xUp = xs[0];
					final float yUp = ys[0];
					this.queueEvent(new Runnable() {
						public void run() {

							LQ_renderer.handleActionUp(idUp, xUp, yUp);
						}
					});
					break;
				case 2:
					this.queueEvent(new Runnable() {
						public void run() {

							LQ_renderer.handleActionMove(ids, xs, ys);
						}
					});
					break;
				case 3:
					this.queueEvent(new Runnable() {
						public void run() {

							LQ_renderer.handleActionCancel(ids, xs, ys);
						}
					});
				case 4:
				default:
					break;
				case 5:
					var20 = pMotionEvent.getAction() >> 8;
					final int var21 = pMotionEvent.getPointerId(var20);
					final float xPointerDown = pMotionEvent.getX(var20);
					final float yPointerDown = pMotionEvent.getY(var20);
					this.queueEvent(new Runnable() {
						public void run() {

							LQ_renderer.handleActionDown(var21, xPointerDown, yPointerDown);
						}
					});
					break;
				case 6:
					int indexPointUp = pMotionEvent.getAction() >> 8;
					final int idPointerUp = pMotionEvent.getPointerId(indexPointUp);
					final float xPointerUp = pMotionEvent.getX(indexPointUp);
					final float yPointerUp = pMotionEvent.getY(indexPointUp);
					this.queueEvent(new Runnable() {
						public void run() {
							LQ_renderer.handleActionUp(idPointerUp, xPointerUp, yPointerUp);
						}
					});
			}

			return true;
		}
		//return super.onTouchEvent(pMotionEvent);
	}
}
