package com.common.camera;

import android.Manifest;
import android.app.Activity;
import android.app.Application;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.PixelFormat;
import android.graphics.Point;
import android.hardware.Camera;
import android.hardware.Camera.PictureCallback;
import android.hardware.Camera.ShutterCallback;
import android.hardware.Camera.Size;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.util.Log;
import android.view.Surface;
import android.view.SurfaceHolder;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import com.common.ads.FullScreenAds;
import com.common.android.permission.PermissionHelper;
import com.common.android.permission.PermissionJNI;
import com.common.android.permission.PermissionListener;
import com.common.android.permission.PermissionUtils;
import com.common.android.permission.PermissionsManager;

import java.util.List;

public class CameraInterface extends Application{
	private static final String TAG = "Camera";
	private Camera mCamera = null;
	private SurfaceHolder mHolder;
	private Camera.Parameters mParams;
	private boolean isPreviewing = false;
	private static CameraInterface mCameraInterface;
	private static Activity mMainActivity;
	com.common.camera.CameraSurfaceView surfaceView = null;
	private float mPreviwRate = -1f;
	int mCameraId = 0;
	private static final int CAMERA_REQUEST_CODE = 10;
	private static final int STORAGE_REQUEST_CODE = 11;
	byte lock[] = new byte[0];
	public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults){
		if(requestCode == CAMERA_REQUEST_CODE&&grantResults.length>0&& grantResults[0]== PackageManager.PERMISSION_GRANTED){
			Thread thread = new Thread() {
				//@Override
				public void run() {
						// TODO Auto-generated method stub
						CameraInterface.getInstance().doOpenCamera();

				}
			};
			thread.start();
		}else if(requestCode == STORAGE_REQUEST_CODE){
			if(grantResults.length>0&& grantResults[0]== PackageManager.PERMISSION_GRANTED){
				CameraInterface.getInstance().doTakePicture();
			}else {
				CameraInterface.getInstance().pictureCaptureNative(false, "");
			}
		}
	}



	public interface CamOpenOverCallback {
		public void cameraHasOpened();
	}

	private CameraInterface() {

	}

	public static  CameraInterface getInstance() {
		if (mCameraInterface == null) {
			mCameraInterface = new CameraInterface();
		}
		return mCameraInterface;
	}

	public static boolean isCameraEnable() {
		boolean flag = false;
		if(mMainActivity != null) {
			flag = PermissionsManager.getInstance().hasPermission(mMainActivity,android.Manifest.permission.CAMERA);
			//flag = ContextCompat.checkSelfPermission(mMainActivity,android.Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
			if(flag)
				flag = Camera.getNumberOfCameras()>0;
		}
		return flag;
	}

	public static boolean isHasCamera()
	{
		int i = Camera.getNumberOfCameras();
		return i > 0;
	}
	
	public static void openCamera() {
		Thread thread = new Thread() {
			//@Override
			public void run() {
				if(isCameraEnable()) {
					CameraInterface.getInstance().doOpenCamera();
				}else{
					FullScreenAds.setFullScreenAdsShowing(true);
						String[] permissons = {android.Manifest.permission.CAMERA};
						PermissionHelper.getInstance().requestPermission(mMainActivity, new PermissionListener() {
							@Override
							public void onPermissionGranted(String... strings) {
								FullScreenAds.setFullScreenAdsShowing(false);
								try {
									Thread thread = new Thread() {
										//@Override
										public void run() {
											// TODO Auto-generated method stub
											CameraInterface.getInstance().doOpenCamera();

										}
									};
									thread.start();
								} catch (UnsatisfiedLinkError var3) {
									;
								}
							}

							@Override
							public void onPermissionDenied() {

							}
						}, permissons);
						//ActivityCompat.requestPermissions(mMainActivity,new String[]{android.Manifest.permission.CAMERA},CAMERA_REQUEST_CODE);

				}
			}
		};
		thread.start();
		// CameraInterface.getInstance().doOpenCamera();
	}

	public static void closeCamera() {
		CameraInterface.getInstance().doStopCamera();
	}

	public static void switchCamera() {
		CameraInterface.getInstance().doSwitchCamera();
	}

	public static void capture() {
		boolean flag = false;
		if(mMainActivity != null) {
			flag = PermissionsManager.getInstance().hasPermission(mMainActivity,Manifest.permission.WRITE_EXTERNAL_STORAGE);
			//ContextCompat.checkSelfPermission(mMainActivity, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
		}
		if(flag)
			CameraInterface.getInstance().doTakePicture();
		else {
			//boolean shouldRequest = !ActivityCompat.shouldShowRequestPermissionRationale(mMainActivity, Manifest.permission.WRITE_EXTERNAL_STORAGE);
			if(mMainActivity != null){
				FullScreenAds.setFullScreenAdsShowing(true);
				String[] permissons = {android.Manifest.permission.WRITE_EXTERNAL_STORAGE};
				PermissionHelper.getInstance().requestPermission(mMainActivity, new PermissionListener() {
					@Override
					public void onPermissionGranted(String... strings) {
						FullScreenAds.setFullScreenAdsShowing(false);
						try {
							CameraInterface.getInstance().doTakePicture();
						} catch (UnsatisfiedLinkError var3) {
							;
						}
					}

					@Override
					public void onPermissionDenied() {
						CameraInterface.getInstance().pictureCaptureNative(false, "");
					}
				}, permissons);

				//ActivityCompat.requestPermissions(mMainActivity,new String[]{android.Manifest.permission.WRITE_EXTERNAL_STORAGE},STORAGE_REQUEST_CODE);
			}else
				CameraInterface.getInstance().pictureCaptureNative(false, "");

		}

	}

	public void setUp(Activity mainActivity) {
		mMainActivity = mainActivity;

		surfaceView = new com.common.camera.CameraSurfaceView(mMainActivity);
		Point p = com.common.camera.DisplayUtil.getScreenMetrics(mMainActivity);
		FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
				FrameLayout.LayoutParams.WRAP_CONTENT,
				FrameLayout.LayoutParams.WRAP_CONTENT);
		mPreviwRate = com.common.camera.DisplayUtil.getScreenRate(mMainActivity);
		surfaceView.setLayoutParams(params);

		View contentView = mMainActivity.findViewById(android.R.id.content);
		((ViewGroup) contentView).addView(surfaceView, 0);
	}

	public Camera getCamera() {
		return mCamera;
	}

	public void doSwitchCamera() {
		int camNum = 0;
		camNum = Camera.getNumberOfCameras();
		int camBackId = Camera.CameraInfo.CAMERA_FACING_BACK;
		int camFrontId = Camera.CameraInfo.CAMERA_FACING_FRONT;
		Camera.CameraInfo currentCamInfo = new Camera.CameraInfo();

		// if camera is running
		if (mCamera != null) {
			Camera.getCameraInfo(mCameraId, currentCamInfo);
			// and there is more than one camera
			if (camNum > 1) {
				// stop current camera
				mCamera.stopPreview();
				mCamera.setPreviewCallback(null);
				// camera.takePicture(null, null, PictureCallback);
				mCamera.release();
				mCamera = null;
				// stop surfaceHolder?

				if (currentCamInfo.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
					// switch camera to back camera
					mCamera = Camera.open(camBackId);
					mCameraId = camBackId;
				} else {
					try {
						mCamera = Camera.open(camFrontId);
						mCameraId = camFrontId;
					} catch (Exception e) {
						// TODO: handle exception
						Log.d(TAG, "Camera open failed" + e.getMessage());
					}
				}
				SurfaceHolder holder = surfaceView.getSurfaceHolder();
				doStartPreview(holder, mPreviwRate);
			}
		}
	}

	public void showCameraSurceafceView() {
		mMainActivity.runOnUiThread(new Runnable() {

			@Override
			public void run() {
				// TODO Auto-generated method stub
				surfaceView.setVisibility(View.VISIBLE);
			}
		});
		return;
	}

	public void removeSurfaceView() {

		if (surfaceView != null) {
			mMainActivity.runOnUiThread(new Runnable() {

				@Override
				public void run() {
					surfaceView.setVisibility(View.INVISIBLE);
					return;
				}
			});
		}
	}

	public void stopPreview() {
		// stop preview before making changes
		try {
				mCamera.stopPreview();
			
		
			
		} catch (Exception e) {
			// ignore: tried to stop a non-existent preview
		}
	}

	public void startPreview() {
		// start preview with new settings
		try {
			mCamera.setPreviewDisplay(mHolder);
			mCamera.startPreview();
			

		} catch (Exception e) {
			Log.d(TAG, "Error starting camera preview: " + e.getMessage());
		}

	}

	/**
	 * ��Camera
	 * 
	 * @param callback
	 */
	public  void  doOpenCamera() {
		synchronized (lock) {
		int i = Camera.getNumberOfCameras();
		Log.i(TAG, "Camera open...." + i);
		try {
			mCamera = Camera.open(mCameraId);
			showCameraSurceafceView();
		} catch (Exception e) {
			// TODO: handle exception
			Log.d(TAG, "Camera open failed" + e.getMessage());
		}
		Log.i(TAG, "Camera open over....");

		if (surfaceView != null) {
			SurfaceHolder holder = surfaceView.getSurfaceHolder();
			doStartPreview(holder, mPreviwRate);
		}
		}
	}

	/**
	 * ����Ԥ��
	 * 
	 * @param holder
	 * @param previewRate
	 */
	public void doStartPreview(SurfaceHolder holder, float previewRate) {

		Log.i(TAG, "doStartPreview...");
		try {
			mCamera.stopPreview();
		} catch (Exception e) {
			Log.i(TAG, "stop preview erro...");
		}

		if (mCamera != null) {
			mParams = mCamera.getParameters();
			mParams.setPictureFormat(PixelFormat.JPEG);
			Size picSize = mParams.getPictureSize();
			Size preSize = mParams.getPreviewSize();
			Log.d("", "" + picSize.width + "" + picSize.height + ""
					+ preSize.width + "" + preSize.height);
			Size pictureSize = com.common.camera.CamParaUtil.getInstance().getPropPictureSize(
					mParams.getSupportedPictureSizes(),
					mPreviwRate, 800);
			Size previewSize = com.common.camera.CamParaUtil.getInstance().getPropPreviewSize(
					mParams.getSupportedPreviewSizes(), mPreviwRate,
					com.common.camera.DisplayUtil.getScreenMetrics(mMainActivity).x);
			mParams.setPictureSize(pictureSize.width, pictureSize.height);
			mParams.setPreviewSize(previewSize.width, previewSize.height);
			android.hardware.Camera.CameraInfo info = new android.hardware.Camera.CameraInfo();
			android.hardware.Camera.getCameraInfo(mCameraId, info);
			int degrees = 0;
			int rotation = mMainActivity.getWindowManager().getDefaultDisplay()
					.getRotation();
			switch (rotation) {
			case Surface.ROTATION_0:
				degrees = 0;
				break;
			case Surface.ROTATION_90:
				degrees = 90;
				break;
			case Surface.ROTATION_180:
				degrees = 180;
				break;
			case Surface.ROTATION_270:
				degrees = 270;
				break;
			}

			int result;
			if (info.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
				result = (info.orientation + degrees) % 360;
				result = (360 - result) % 360; // compensate the mirror
			} else { // back-facing
				result = (info.orientation - degrees + 360) % 360;
			}
			Log.i("result====", "========="+result);
		
			List<String> focusModes = mParams.getSupportedFocusModes();
			if (focusModes != null && focusModes.contains("continuous-video")) {
				mParams.setFocusMode(Camera.Parameters.FOCUS_MODE_CONTINUOUS_VIDEO);
			}
		

			try {
				mCamera.stopPreview();
				mCamera.setParameters(mParams);
				mCamera.setPreviewDisplay(holder);
				Log.i("rote====", "========="+1);
				mCamera.setDisplayOrientation(result);
				mCamera.startPreview();
			} catch (Exception e) {
				Log.i(TAG, "set mParams erro...");
				com.common.camera.CamParaUtil.getInstance().printSupportFocusMode(mParams);
			}

			isPreviewing = true;

			Log.i(TAG,
					"��������:PreviewSize--With = "
							+ mParams.getPreviewSize().width + "Height = "
							+ mParams.getPreviewSize().height);
			Log.i(TAG,
					"��������:PictureSize--With = "
							+ mParams.getPictureSize().width + "Height = "
							+ mParams.getPictureSize().height);
		}
		
	}

	
	
	/**
	 * ֹͣԤ�����ͷ�Camera
	 */
	public   void  doStopCamera() {
		synchronized (lock) {
			if (null != mCamera) {
				mCamera.setPreviewCallback(null);		
				mCamera.stopPreview();
				isPreviewing = false;
				mCamera.release();
				mCamera = null;
				removeSurfaceView();
			}
				
		}
	}

	/**
	 * ����
	 */
	public  void doTakePicture() {
		synchronized (lock) {
		if (isPreviewing && (mCamera != null)) {
			try {
				System.gc();
				mCamera.takePicture(mShutterCallback, null,
						mJpegPictureCallback);
				// mCamera.takePicture(null, null, null);
			} catch (Exception e) {
				// TODO: handle exception
				Log.d("takePicture", e.toString());
			}
		}
		}
	}

	/* Ϊ��ʵ�����յĿ������������ձ�����Ƭ��Ҫ��������ص����� */
	ShutterCallback mShutterCallback = new ShutterCallback()
	// ���Ű��µĻص������������ǿ����������Ʋ��š����ꡱ��֮��Ĳ�����Ĭ�ϵľ������ꡣ
	{
		public void onShutter() {
			// TODO Auto-generated method stub
			Log.i(TAG, "myShutterCallback:onShutter...");
		}
	};
	PictureCallback mRawCallback = new PictureCallback()
	// �����δѹ��ԭ��ݵĻص�,����Ϊnull
	{

		public void onPictureTaken(byte[] data, Camera camera) {
			// TODO Auto-generated method stub
			Log.i(TAG, "myRawCallback:onPictureTaken...");

		}
	};
	PictureCallback mJpegPictureCallback = new PictureCallback()
	// ��jpegͼ����ݵĻص�,����Ҫ��һ���ص�
	{
		public void onPictureTaken(byte[] data, Camera camera) {
			// TODO Auto-generated method stub
		
			Log.i(TAG, "myJpegCallback:onPictureTaken...");
			Bitmap b = null;
			if (null != data) {
				b = BitmapFactory.decodeByteArray(data, 0, data.length);
				mCamera.stopPreview();
				isPreviewing = false;
			}
			if (null != b) {
				android.hardware.Camera.CameraInfo info = new android.hardware.Camera.CameraInfo();
				android.hardware.Camera.getCameraInfo(mCameraId, info);

				Size picSize = mCamera.getParameters().getPictureSize();
				Point ptPoint = com.common.camera.DisplayUtil.getScreenMetrics(mMainActivity);

				float scaleX = ptPoint.x * 1.0f / picSize.height, scaleY = ptPoint.y
						* 1.0f / picSize.width;
				int degrees = 0;
				int rotation = mMainActivity.getWindowManager().getDefaultDisplay()
						.getRotation();
				switch (rotation) {
				case Surface.ROTATION_0:
					degrees = 0;
					break;
				case Surface.ROTATION_90:
					degrees = 90;
					break;
				case Surface.ROTATION_180:
					degrees = 180;
					break;
				case Surface.ROTATION_270:
					degrees = 270;
					break;
				}

				int result;
				if (info.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
					result = (info.orientation + degrees) % 360;
					result = (360 + result) % 360; // compensate the mirror
					scaleX = scaleX * -1;
				} else { // back-facing
					result = (info.orientation - degrees + 360) % 360;
				}

				Bitmap rotaBitmap = com.common.camera.ImageUtil.getRotateBitmap(b, result,
						scaleX, scaleY);
				String pathString = com.common.camera.FileUtil.saveBitmap(rotaBitmap);
				// notify picture save success.
				pictureCaptureNative(true, pathString);
			}
			}
			// mCamera.startPreview();
			// isPreviewing = true;
		
	};

	public native void pictureCaptureNative(boolean b, String path);
}
