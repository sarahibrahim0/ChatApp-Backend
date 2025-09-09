const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🟢 Helper لتحديد نوع resource_type حسب نوع الميديا
const getCloudinaryResourceType = (type) => {
  switch (type) {
    case "image":
      return "image";
    case "video":
      return "video";
    case "voice":   // صوتيات
    case "file":    // ملفات PDF أو أي raw file
      return "raw";
    default:
      return "image";
  }
};

// ✅ رفع ملف واحد
const cloudinaryUploadFile = async (filePath, folder = "chatApp") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto", // يحدد تلقائياً نوع الملف
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

// ✅ حذف ملف واحد حسب نوعه
const cloudinaryRemoveFile = async (publicId, type = "image") => {
  try {
    const resourceType = getCloudinaryResourceType(type);
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error("Internal server error (cloudinaryRemoveFile)");
  }
};

// ✅ حذف مجموعة ملفات حسب نوعها
const cloudinaryRemoveManyFiles = async (files) => {
  try {
    // files = [{ publicId, type }]
    if (!Array.isArray(files)) return;
    const filesByType = files.reduce((acc, file) => {
      const resourceType = getCloudinaryResourceType(file.type);
      if (!acc[resourceType]) acc[resourceType] = [];
      acc[resourceType].push(file.publicId);
      return acc;
    }, {});

    const promises = Object.entries(filesByType).map(([resourceType, publicIds]) =>
      cloudinary.api.delete_resources(publicIds, { resource_type: resourceType })
    );

    return Promise.all(promises);
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
