package com.common.camera;

import java.io.IOException;

import android.app.Activity;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.graphics.PixelFormat;
import android.hardware.Camera;
import android.hardware.Camera.Parameters;
import android.hardware.Camera.Size;
import android.util.AttributeSet;
import android.util.Log;
import android.view.Display;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.WindowManager;

public class CameraSurfaceView extends SurfaceView implements
		SurfaceHolder.Callback {
	private static final String TAG = "yanzi";
	CameraInterface mCameraInterface;
	Context mContext;
	SurfaceHolder mSurfaceHolder;

	boolean isPreview = false;
	int width, height;
	
	public CameraSurfaceView(Context content)
	{
		super(content);
		mContext = content;
		mSurfaceHolder = getHolder();
		mSurfaceHolder.setFormat(PixelFormat.TRANSPARENT);
		mSurfaceHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
		mSurfaceHolder.addCallback(this);
	}

	public CameraSurfaceView(Context context, AttributeSet attrs) {
		super(context, attrs);
		mContext = context;
		mSurfaceHolder = getHolder();
		mSurfaceHolder.setFormat(PixelFormat.TRANSPARENT);
		mSurfaceHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
		mSurfaceHolder.addCallback(this);

	}

	@Override
	public void surfaceCreated(SurfaceHolder holder) {
		// TODO Auto-generated method stub
		Log.i(TAG, "surfaceCreated...");

	}

	@Override
	public void surfaceChanged(SurfaceHolder holder, int format, int width,
			int height) {
		// TODO Auto-generated method stub
		Log.i(TAG, "surfaceChanged...");
		
        if (mSurfaceHolder.getSurface() == null){
            // preview surface does not exist
            return;
          }

          // stop preview before making changes
          try {
        	  
          } catch (Exception e){
            // ignore: tried to stop a non-existent preview
          }

          // set preview size and make any resize, rotate or
          // reformatting changes here

          // start preview with new settings
          try {
              CameraInterface.getInstance().getCamera().setPreviewDisplay(mSurfaceHolder);
              CameraInterface.getInstance().getCamera().startPreview();

          } catch (Exception e){
              Log.d(TAG, "Error starting camera preview: " + e.getMessage());
          }
	}

	@Override
	public void surfaceDestroyed(SurfaceHolder holder) {
		// TODO Auto-generated method stub
		Log.i(TAG, "surfaceDestroyed...");
		  try {
		CameraInterface.getInstance().stopPreview();
		  }catch (Exception e){
              Log.d(TAG, "Error starting camera preview: " + e.getMessage());
          }
	}

	public SurfaceHolder getSurfaceHolder() {
		return mSurfaceHolder;
	}

}
