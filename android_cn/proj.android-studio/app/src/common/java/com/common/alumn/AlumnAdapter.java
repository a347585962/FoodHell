package com.common.alumn;


import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.preference.PreferenceManager;
import android.provider.MediaStore;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;

import com.common.ads.FullScreenAds;
import com.common.android.permission.PermissionHelper;
import com.common.android.permission.PermissionListener;
import com.common.camera.CameraInterface;

import org.cocos2dx.lib.Cocos2dxHelper;


public class AlumnAdapter implements PreferenceManager.OnActivityResultListener {
	public static final int resustCode = 88;
	private static Activity ac = null;
	private static AlumnAdapter ins = null;
	private static final int Alumn_REQUEST_CODE = 101;
	private native void resultPath(String path);

//	public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults){
//		if(requestCode == Alumn_REQUEST_CODE){
//			if(grantResults.length>0&& grantResults[0]== PackageManager.PERMISSION_GRANTED) {
//				try {
//					FullAdsStatus.disEnable();
//					ac.startActivityForResult(new Intent(Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI), resustCode);
//				} catch (Exception e) {
//
//				}
//			}else {
//
//				AlumnAdapter.getInstance().resultPath("");
//			}
//		}
//	}

	public static AlumnAdapter getInstance() {
		if(null == ins)
			ins = new AlumnAdapter();
		return ins;
	}
	
	private AlumnAdapter(){
		Cocos2dxHelper.addOnActivityResultListener(this);
	}
	
	public  void  init(Activity act) {
		ac = act;
	}
	
	public static void openAlumn() {
		if(null != ac){
			FullScreenAds.setFullScreenAdsShowing(true);
			String[] permissons = {android.Manifest.permission.READ_EXTERNAL_STORAGE};
			PermissionHelper.getInstance().requestPermission(ac, new PermissionListener() {
				@Override
				public void onPermissionGranted(String... strings) {
					FullScreenAds.setFullScreenAdsShowing(false);
					try {

						ac.startActivityForResult(new Intent(Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI), resustCode);
						FullScreenAds.setFullScreenAdsShowing(true);
					} catch (Exception var3) {
						;
					}
				}

				@Override
				public void onPermissionDenied() {
					AlumnAdapter.getInstance().resultPath("");
				}
			}, permissons);
//			boolean flag  = ContextCompat.checkSelfPermission(ac, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
//			if(!flag){
//				boolean shouldRequest = !ActivityCompat.shouldShowRequestPermissionRationale(ac, android.Manifest.permission.READ_EXTERNAL_STORAGE);
//				if(shouldRequest&&ac != null){
//					FullAdsStatus.disEnable();
//					ActivityCompat.requestPermissions(ac,new String[]{ Manifest.permission.READ_EXTERNAL_STORAGE},Alumn_REQUEST_CODE);
//				}else
//					AlumnAdapter.getInstance().resultPath("");
//			}else {
//				try {
//
//				} catch (Exception e) {
//
//				}
//			}
		}
	}
	public boolean   onActivityResult(int requestCode, int resultCode, Intent data){
		//FullAdsStatus.enable();
		FullScreenAds.setFullScreenAdsShowing(false);
		   if(requestCode == resustCode && resultCode == Activity.RESULT_OK && null != data){
			   Uri selectedImage = data.getData();
			   String[] filePathColumn = {MediaStore.Images.Media.DATA};
   	           Cursor cursor = ac.getContentResolver().query(selectedImage, filePathColumn, null, null, null);
   	           cursor.moveToFirst(); 
               int columINde = cursor.getColumnIndex(filePathColumn[0]);
               String picPath = cursor.getString(columINde);
               cursor.close();
               System.out.println("picPath==="+picPath);
               if(picPath != null)
            	   resultPath(picPath);
              }
		return true;
	}
}
