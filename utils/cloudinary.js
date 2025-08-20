const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUploadFile = async (filePath, folder = "chatApp") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto", // auto = يحدد هل هو image, video, raw (ملفات)
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      type: result.resource_type, // image | video | raw
    };
  } catch (error) {
    throw new Error("Internal server error (cloudinaryUploadFile)");
  }
};

// ✅ رفع أكتر من فايل مرة واحدة
const cloudinaryUploadManyFiles = async (files, folder = "chatApp") => {
  try {
    const uploadPromises = files.map((file) =>
      cloudinaryUploadFile(file, folder)
    );
    return Promise.all(uploadPromises);
  } catch (error) {
    throw new Error("Internal server error (cloudinaryUploadManyFiles)");
  }
};

// ✅ حذف ملف واحد
const cloudinaryRemoveFile = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error("Internal server error (cloudinaryRemoveFile)");
  }
};

// ✅ حذف مجموعة ملفات
const cloudinaryRemoveManyFiles = async (publicIds, resourceType = "image") => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error("Internal server error (cloudinaryRemoveManyFiles)");
  }
};

module.exports = {
  cloudinaryUploadFile,
  cloudinaryUploadManyFiles,
  cloudinaryRemoveFile,
  cloudinaryRemoveManyFiles,
};
