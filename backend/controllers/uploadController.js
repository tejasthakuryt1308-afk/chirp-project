const { cloudinary } = require('../config/cloudinary');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'chirp' },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded))
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url, width: result.width, height: result.height });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
