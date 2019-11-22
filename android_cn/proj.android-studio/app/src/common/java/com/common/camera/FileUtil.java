package com.common.camera;

import java.io.BufferedOutputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

import android.R.integer;
import android.graphics.Bitmap;
import android.os.Environment;
import android.text.StaticLayout;
import android.util.Log;
import com.common.android.jni.STSystemFunction;

public class FileUtil {
	private static final String TAG = "FileUtil";
	private static final File parentPath = Environment
			.getExternalStorageDirectory();
	private static String storagePath = "";
	private static final String DST_FOLDER_NAME = "PlayCamera";

	private static int i = 0;
	/**
	 * ��ʼ������·��
	 * 
	 * @return
	 */
	private static String initPath() {
		if (storagePath.equals("")) {
			storagePath = parentPath.getAbsolutePath() + "/" + DST_FOLDER_NAME;
			File f = new File(storagePath);
			if (!f.exists()) {
				f.mkdir();
			}
		}
		return storagePath;
	}

	/**
	 * ����Bitmap��sdcard
	 * 
	 * @param b
	 * @throws FileNotFoundException 
	 */
	public static String saveBitmap(Bitmap b) {
		String path = STSystemFunction.getInstance().getSdCardPath();
		;// initPath();
		long dataTake = System.currentTimeMillis();
		String jpegName =  path + "/" + "camera" + i + ".jpg";
		Log.i(TAG, "saveBitmap:jpegName = " + jpegName);
	
		try {
			File f = new File(jpegName);
			if (f.exists()) {
				if (!f.delete()) {
					System.out.println("请关闭使用该文件的所有进程或者流！！");
				} else {
					System.out.println(f.getAbsolutePath() + " 成功被删除！");
				}
			}
		} catch (Exception e) {
			// TODO: handle exception
		}
		
		i = (i + 1) % 2;
		jpegName = path + "/" + "camera" + i + ".jpg";
		try {
			FileOutputStream fout = new FileOutputStream(jpegName);
			BufferedOutputStream bos = new BufferedOutputStream(fout);
			b.compress(Bitmap.CompressFormat.JPEG, 100, bos);
			bos.flush();
			bos.close();
			return jpegName;
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return "";
		}

	}

}
